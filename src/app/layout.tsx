import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { fontDisplay, fontBody } from "@/components/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProsperouSSS",
  description: "Digital Twin Financial Analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontDisplay.variable} ${fontBody.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
