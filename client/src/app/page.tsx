'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import Head from "next/head"
import Link from "next/link"

export default function HomePage() {
  return (
    // <div className="container mx-auto px-4 py-12">
    //   <h1 className="text-4xl font-bold mb-8 text-center">Chào</h1>
    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //     {[
    //       { title: "Feature 1", description: "Amazing feature that will blow your mind." },
    //       { title: "Feature 2", description: "Incredible functionality you can't live without." },
    //       { title: "Feature 3", description: "Revolutionary tool to boost your productivity." },
    //     ].map((feature, index) => (
    //       <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
    //         <CardHeader>
    //           <CardTitle>{feature.title}</CardTitle>
    //           <CardDescription>{feature.description}</CardDescription>
    //         </CardHeader>
    //         <CardContent>
    //           <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    //         </CardContent>
    //         <CardFooter>
    //           <Button variant="outline">
    //             Learn More
    //             <ChevronRight className="ml-2 h-4 w-4" />
    //           </Button>
    //         </CardFooter>
    //       </Card>
    //     ))}
    //   </div>
    // </div>
    <div className="bg-gray-100">
      

      <main>
      <div className="relative bg-white overflow-hidden flex">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
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
