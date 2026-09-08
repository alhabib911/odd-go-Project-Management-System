import type { Metadata } from "next";
import "./globals.css";
import AccessGate from "@/components/access-gate";

export const metadata: Metadata = {
  title: "Odd-Go | Project management and productivity",
  description: "Plan better, work smarter, and achieve more with Odd-Go.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      {/* Keeping the body unstyled here lets each route own its layout system. */}
      <body suppressHydrationWarning><AccessGate>{children}</AccessGate></body>
    </html>
  );
}
