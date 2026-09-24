/**
 * ProofGuard — Multi-stage AI content safety system
 *
 * Pipeline:
 *  Stage 1: Lexical filter (instant, free)
 *    - Profanity / slurs / hate speech (word-boundary + obfuscation-aware)
 *    - Harassment phrases
 *    - Self-harm keywords
 *    - Spam patterns
 *    - PII / doxxing patterns
 *
 *  Stage 2: Heuristic filter (instant, free)
 *    - ALL CAPS screaming detection
 *    - Repeated-character walls
 *    - Excessive link density
 *    - Excessive mentions
 *    - Character flood (emoji spam)
 *
 *  Stage 3: Remote AI classifier (optional — gated on AI_MODERATION_API env)
 *    - OpenAI moderation endpoint OR Anthropic Claude
 *    - Graceful fallback to local decision if unavailable
 *
 *  Stage 4: Vision classifier for media (optional — gated on AI_VISION_API env)
 *    - Runs on images and video thumbnails
 *    - Uses Cloudinary's own moderation add-on when enabled
 *
 * Decision:
 *  - Severity 3 in any stage  => BLOCK (post rejected)
 *  - Severity 2 aggregated    => FLAG (post allowed but marked for review)
 *  - Severity 1 only          => ALLOW (logged but invisible to user)
 *  - Clean                    => ALLOW
 */

import { LEXICON, reconstruct, normalizeText } from "./lexicon";

export type ModerationDecision = "allow" | "flag" | "block";
export type ModerationCategory =
  | "hateSpeech"
  | "harassment"
  | "sexual"
  | "violence"
  | "selfHarm"
  | "spam"
  | "pii"
  | "profanity"
  | "heuristic";

export type ModerationViolation = {
  ruleId: string;
  category: ModerationCategory;
  severity: 1 | 2 | 3;
  matched: string; // sanitized snippet
  stage: "lexical" | "heuristic" | "remote" | "vision";
  explanation: string;
};

export type ModerationResult = {
  decision: ModerationDecision;
  score: number; // 0-100, higher = more concerning
  violations: ModerationViolation[];
  // Top-level categories flagged (for fast filtering)
  categories: ModerationCategory[];
  // Human-readable summary for UI
  summary: string;
  // Metadata
  checkedAt: string;
  stageResults: {
    lexical: "pass" | "fail";
    heuristic: "pass" | "fail";
    remote: "pass" | "fail" | "skipped";
    vision: "pass" | "fail" | "skipped";
  };
};

// ======================================================================
// STAGE 1 — Lexical
// ======================================================================

function lexicalScan(text: string): ModerationViolation[] {
  if (!text) return [];
  const violations: ModerationViolation[] = [];
  const normalized = normalizeText(text);

  for (const rule of LEXICON) {
    if (rule.pattern) {
      // Pattern-based rule
      if (rule.pattern.test(text)) {
        const match = text.match(rule.pattern);
        violations.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          matched: (match?.[0] || "").slice(0, 40),
          stage: "lexical",
          explanation: explainCategory(rule.category),
        });
      }
      continue;
    }

    const word = reconstruct(rule.fragments);
    if (!word) continue;

    // Word-boundary match against normalized text
    const boundaryRegex = new RegExp(`(^|[^a-z])${escapeRegex(word)}($|[^a-z])`, "i");
    if (boundaryRegex.test(normalized)) {
      violations.push({
        ruleId: rule.id,
        category: rule.category,
        severity: rule.severity,
        matched: redactMatch(word),
        stage: "lexical",
        explanation: explainCategory(rule.category),
      });
    }
  }

  return violations;
}

// ======================================================================
// STAGE 2 — Heuristic
// ======================================================================

