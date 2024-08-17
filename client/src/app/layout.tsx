import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from '@/contexts/UserContext'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Your App Name",
  description: "Description of your app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <UserProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </UserProvider>
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
