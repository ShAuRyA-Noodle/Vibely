import {
  completeOnboardingAction,
  requireUserProfile,
} from "@/lib/actions/users";
import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUserProfile();

  if (user.onboardingComplete) {
    redirect("/feed");
  }

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-10">
      <div className="z-10 w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Vibely setup
          </p>
          <h1 className="text-[40px] font-semibold tracking-tight text-foreground">
            Welcome aboard.
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            A few details to get you set up.
          </p>
        </div>

        <OnboardingWizard user={user} action={completeOnboardingAction} />
      </div>
    </section>
  );
}
