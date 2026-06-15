import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import AmbientAudio from "@/components/AmbientAudio";

export const metadata: Metadata = {
  title: "Shubhika Pradeep | Portfolio",
  description: "AI systems and digital experiences from somewhere deep.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />
        <AmbientAudio />
        {children}
      </body>
    </html>
  );
}
