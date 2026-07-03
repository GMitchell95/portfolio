import type { Metadata } from "next";
import '@fontsource-variable/inter';
import "./globals.css";
import { Agentation } from "agentation";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Product & UI Designer",
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
      </body>
    </html>
  );
}
