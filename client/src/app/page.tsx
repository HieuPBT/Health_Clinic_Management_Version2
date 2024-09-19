'use client'
import MySkeleton from "@/components/MySkeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UserContext, UserContextType } from "@/contexts/UserContext"
import { ChevronRight } from "lucide-react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"

export default function HomePage() {
  const { user, isLoading } = useContext(UserContext) as UserContextType;
  const router = useRouter();
  if (user === null && !isLoading) {
    router.push('/login');
    return null;
  }
  return (
    <div className="">
      <main>
        <div className="relative overflow-hidden flex">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h2 className="text-4xl tracking-tight font-extrabold text-gray-500 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Sức Khỏe Của Bạn Là</span>{' '}
                    <span className="block text-indigo-600 xl:inline">Sự Ưu Tiên Của Chúng Tôi</span>
                  </h2>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe toàn diện với trọng tâm là sự thoải mái của bệnh nhân và công nghệ y tế tiên tiến
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/create-appointment" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                        Đặt Lịch Ngay
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            {/* <Image
              className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
              src="/clinic-image.jpg"
              alt="Clinic"
              width={1000}
              height={1000}
            /> */}
          </div>
        </div>
      </main>
    </div>
  )
}
