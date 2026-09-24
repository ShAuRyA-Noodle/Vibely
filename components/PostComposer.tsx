"use client";

import { createPostAction, MediaInput } from "@/lib/actions/posts";
import { checkPostContentAction } from "@/lib/actions/moderation";
import type { ModerationResult } from "@/lib/moderation/proofguard";
import { UserDTO } from "@/lib/actions/users";
import { ImagePlus, Loader2, Video, X, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";
import ProfilePhoto from "./shared/ProfilePhoto";
import ModerationPreview from "./moderation/ModerationPreview";

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function validateFiles(files: File[]) {
  if (files.length > MAX_IMAGES)
    throw new Error("Choose up to 4 images or 1 video.");
  const imageFiles = files.filter((f) => f.type.startsWith("image/"));
  const videoFiles = files.filter((f) => f.type.startsWith("video/"));
  if (imageFiles.length + videoFiles.length !== files.length)
    throw new Error("Only image and video uploads are supported.");
  if (videoFiles.length > 1 || (videoFiles.length === 1 && files.length > 1))
    throw new Error("Choose either 1 video or up to 4 images.");
  for (const f of imageFiles)
    if (f.size > MAX_IMAGE_BYTES)
      throw new Error("Images must be 8MB or smaller.");
  for (const f of videoFiles)
    if (f.size > MAX_VIDEO_BYTES)
      throw new Error("Videos must be 50MB or smaller.");
}

async function uploadFiles(files: File[]): Promise<MediaInput[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const p = await response.json().catch(() => null);
    throw new Error(p?.error || "Media upload failed.");
  }
  return ((await response.json()) as { media: MediaInput[] }).media;
}

export default function PostComposer({ user }: { user: UserDTO }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [moderationChecking, setModerationChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced moderation preview — runs as user types
  useEffect(() => {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length < 3) {
      setModerationResult(null);
      setModerationChecking(false);
      return;
    }
    setModerationChecking(true);
    const timer = setTimeout(async () => {
      try {
        const result = await checkPostContentAction({ body: trimmed, media: [] });
        setModerationResult(result);
      } catch {
        setModerationResult(null);
      } finally {
        setModerationChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [body]);

  useEffect(() => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;
    try {
      validateFiles([...files, ...selectedFiles]);
      setFiles((prev) => [...prev, ...selectedFiles]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid media.");
    }
    if (event.target) event.target.value = "";
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text && files.length === 0) {
      toast.error("Add an update, image, or video before posting.");
      return;
    }
    // Pre-submit moderation gate
    if (moderationResult?.decision === "block") {
      toast.error("ProofGuard blocked this post. Edit your content to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const media = files.length > 0 ? await uploadFiles(files) : [];
      await createPostAction({ body: text, media });
      setBody("");
      setFiles([]);
      setModerationResult(null);
      setIsOpen(false);
      router.refresh();
      toast.success("Posted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Post failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full surface-elevated p-4 text-left hover:bg-muted transition-colors press"
      >
        <div className="flex items-center gap-3">
          <ProfilePhoto src={user.avatarUrl} name={user.name} />
          <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-[14px] text-muted-foreground">
            What&apos;s on your mind?
          </div>
          <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted hover:text-primary transition-colors">
              <ImagePlus size={17} strokeWidth={2} />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted hover:text-primary transition-colors">
              <Video size={17} strokeWidth={2} />
            </span>
          </div>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm animate-fade-in"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none animate-fade-up">
            <div className="w-full max-w-lg pointer-events-auto surface-elevated shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[16px] font-semibold text-foreground tracking-tight">
                  Create post
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <ProfilePhoto src={user.avatarUrl} name={user.name} />
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Posting to everyone
                    </p>
                  </div>
                </div>

                <textarea
                  autoFocus
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a caption… share an accomplishment, project update, or thought."
                  rows={4}
                  maxLength={3000}
                  className="w-full resize-none bg-transparent px-0.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
                />

                {/* Live ProofGuard feedback */}
                <ModerationPreview
                  result={moderationResult}
                  loading={moderationChecking}
                />

                {files.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-video"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={previews[i]}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video size={28} className="text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-foreground/80 text-background opacity-0 group-hover:opacity-100 transition-opacity press"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={isSubmitting || files.length >= MAX_IMAGES}
                      className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted hover:text-primary transition-colors disabled:opacity-50 press"
                      title="Add photo or video"
                    >
                      <ImagePlus size={17} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info("Polls feature coming soon.")}
                      className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted hover:text-primary transition-colors press"
                      title="Create poll"
                    >
                      <BarChart2 size={17} strokeWidth={2} />
                    </button>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={onFileChange}
                      className="hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (!body.trim() && files.length === 0) ||
                      moderationResult?.decision === "block"
                    }
                    className="btn-primary press relative disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={15} className="animate-spin" />
                      </span>
                    )}
                    <span className={isSubmitting ? "opacity-0" : ""}>Post</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
