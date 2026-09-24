"use client";

import {
  ExperienceDTO,
  addExperienceAction,
  deleteExperienceAction,
  updateExperienceAction,
} from "@/lib/actions/experience";
import { ExperienceType } from "@/models/experience.model";
import {
  Briefcase,
  Code,
  FlaskConical,
  HandHeart,
  Pencil,
  Plus,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

const TYPE_LABELS: Record<ExperienceType, string> = {
  work: "Work",
  project: "Project",
  research: "Research",
  volunteer: "Volunteer",
};

const TYPE_ICONS: Record<ExperienceType, typeof Briefcase> = {
  work: Briefcase,
  project: Code,
  research: FlaskConical,
  volunteer: HandHeart,
};

function formatDate(iso: string | null) {
  if (!iso) return "Present";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function ExperienceForm({
  initial,
  onClose,
}: {
  initial?: ExperienceDTO;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [skills, setSkills] = useState<string[]>(initial?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  function addSkill() {
    const s = skillInput.trim().slice(0, 50);
    if (s && skills.length < 10 && !skills.includes(s))
      setSkills([...skills, s]);
    setSkillInput("");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const current = fd.get("current") === "on";
    const input = {
      type: (fd.get("type") as ExperienceType) || "project",
      title: String(fd.get("title") || "").trim(),
      organization: String(fd.get("organization") || "").trim(),
      startDate: String(fd.get("startDate") || ""),
      endDate: current
        ? undefined
        : String(fd.get("endDate") || "") || undefined,
      current,
      description: String(fd.get("description") || "").trim(),
      skills,
      media: initial?.media || [],
      projectUrl: String(fd.get("projectUrl") || "").trim(),
    };

    startTransition(async () => {
      try {
        if (initial) {
          await updateExperienceAction(initial.id, input);
          toast.success("Experience updated.");
        } else {
          await addExperienceAction(input);
          toast.success("Experience added.");
        }
        router.refresh();
        onClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="surface-elevated p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-foreground">
          {initial ? "Edit experience" : "Add experience"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
        >
          <X size={15} />
        </button>
      </div>
      <select
        name="type"
        defaultValue={initial?.type || "project"}
        className="input-base w-full"
      >
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value} className="bg-card">
            {label}
          </option>
        ))}
      </select>
      <input
        name="title"
        defaultValue={initial?.title}
        placeholder="Title *"
        required
        className="input-base w-full"
      />
      <input
        name="organization"
        defaultValue={initial?.organization}
        placeholder="Organization / Company"
        className="input-base w-full"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="startDate"
          type="month"
          defaultValue={initial?.startDate?.slice(0, 7)}
          required
          className="input-base"
        />
        <input
          name="endDate"
          type="month"
          defaultValue={initial?.endDate?.slice(0, 7) || ""}
          className="input-base"
        />
      </div>
      <label className="flex items-center gap-2 text-[13px] text-foreground">
        <input
          type="checkbox"
          name="current"
          defaultChecked={initial?.current}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Currently working here
      </label>
      <textarea
        name="description"
        defaultValue={initial?.description}
        placeholder="Description"
        maxLength={1000}
        rows={4}
        className="input-base w-full resize-none"
      />
      <input
        name="projectUrl"
        defaultValue={initial?.projectUrl}
        placeholder="Project URL"
        className="input-base w-full"
      />
      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
          Skills ({skills.length}/10)
        </p>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add a skill"
            className="input-base flex-1"
          />
          <button
            type="button"
            onClick={addSkill}
            className="btn-secondary press"
          >
            Add
          </button>
        </div>
        {skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[12px] font-medium text-foreground"
              >
                {s}
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((x) => x !== s))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary press disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export default function ExperienceSection({
  items,
  isSelf,
}: {
  items: ExperienceDTO[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteExperienceAction(id);
        router.refresh();
        toast.success("Experience removed.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Experience
        </h2>
        {isSelf && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
          >
            <Plus size={15} />
          </button>
        )}
      </div>

      {showForm && !editingId && (
        <ExperienceForm onClose={() => setShowForm(false)} />
      )}

      {items.length === 0 && !showForm && (
        <div className="surface-elevated p-8 text-center">
          <p className="text-[13px] text-muted-foreground">
            No experience entries yet.
          </p>
        </div>
      )}

      {items.map((item) =>
        editingId === item.id ? (
          <ExperienceForm
            key={item.id}
            initial={item}
            onClose={() => setEditingId(null)}
          />
        ) : (
          <div key={item.id} className="surface-elevated flex gap-3 p-5">
            {(() => {
              const Icon = TYPE_ICONS[item.type];
              return (
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={17} strokeWidth={2} />
                </div>
              );
            })()}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[14.5px] font-semibold text-foreground">
                  {item.title}
                </h3>
                <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {TYPE_LABELS[item.type]}
                </span>
              </div>
              {item.organization && (
                <p className="text-[13px] text-foreground/80">
                  {item.organization}
                </p>
              )}
              <p className="text-[12px] text-muted-foreground tabular-nums">
                {formatDate(item.startDate)} –{" "}
                {item.current ? "Present" : formatDate(item.endDate)}
              </p>
              {item.description && (
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/75">
                  {item.description}
                </p>
              )}
              {item.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {item.projectUrl && (
                <Link
                  href={item.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                >
                  View project <ExternalLink size={11} />
                </Link>
              )}
            </div>
            {isSelf && (
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingId(item.id)}
                  disabled={isPending}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors press"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
