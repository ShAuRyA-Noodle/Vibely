"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

export default function OnboardingWizard({
  user,
  action,
}: {
  user: { handle: string };
  action: (formData: FormData) => void;
}) {
  const [step, setStep] = useState(0);

  const [values, setValues] = useState({
    handle: user.handle || "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    institution: "",
    department: "",
  });

  function update(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  const steps = [
    {
      title: "Claim your identity",
      description: "How should people find you on Vibely?",
      content: (
        <div className="grid gap-5 py-2">
          <label className="flex flex-col">
            <span className="mb-1.5 text-[12px] font-medium text-muted-foreground">
              Handle
            </span>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground text-[15px]">
                @
              </span>
              <input
                value={values.handle}
                onChange={(e) => update("handle", e.target.value)}
                required
                minLength={3}
                maxLength={24}
                className="input-base w-full pl-9 text-[15px]"
              />
            </div>
          </label>
          <label className="flex flex-col">
            <span className="mb-1.5 text-[12px] font-medium text-muted-foreground">
              Headline
            </span>
            <input
              value={values.headline}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="Frontend developer, founder-in-progress…"
              maxLength={140}
              className="input-base text-[15px]"
            />
          </label>
        </div>
      ),
    },
    {
      title: "What's your story?",
      description: "Share what you're building, learning, or proving.",
      content: (
        <div className="grid gap-5 py-2">
          <label className="flex flex-col">
            <span className="mb-1.5 text-[12px] font-medium text-muted-foreground">
              Bio
            </span>
            <textarea
              value={values.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="I'm currently building…"
              maxLength={500}
              rows={4}
              className="input-base resize-none text-[15px]"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1.5 text-[12px] font-medium text-muted-foreground">
              Institution
            </span>
            <input
              value={values.institution}
              onChange={(e) => update("institution", e.target.value)}
              placeholder="Your school or company"
              maxLength={200}
              className="input-base text-[15px]"
            />
          </label>
        </div>
      ),
    },
    {
      title: "Drop your coordinates",
      description: "Where are you based? Where can people see your work?",
      content: (
        <div className="grid gap-5 py-2">
          <label className="flex flex-col">
            <span className="mb-1.5 text-[12px] font-medium text-muted-foreground">
              Location
            </span>
            <input
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Earth, Milky Way…"
              maxLength={100}
              className="input-base text-[15px]"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1.5 text-[12px] font-medium text-muted-foreground">
              Website
            </span>
            <input
              value={values.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://yourportfolio.com"
              maxLength={180}
              className="input-base text-[15px]"
            />
          </label>
        </div>
      ),
    },
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step > 0) setStep(step - 1);
  };

  return (
    <form action={action} className="relative mx-auto w-full max-w-xl">
      {/* Hidden inputs persist across steps */}
      <input type="hidden" name="handle" value={values.handle} />
      <input type="hidden" name="headline" value={values.headline} />
      <input type="hidden" name="bio" value={values.bio} />
      <input type="hidden" name="location" value={values.location} />
      <input type="hidden" name="website" value={values.website} />
      <input type="hidden" name="institution" value={values.institution} />
      <input type="hidden" name="department" value={values.department} />

      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ease-apple ${
              i === step
                ? "w-8 bg-primary"
                : i < step
                  ? "w-1.5 bg-primary/60"
                  : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      <div className="surface-elevated p-8 animate-fade-up" key={step}>
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
          {steps[step].title}
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {steps[step].description}
        </p>
        <div className="mt-5">{steps[step].content}</div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors press ${
            step === 0 ? "pointer-events-none opacity-0" : ""
          }`}
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary press inline-flex items-center gap-1.5"
          >
            Next
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary press inline-flex items-center gap-1.5"
          >
            Enter Vibely
            <Check size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </form>
  );
}
