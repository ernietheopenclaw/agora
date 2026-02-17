import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { AuthSessionProvider } from "./session-provider";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Agora — Bounties for Creators",
  description: "A marketplace connecting companies with content creators through bounties.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <AuthSessionProvider>
          <ThemeProvider>
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
