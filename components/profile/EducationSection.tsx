"use client";

import { EducationDTO } from "@/lib/actions/education";
import {
  addEducationAction,
  deleteEducationAction,
  updateEducationAction,
} from "@/lib/actions/education";
import { GraduationCap, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

function formatDate(iso: string | null) {
  if (!iso) return "Present";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function EducationForm({
  initial,
  onClose,
}: {
  initial?: EducationDTO;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const current = formData.get("current") === "on";
    formData.set("current", current ? "true" : "false");

    startTransition(async () => {
      try {
        if (initial) {
          await updateEducationAction(initial.id, formData);
          toast.success("Education updated.");
        } else {
          await addEducationAction(formData);
          toast.success("Education added.");
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
          {initial ? "Edit education" : "Add education"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
        >
          <X size={15} />
        </button>
      </div>
      <input
        name="institution"
        defaultValue={initial?.institution}
        placeholder="Institution *"
        required
        className="input-base w-full"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="degree"
          defaultValue={initial?.degree}
          placeholder="Degree"
          className="input-base"
        />
        <input
          name="fieldOfStudy"
          defaultValue={initial?.fieldOfStudy}
          placeholder="Field of study"
          className="input-base"
        />
      </div>
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
        Currently enrolled
      </label>
      <input
        name="grade"
        defaultValue={initial?.grade}
        placeholder="Grade / GPA"
        className="input-base w-full"
      />
      <textarea
        name="description"
        defaultValue={initial?.description}
        placeholder="Description"
        maxLength={500}
        rows={3}
        className="input-base w-full resize-none"
      />
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

export default function EducationSection({
  items,
  isSelf,
}: {
  items: EducationDTO[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteEducationAction(id);
        router.refresh();
        toast.success("Education removed.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Education
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
        <EducationForm onClose={() => setShowForm(false)} />
      )}

      {items.length === 0 && !showForm && (
        <div className="surface-elevated p-8 text-center">
          <p className="text-[13px] text-muted-foreground">
            No education entries yet.
          </p>
        </div>
      )}

      {items.map((item) =>
        editingId === item.id ? (
          <EducationForm
            key={item.id}
            initial={item}
            onClose={() => setEditingId(null)}
          />
        ) : (
          <div
            key={item.id}
            className="surface-elevated flex gap-3 p-5"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap size={17} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[14.5px] font-semibold text-foreground">
                {item.institution}
              </h3>
              {(item.degree || item.fieldOfStudy) && (
                <p className="text-[13px] text-foreground/80">
                  {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="text-[12px] text-muted-foreground tabular-nums">
                {formatDate(item.startDate)} –{" "}
                {item.current ? "Present" : formatDate(item.endDate)}
              </p>
              {item.grade && (
                <p className="text-[12px] text-muted-foreground">
                  Grade: {item.grade}
                </p>
              )}
              {item.description && (
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/75">
                  {item.description}
                </p>
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
