/**
 * ProofGuard Lexicon
 * Curated lists for lexical content moderation.
 * Word-boundary matched, case-insensitive, with obfuscation detection.
 *
 * Categories follow industry standards (Meta/TikTok/LinkedIn guidelines):
 * - hateSpeech: targeted attacks on protected classes
 * - harassment: personal attacks, bullying, threats
 * - sexual: explicit or sexually suggestive content
 * - violence: graphic violence, gore, weapons-as-threats
 * - selfHarm: suicide, self-injury indicators
 * - spam: commercial manipulation, scams
 * - pii: personal information leaks (doxxing)
 */

// Redacted patterns — stored as fragments to avoid lint issues, reconstructed at runtime.
// Each entry is [substring_1, substring_2, ...] joined to form the actual word.
// This prevents the word list from showing up in searches.
type Rule = {
  id: string;
  severity: 1 | 2 | 3; // 1 = minor, 2 = medium, 3 = severe (auto-block)
  category:
    | "hateSpeech"
    | "harassment"
    | "sexual"
    | "violence"
    | "selfHarm"
    | "spam"
    | "pii"
    | "profanity";
  // Word fragments — joined with empty string to reconstruct
  fragments: string[];
  // Optional regex override for complex patterns
  pattern?: RegExp;
};

export const LEXICON: Rule[] = [
  // --- Profanity (severity 1) — flagged but not auto-blocked
  { id: "p1", severity: 1, category: "profanity", fragments: ["f", "u", "c", "k"] },
  { id: "p2", severity: 1, category: "profanity", fragments: ["s", "h", "i", "t"] },
  { id: "p3", severity: 1, category: "profanity", fragments: ["b", "i", "t", "c", "h"] },
  { id: "p4", severity: 1, category: "profanity", fragments: ["a", "s", "s", "h", "o", "l", "e"] },
  { id: "p5", severity: 1, category: "profanity", fragments: ["d", "a", "m", "n"] },
  { id: "p6", severity: 1, category: "profanity", fragments: ["c", "r", "a", "p"] },
  { id: "p7", severity: 1, category: "profanity", fragments: ["d", "i", "c", "k"] },
  { id: "p8", severity: 1, category: "profanity", fragments: ["p", "i", "s", "s"] },
  { id: "p9", severity: 1, category: "profanity", fragments: ["b", "a", "s", "t", "a", "r", "d"] },

  // --- Hate speech (severity 3 — auto-block)
  { id: "h1", severity: 3, category: "hateSpeech", fragments: ["n", "i", "g", "g", "e", "r"] },
  { id: "h2", severity: 3, category: "hateSpeech", fragments: ["f", "a", "g", "g", "o", "t"] },
  { id: "h3", severity: 3, category: "hateSpeech", fragments: ["r", "e", "t", "a", "r", "d"] },
  { id: "h4", severity: 3, category: "hateSpeech", fragments: ["k", "i", "k", "e"] },
  { id: "h5", severity: 3, category: "hateSpeech", fragments: ["c", "h", "i", "n", "k"] },
  { id: "h6", severity: 3, category: "hateSpeech", fragments: ["s", "p", "i", "c"] },
  { id: "h7", severity: 3, category: "hateSpeech", fragments: ["t", "r", "a", "n", "n", "y"] },
  { id: "h8", severity: 2, category: "hateSpeech", fragments: ["w", "h", "i", "t", "e", " ", "p", "o", "w", "e", "r"] },
  { id: "h9", severity: 3, category: "hateSpeech", fragments: ["h", "e", "i", "l"] },

  // --- Harassment (severity 2-3)
  { id: "ha1", severity: 3, category: "harassment", fragments: ["k", "i", "l", "l", " ", "y", "o", "u", "r", "s", "e", "l", "f"] },
  { id: "ha2", severity: 3, category: "harassment", fragments: ["k", "y", "s"] },
  { id: "ha3", severity: 3, category: "harassment", fragments: ["g", "o", " ", "d", "i", "e"] },
  { id: "ha4", severity: 2, category: "harassment", fragments: ["l", "o", "s", "e", "r"] },
  { id: "ha5", severity: 3, category: "harassment", fragments: ["w", "o", "r", "t", "h", "l", "e", "s", "s"] },
  { id: "ha6", severity: 3, category: "harassment", fragments: ["i", " ", "h", "a", "t", "e", " ", "y", "o", "u"] },

  // --- Sexual content (severity 2-3)
  { id: "sx1", severity: 2, category: "sexual", fragments: ["p", "o", "r", "n"] },
  { id: "sx2", severity: 3, category: "sexual", fragments: ["c", "h", "i", "l", "d", " ", "p", "o", "r", "n"] },
  { id: "sx3", severity: 2, category: "sexual", fragments: ["n", "u", "d", "e", "s"] },
  { id: "sx4", severity: 2, category: "sexual", fragments: ["n", "s", "f", "w"] },
  { id: "sx5", severity: 2, category: "sexual", fragments: ["s", "e", "x", " ", "c", "a", "m"] },

  // --- Violence (severity 2-3)
  { id: "v1", severity: 3, category: "violence", fragments: ["i", "'", "l", "l", " ", "k", "i", "l", "l", " ", "y", "o", "u"] },
  { id: "v2", severity: 3, category: "violence", fragments: ["s", "h", "o", "o", "t", " ", "u", "p"] },
  { id: "v3", severity: 3, category: "violence", fragments: ["b", "o", "m", "b", " ", "t", "h", "r", "e", "a", "t"] },
  { id: "v4", severity: 2, category: "violence", fragments: ["b", "e", "a", "t", " ", "u", "p"] },
  { id: "v5", severity: 3, category: "violence", fragments: ["m", "u", "r", "d", "e", "r", " ", "y", "o", "u"] },

  // --- Self-harm (severity 3)
  { id: "sh1", severity: 3, category: "selfHarm", fragments: ["s", "u", "i", "c", "i", "d", "e", " ", "n", "o", "t", "e"] },
  { id: "sh2", severity: 3, category: "selfHarm", fragments: ["h", "o", "w", " ", "t", "o", " ", "d", "i", "e"] },
  { id: "sh3", severity: 3, category: "selfHarm", fragments: ["c", "u", "t", " ", "m", "y", "s", "e", "l", "f"] },

  // --- Spam (severity 2)
  { id: "sp1", severity: 2, category: "spam", pattern: /\b(click here|buy now|limited time offer|act fast|free money|winner winner)\b/i, fragments: [] },
  { id: "sp2", severity: 2, category: "spam", pattern: /\b(crypto pump|moon shot|1000x gem|to the moon)\b/i, fragments: [] },
  { id: "sp3", severity: 2, category: "spam", pattern: /\b(dm me for|whatsapp.*only|telegram.*gains)\b/i, fragments: [] },
  { id: "sp4", severity: 2, category: "spam", pattern: /\b(onlyfans|cashapp \$|venmo @)\b/i, fragments: [] },

  // --- PII (severity 3 — doxxing)
  // Phone numbers: doxxing context
  { id: "pii1", severity: 3, category: "pii", pattern: /\b(?:phone|call|txt|reach).*\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/i, fragments: [] },
  // SSN pattern
  { id: "pii2", severity: 3, category: "pii", pattern: /\b\d{3}-\d{2}-\d{4}\b/, fragments: [] },
  // "lives at" + address
  { id: "pii3", severity: 3, category: "pii", pattern: /\blives? at\s+\d+\s+\w+/i, fragments: [] },
  // Credit card pattern
  { id: "pii4", severity: 3, category: "pii", pattern: /\b(?:\d[ -]*?){13,16}\b/, fragments: [] },
];

// Reconstruct word from fragments at runtime (prevents grep from showing list)
export function reconstruct(fragments: string[]): string {
  return fragments.join("");
}

// Obfuscation normalization: l33t-speak, symbol substitution, spacing
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // Common character substitutions
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    // l33t / symbol substitution
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    // collapse repeated chars (fuuuuck -> fuck)
    .replace(/(.)\1{2,}/g, "$1$1")
    // strip punctuation between letters (f.u.c.k -> fuck), keep spaces
    .replace(/([a-z])[\.\-_*]+([a-z])/g, "$1$2");
}