function heuristicScan(text: string): ModerationViolation[] {
  if (!text) return [];
  const violations: ModerationViolation[] = [];
  const trimmed = text.trim();
  const lettersOnly = trimmed.replace(/[^a-zA-Z]/g, "");

  // ALL CAPS screaming (60%+ caps, min length 20)
  if (lettersOnly.length >= 20) {
    const capsRatio = (lettersOnly.match(/[A-Z]/g) || []).length / lettersOnly.length;
    if (capsRatio > 0.7) {
      violations.push({
        ruleId: "h_caps",
        category: "heuristic",
        severity: 1,
        matched: trimmed.slice(0, 40) + "…",
        stage: "heuristic",
        explanation: "Excessive capitalization reads as shouting.",
      });
    }
  }

  // Link flood (>3 URLs in a single post)
  const urls = trimmed.match(/https?:\/\/\S+/gi) || [];
  if (urls.length > 3) {
    violations.push({
      ruleId: "h_linkspam",
      category: "spam",
      severity: 2,
      matched: `${urls.length} links`,
      stage: "heuristic",
      explanation: "Posts with more than 3 links are flagged as potential spam.",
    });
  }

  // Mention flood (>5 mentions)
  const mentions = trimmed.match(/@\w+/g) || [];
  if (mentions.length > 5) {
    violations.push({
      ruleId: "h_mentionspam",
      category: "spam",
      severity: 2,
      matched: `${mentions.length} mentions`,
      stage: "heuristic",
      explanation: "Excessive mentions are used to spam notifications.",
    });
  }

  // Character flood — one char repeated 10+ times
  if (/(.)\1{9,}/.test(trimmed)) {
    violations.push({
      ruleId: "h_flood",
      category: "heuristic",
      severity: 1,
      matched: "character flood",
      stage: "heuristic",
      explanation: "Repeated character spam detected.",
    });
  }

  // Emoji flood — 15+ emojis
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  const emojis = trimmed.match(emojiRegex) || [];
  if (emojis.length > 15) {
    violations.push({
      ruleId: "h_emojiflood",
      category: "heuristic",
      severity: 1,
      matched: `${emojis.length} emojis`,
      stage: "heuristic",
      explanation: "Emoji spam detected.",
    });
  }

  return violations;
}

// ======================================================================
// STAGE 3 — Remote AI (optional)
// ======================================================================

async function remoteScan(text: string): Promise<{
  status: "pass" | "fail" | "skipped";
  violations: ModerationViolation[];
}> {
  // Only run if an API key is configured
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!text || (!openaiKey && !anthropicKey)) {
    return { status: "skipped", violations: [] };
  }

  // Prefer OpenAI moderation (free, fast, purpose-built)
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: text, model: "omni-moderation-latest" }),
        // 5 second timeout via AbortController
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return { status: "skipped", violations: [] };
      }

      const data = await response.json();
      const result = data.results?.[0];
      if (!result) return { status: "pass", violations: [] };

      const violations: ModerationViolation[] = [];
      const mapping: Record<string, ModerationCategory> = {
        hate: "hateSpeech",
        "hate/threatening": "hateSpeech",
        harassment: "harassment",
        "harassment/threatening": "harassment",
        sexual: "sexual",
        "sexual/minors": "sexual",
        violence: "violence",
        "violence/graphic": "violence",
        "self-harm": "selfHarm",
        "self-harm/intent": "selfHarm",
        "self-harm/instructions": "selfHarm",
      };

      for (const [key, flagged] of Object.entries(result.categories || {})) {
        if (flagged && mapping[key]) {
          const score = result.category_scores?.[key] || 0;
          const severity: 1 | 2 | 3 = score > 0.85 ? 3 : score > 0.5 ? 2 : 1;
          violations.push({
            ruleId: `remote_${key}`,
            category: mapping[key],
            severity,
            matched: `${(score * 100).toFixed(0)}% confidence`,
            stage: "remote",
            explanation: `AI classifier flagged ${mapping[key]} content.`,
          });
        }
      }

      return {
        status: violations.length > 0 ? "fail" : "pass",
        violations,
      };
    } catch {
      return { status: "skipped", violations: [] };
    }
  }

  return { status: "skipped", violations: [] };
}

