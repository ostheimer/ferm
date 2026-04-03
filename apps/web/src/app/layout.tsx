import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { Shell } from "../components/shell";
import { getPublicAppUrl } from "../lib/public-urls";
import "./globals.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  title: "hege Backoffice",
  description: "Reviermanagement für Jagdgesellschaften in Österreich"
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de-AT">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
