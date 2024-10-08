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
  title: "Lộc Hiếu Health Clinic",
  description: "Trang web đặt lịch khám trực tuyến",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <UserProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </UserProvider>
  )
}
