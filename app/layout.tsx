import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/context";

export const metadata: Metadata = {
  title: "LinguaLabsAI — AI English Speaking Practice",
  description:
    "Practice English speaking with Luna, your AI conversation tutor. Get gentle grammar corrections, learn new vocabulary, and build confidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme by applying dark class synchronously */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('lingua-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
