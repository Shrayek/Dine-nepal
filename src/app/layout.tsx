import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/wrappers/theme";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Dine Nepal",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans ${inter.variable}`}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <TRPCReactProvider>
              <div>
                <nav className="w-full flex flex-row justify-between sticky top-0 px-6 py-4 shadow-2xl border-b-[1px] border-b-muted z-50 bg-background">
                  <Link href="/restaurants">
                    <Image src="/logo.jpeg" className="w-72 h-16 invert" alt="Dine Nepal" width={360} height={360} priority />
                  </Link>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </nav>
                {children}
              </div>
              <Toaster richColors />
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
