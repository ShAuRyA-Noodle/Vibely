import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Vibely — Proof of work for builders",
  description: "The professional network for engineers, designers, and visionaries who let their work speak louder than their resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#2FA4D7",
          borderRadius: "0.625rem",
        },
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={`${GeistSans.variable} ${GeistMono.variable}`}
      >
        <body className="font-sans min-h-screen bg-background text-foreground antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AnimatedBackground />
            <Navbar />
            <main className="min-h-screen pt-20 pb-20 md:pb-10 relative">
              {children}
            </main>
            <Toaster
              position="bottom-center"
              toastOptions={{
                className: "!bg-card !border !border-border !text-foreground !rounded-xl !shadow-lg",
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
