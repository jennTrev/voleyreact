import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Navbar Example</title>
        <meta name="description" content="Custom navbar example" />
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
      </head>
      <body className="font-['Roboto',sans-serif] m-0 p-0">{children}</body>
    </html>
  )
}


