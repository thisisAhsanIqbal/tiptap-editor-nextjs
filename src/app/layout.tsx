import { Metadata } from "next";
import { JetBrains_Mono, Open_Sans } from "next/font/google";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const fontSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

import Header from "@/components/shared/header";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Next Tiptap Editor - Modern WYSIWYG Rich Text Editor for React & Next.js",
  description:
    "Build powerful rich text editors with Next Tiptap - a feature-rich WYSIWYG editor built with Tiptap, React, and Next.js. Includes tables, images, code blocks, YouTube embeds, drag & drop, and more. Free and open source.",
  keywords: "Tiptap, WYSIWYG editor, Rich text editor, React editor, Next.js editor, Tiptap editor, React rich text, Next.js rich text, WYSIWYG React, content editor, text editor component, React text editor, Next.js text editor, Tiptap React, ProseMirror, Radix UI",
  metadataBase: new URL(`https://tiptap-editor-iota-nine.vercel.app`),
  openGraph: {
    type: "website",
    url: `https://tiptap-editor-iota-nine.vercel.app`,
    title: "Next Tiptap Editor - Modern WYSIWYG Rich Text Editor for React & Next.js",
    description:
      "Build powerful rich text editors with Next Tiptap - a feature-rich WYSIWYG editor built with Tiptap, React, and Next.js. Includes tables, images, code blocks, YouTube embeds, drag & drop, and more.",
    siteName: "Next Tiptap Editor",
    locale: "en_US",
    images: "/opengraph-image.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Tiptap Editor - Modern WYSIWYG Rich Text Editor",
    description:
      "Build powerful rich text editors with Next Tiptap - a feature-rich WYSIWYG editor for React and Next.js applications.",
  },
  alternates: {
    canonical: "https://tiptap-editor-iota-nine.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const developerSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Muhammad Ahsan Iqbal",
    url: "https://github.com/thisisAhsanIqbal",
    sameAs: [
      "https://github.com/thisisAhsanIqbal",
      "https://www.facebook.com/thisisAhsanIqbal",
      "https://www.instagram.com/ahsn.iqbl/",
      "https://www.linkedin.com/in/ahsan-iqbal-digitalmarketingexpert/",
    ],
    jobTitle: "Developer",
    description: "Developer of Next Tiptap Editor - A modern WYSIWYG rich text editor for React and Next.js",
  };

  return (
    <html
      lang="en"
      className={`${fontMono.variable} ${fontSans.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(developerSchema) }}
        />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
