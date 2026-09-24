import { getCurrentUserProfile } from "@/lib/actions/users";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import NotificationBell from "./notifications/NotificationBell";
import NavItems from "./NavItems";
import ThemeToggle from "./ThemeToggle";

export default async function Navbar() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <header
        className="w-full max-w-5xl pointer-events-auto rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] dark:bg-card/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.2)]"
      >
        <div className="flex h-14 items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 press">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold text-white transition-transform duration-200 ease-apple group-hover:scale-105"
              style={{
                background: "hsl(var(--primary))",
                boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.2), 0 1px 2px hsl(var(--primary) / 0.3)",
              }}
            >
              V
            </span>
            <span className="hidden sm:inline text-[15px] font-semibold tracking-tight text-foreground">
              Vibely
            </span>
          </Link>

          {/* Desktop Nav */}
          {profile ? (
            <nav className="fixed bottom-4 left-4 right-4 z-50 flex h-14 items-center justify-around rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-lg md:static md:bottom-auto md:left-auto md:right-auto md:h-auto md:w-auto md:justify-center md:gap-1 md:border-0 md:bg-transparent md:shadow-none md:backdrop-blur-none pointer-events-auto">
              <NavItems handle={profile.handle} />
            </nav>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile ? (
              <>
                <div className="hidden md:block">
                  <NotificationBell />
                </div>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8 ring-1 ring-border hover:ring-primary/30 transition-all",
                    },
                  }}
                />
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors press"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-primary press"
                >
                  Join Vibely
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
