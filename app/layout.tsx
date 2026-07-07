import type { Metadata } from "next";
import '@fontsource-variable/inter';
import "./globals.css";
import { Agentation } from "agentation";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.glenmitchell.design'),
  title: "Glen Mitchell",
  description: "Product designer from Ireland, based in Barcelona. 5+ years designing an agentic sourcing and procurement platform at Keelvar.",
  openGraph: {
    title: "Glen Mitchell",
    description: "Product designer from Ireland, based in Barcelona. 5+ years designing an agentic sourcing and procurement platform at Keelvar.",
    url: "https://www.glenmitchell.design/",
    siteName: "Glen Mitchell",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glen Mitchell",
    description: "Product designer from Ireland, based in Barcelona. 5+ years designing an agentic sourcing and procurement platform at Keelvar.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ backgroundColor: '#FDFDFC' }}>
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
        <Analytics />
      </body>
    </html>
  );
}
