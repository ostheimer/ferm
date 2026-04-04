import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { Shell } from "../components/shell";
import { getPublicAppUrl } from "../lib/public-urls";
import { getOptionalAuthContext } from "../server/auth/context";
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
  description: "Reviermanagement fuer Jagdgesellschaften in Oesterreich"
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const viewer = await getOptionalAuthContext();

  return (
    <html lang="de-AT">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <Shell viewer={viewer}>{children}</Shell>
      </body>
    </html>
  );
}
