"use client";

import { ReactionType } from "@/models/reaction.model";
import { useState } from "react";

const REACTION_EMOJI: Record<ReactionType, string> = {
  fire: "\u{1F525}",
  heart: "\u2764\uFE0F",
  mindblown: "\u{1F92F}",
  clap: "\u{1F44F}",
  laugh: "\u{1F602}",
  sad: "\u{1F622}",
};

const REACTION_LABELS: Record<ReactionType, string> = {
  fire: "Fire",
  heart: "Love",
  mindblown: "Mind Blown",
  clap: "Clap",
  laugh: "Haha",
  sad: "Sad",
};

export function ReactionPicker({
  currentReaction,
  onReact,
  disabled,
}: {
  currentReaction: ReactionType | null;
  onReact: (type: ReactionType) => void;
  disabled: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShowPicker(true)}
      onMouseLeave={() => setShowPicker(false)}
    >
      <button
        type="button"
        onClick={() => onReact(currentReaction || "heart")}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all press ${
          currentReaction
            ? "text-primary bg-primary/[0.08]"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <span className="text-base">
          {currentReaction
            ? REACTION_EMOJI[currentReaction]
            : REACTION_EMOJI.heart}
        </span>
        <span className="hidden sm:inline">
          {currentReaction ? REACTION_LABELS[currentReaction] : "React"}
        </span>
      </button>

      {showPicker && (
        <div className="absolute bottom-full left-0 z-50 mb-2 flex gap-0.5 rounded-xl border border-border bg-card px-1.5 py-1.5 shadow-xl animate-fade-up">
          {(Object.keys(REACTION_EMOJI) as ReactionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onReact(type);
                setShowPicker(false);
              }}
              disabled={disabled}
              title={REACTION_LABELS[type]}
              className={`grid h-9 w-9 place-items-center rounded-lg text-xl transition-all duration-150 ease-apple hover:scale-[1.2] hover:bg-muted press ${
                currentReaction === type ? "bg-primary/[0.08]" : ""
              }`}
            >
              {REACTION_EMOJI[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
