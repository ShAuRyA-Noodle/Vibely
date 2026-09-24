import { ensureUserProfile } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import LandingHero from "@/components/LandingHero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await ensureUserProfile();

  if (!user) {
    return <LandingHero />;
  }
  
  if (!user.onboardingComplete) redirect("/onboarding");

  redirect("/feed");
}
