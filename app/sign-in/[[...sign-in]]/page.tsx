import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center px-4 py-10">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </section>
  );
}
