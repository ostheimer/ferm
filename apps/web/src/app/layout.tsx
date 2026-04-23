import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

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
  description: "Reviermanagement fuer Jagdgesellschaften in Oesterreich"
};

interface RootLayoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de-AT">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
