"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Globe2,
  Zap,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* === FADE-IN ON SCROLL (IntersectionObserver — no heavy lib) === */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* === FEATURE CARD === */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: typeof Code2;
  title: string;
  description: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        opacity: visible ? 1 : 0,
      }}
      className="surface-elevated group p-6 transition-all duration-700 ease-apple hover:border-primary/30"
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mb-4 transition-transform duration-500 ease-apple group-hover:scale-105">
        <Icon size={18} strokeWidth={2} />
      </div>
      <h3 className="text-[15.5px] font-semibold text-foreground mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function LandingHero() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* ========== HERO ========== */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-4 pt-20 pb-16">
        <div className="relative z-10 w-full max-w-5xl text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground animate-fade-up shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span>Now live — join the builders</span>
          </div>

          {/* Headline — editorial-tight, Geist, text-wrap balance */}
          <h1
            className="mt-6 text-[44px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-semibold tracking-tight-display leading-[0.95] text-foreground animate-fade-up"
            style={{
              textWrap: "balance",
              animationDelay: "80ms",
              animationFillMode: "both",
            }}
          >
            Where builders prove
            <br />
            <span className="text-primary">their real work.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="mt-6 mx-auto max-w-[560px] text-[17px] sm:text-[18px] leading-relaxed text-muted-foreground animate-fade-up"
            style={{
              textWrap: "balance",
              animationDelay: "160ms",
              animationFillMode: "both",
            }}
          >
            The professional network for engineers, designers, and founders who
            let their work speak louder than their resume.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-fade-up"
            style={{ animationDelay: "240ms", animationFillMode: "both" }}
          >
            <Link
              href="/sign-up"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-[15px] font-medium text-primary-foreground shadow-[0_1px_2px_rgba(47,164,215,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_4px_14px_rgba(47,164,215,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 ease-apple press"
            >
              Get started
              <ArrowRight
                size={16}
                strokeWidth={2.5}
                className="transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-[15px] font-medium text-foreground hover:bg-muted hover:border-foreground/20 transition-all duration-200 ease-apple press"
            >
              Sign in
              <ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="transition-transform duration-300 ease-apple group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {/* Trust row */}
          <div
            className="mt-16 flex items-center justify-center gap-8 text-muted-foreground animate-fade-up"
            style={{ animationDelay: "400ms", animationFillMode: "both" }}
          >
            <div className="text-center">
              <div className="text-[22px] font-semibold text-foreground tabular-nums tracking-tight">
                10K+
              </div>
              <div className="text-[11px] uppercase tracking-wider font-medium">
                Builders
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-[22px] font-semibold text-foreground tabular-nums tracking-tight">
                50K+
              </div>
              <div className="text-[11px] uppercase tracking-wider font-medium">
                Projects
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-[22px] font-semibold text-foreground tabular-nums tracking-tight">
                99%
              </div>
              <div className="text-[11px] uppercase tracking-wider font-medium">
                Satisfied
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="relative py-24 md:py-32 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-16">
            <p className="text-[13px] font-medium text-primary tracking-wide uppercase mb-3">
              Why Vibely
            </p>
            <h2 className="text-[36px] md:text-[48px] font-semibold tracking-tight-display text-foreground leading-[1.05]">
              Built for people
              <br />
              who ship.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground max-w-[520px]">
              Not another LinkedIn clone. Purpose-built for the Gen-Z builders
              writing code, designing products, and moving fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Code2}
              title="Proof of work"
              description="Your code, your commits, your shipped products. Share deep technical progress that proves you build."
              delay={0}
            />
            <FeatureCard
              icon={Globe2}
              title="Global network"
              description="Connect with the top 1% of engineers, designers, and founders. Quality over quantity."
              delay={60}
            />
            <FeatureCard
              icon={Sparkles}
              title="Smart matching"
              description="AI-powered suggestions connecting you with builders working on complementary problems."
              delay={120}
            />
            <FeatureCard
              icon={Zap}
              title="Real-time collab"
              description="Instant messaging, threaded discussions, and live reactions. Built for builder-speed."
              delay={60}
            />
            <FeatureCard
              icon={Shield}
              title="Privacy first"
              description="Your data, your rules. No ads, no tracking, no selling your graph to recruiters."
              delay={120}
            />
            <FeatureCard
              icon={Layers}
              title="Rich profiles"
              description="Education, experience, skills, and project portfolios. Everything to showcase your journey."
              delay={180}
            />
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative py-24 md:py-32 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="surface-elevated relative overflow-hidden p-10 md:p-16 text-center">
            {/* Subtle glow background */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse 60% 60% at 50% 0%, hsl(var(--primary) / 0.08) 0%, transparent 60%)",
              }}
            />

            <h2 className="relative text-[32px] md:text-[44px] font-semibold tracking-tight-display text-foreground leading-[1.1]">
              Ready to prove
              <br />
              what you&apos;ve built?
            </h2>
            <p className="relative mt-4 text-[16px] leading-relaxed text-muted-foreground max-w-md mx-auto">
              Join thousands of builders sharing their work, growing their
              network, and landing opportunities.
            </p>

            <div className="relative mt-8">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground shadow-[0_1px_2px_rgba(47,164,215,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_4px_14px_rgba(47,164,215,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 ease-apple press"
              >
                Start building your profile
                <ArrowRight
                  size={16}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
                />
              </Link>
              <p className="mt-4 text-xs text-muted-foreground">
                Free forever for builders. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