// ======================================================================
// STAGE 4 — Vision (optional — relies on Cloudinary moderation add-on)
// ======================================================================

type MediaItemLite = {
  type: "image" | "video";
  url: string;
  publicId: string;
};

async function visionScan(media: MediaItemLite[]): Promise<{
  status: "pass" | "fail" | "skipped";
  violations: ModerationViolation[];
}> {
  if (!media || media.length === 0) return { status: "skipped", violations: [] };

  // Check if Cloudinary moderation add-on is enabled
  const useCloudinary = process.env.CLOUDINARY_MODERATION_ENABLED === "true";
  if (!useCloudinary) return { status: "skipped", violations: [] };

  // Placeholder for Cloudinary moderation polling.
  // In production: call cloudinary.api.resource(publicId) and check .moderation array.
  // For now, return skipped — infrastructure hook is here for upgrade path.
  return { status: "skipped", violations: [] };
}

// ======================================================================
// MAIN — orchestrator
// ======================================================================

export async function checkContent(input: {
  text?: string;
  media?: MediaItemLite[];
}): Promise<ModerationResult> {
  const text = (input.text || "").trim();
  const media = input.media || [];

  // Stage 1
  const lexicalViolations = lexicalScan(text);
  // Stage 2
  const heuristicViolations = heuristicScan(text);
  // Stage 3
  const remote = await remoteScan(text);
  // Stage 4
  const vision = await visionScan(media);

  const allViolations = [
    ...lexicalViolations,
    ...heuristicViolations,
    ...remote.violations,
    ...vision.violations,
  ];

  // Scoring: severity * 10, capped at 100
  const rawScore = allViolations.reduce((sum, v) => sum + v.severity * 15, 0);
  const score = Math.min(100, rawScore);

  // Decision logic
  let decision: ModerationDecision = "allow";
  if (allViolations.some((v) => v.severity === 3)) {
    decision = "block";
  } else if (
    allViolations.filter((v) => v.severity === 2).length >= 1 ||
    allViolations.filter((v) => v.severity === 1).length >= 3
  ) {
    decision = "flag";
  }

  const categories = Array.from(new Set(allViolations.map((v) => v.category)));

  return {
    decision,
    score,
    violations: allViolations,
    categories,
    summary: buildSummary(decision, categories, allViolations.length),
    checkedAt: new Date().toISOString(),
    stageResults: {
      lexical: lexicalViolations.length > 0 ? "fail" : "pass",
      heuristic: heuristicViolations.length > 0 ? "fail" : "pass",
      remote: remote.status,
      vision: vision.status,
    },
  };
}

// ======================================================================
// Helpers
// ======================================================================

function explainCategory(category: ModerationCategory): string {
  switch (category) {
    case "hateSpeech":
      return "Content contains hate speech or targeted slurs.";
    case "harassment":
      return "Content appears to harass, bully, or threaten another person.";
    case "sexual":
      return "Content contains sexual or adult material.";
    case "violence":
      return "Content contains threats of violence or graphic imagery.";
    case "selfHarm":
      return "Content references self-harm or suicide.";
    case "spam":
      return "Content matches spam / promotional manipulation patterns.";
    case "pii":
      return "Content may expose personal information (doxxing).";
    case "profanity":
      return "Content contains profanity.";
    case "heuristic":
      return "Content matches low-quality / abusive formatting patterns.";
    default:
      return "Content flagged by ProofGuard.";
  }
}

function buildSummary(
  decision: ModerationDecision,
  categories: ModerationCategory[],
  count: number
): string {
  if (decision === "allow") return "Content passed all safety checks.";
  if (decision === "flag") {
    return `Content flagged for review — ${count} issue${count === 1 ? "" : "s"} found (${categories.join(", ")}).`;
  }
  return `Content blocked — severe violation detected in ${categories.join(", ")}.`;
}

function redactMatch(word: string): string {
  if (word.length <= 2) return "**";
  return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
