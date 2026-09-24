import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/feed(.*)",
  "/onboarding(.*)",
  "/profile(.*)",
  "/connections(.*)",
  "/search(.*)",
  "/notifications(.*)",
  "/messages(.*)",
  "/analytics(.*)",
  "/api/feed(.*)",
  "/api/uploads(.*)",
  "/api/notifications(.*)",
  "/api/messages(.*)",
  "/api/analytics(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
