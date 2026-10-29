import type React from "react"
import "@/app/globals.css"
import { Inter, Playfair_Display, Bebas_Neue, Crimson_Text } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
})

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
})

export const metadata = {
  title: "Fake Review Detector - AI-Powered Review Analysis",
  description: "Detect fake reviews using advanced AI and machine learning techniques",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${bebasNeue.variable} ${crimsonText.variable} font-body`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          themes={["light", "deepblue"]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
