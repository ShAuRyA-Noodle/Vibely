"use client";

import { SkillDTO, addSkillAction, removeSkillAction } from "@/lib/actions/skills";
import { SkillCategory } from "@/models/skill.model";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  technical: "Technical",
  soft: "Soft Skills",
  tool: "Tools",
  language: "Languages",
};

export default function SkillsSection({
  items,
  isSelf,
}: {
  items: SkillDTO[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("technical");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await addSkillAction(name.trim(), category);
        router.refresh();
        toast.success("Skill added.");
        setName("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add skill.");
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      try {
        await removeSkillAction(id);
        router.refresh();
        toast.success("Skill removed.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove.");
      }
    });
  }

  const grouped = Object.entries(CATEGORY_LABELS)
    .map(([cat, label]) => ({
      category: cat as SkillCategory,
      label,
      skills: items.filter((s) => s.category === cat),
    }))
    .filter((g) => g.skills.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Skills
        </h2>
        {isSelf && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
          >
            <Plus size={15} />
          </button>
        )}
      </div>

      {showForm && isSelf && (
        <form onSubmit={onSubmit} className="surface-elevated p-5 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Skill name"
            maxLength={50}
            className="input-base w-full"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SkillCategory)}
            className="input-base w-full"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-card">
                {label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary press disabled:opacity-50"
            >
              {isPending ? "Adding…" : "Add skill"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary press"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {items.length === 0 && !showForm && (
        <div className="surface-elevated p-8 text-center">
          <p className="text-[13px] text-muted-foreground">No skills added yet.</p>
        </div>
      )}

      {grouped.map((group) => (
        <div key={group.category} className="surface-elevated p-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[12px] font-medium text-foreground"
              >
                {skill.name}
                {isSelf && (
                  <button
                    type="button"
                    onClick={() => handleRemove(skill.id)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={11} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
