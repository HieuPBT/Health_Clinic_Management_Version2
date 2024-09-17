'use client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ModeToggle } from './mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserContext, UserContextType } from "@/contexts/UserContext"
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useContext, useEffect, useState } from 'react'
import { Home, User, Key, Newspaper, Calendar, FileText, Users, Plus, PhoneCall } from 'lucide-react'
import ChatboxList from '@/components/ChatboxList'

const Header = () => {
    const { user, logout, isLoading } = useContext(UserContext) as UserContextType
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = () => {
        logout()
    }

    useEffect(() => {
        if (!user && !isLoading) {
          router.push('/login');
        }
      }, [user, router]);

    const commonRoutes = [
        { href: '/', label: 'Trang Chủ', icon: Home },
        { href: '/news', label: 'Tin Tức', icon: Newspaper },
        { href: '/staffs', label: 'Đội ngũ', icon: PhoneCall },
    ]

    const roleSpecificRoutes = {
        nurse: [
            { href: '/appointment', label: 'Lịch Hẹn', icon: Calendar },
            { href: '/invoice', label: 'Thanh Toán', icon: FileText },
        ],
        doctor: [
            { href: '/appointment', label: 'Lịch hẹn', icon: Calendar },
            { href: '/patient-profile', label: 'Hồ sơ bệnh án', icon: Users },
        ],
        patient: [
            { href: '/create-appointment', label: 'Đặt Lịch Khám', icon: Plus },
            { href: '/my-appointment', label: 'Lịch Hẹn', icon: Calendar },
        ],
    }

    const getRoutes = () => {
        if (!user) return commonRoutes.slice(0, 1) // Only show Home for non-logged in users
        const userRoutes = roleSpecificRoutes[user.role as keyof typeof roleSpecificRoutes] || []
        return [...commonRoutes, ...userRoutes]
    }

    return (
        <header className="shadow-md ">
            {user &&
                <ChatboxList />}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="font-bold text-xl mr-8">
                            <Image
                                className="h-8 w-auto"
                                src="https://res.cloudinary.com/dlwiwldkd/image/upload/v1723697301/logo_dfpsko.png"
                                alt="Logo"
                                width={60}
                                height={60}
                            />
                        </Link>
                        <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {getRoutes().map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground inline-flex items-center space-x-1
                                ${pathname === route.href ? 'bg-accent text-accent-foreground' : 'text-foreground/60'}
                            `}
                                >
                                    <route.icon className="w-4 h-4" />
                                    <span>{route.label}</span>
                                </Link>
                            ))}
                        </nav>

                    </div>
                    <div className="flex items-center space-x-4">
                        <ModeToggle />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="w-8 h-8 cursor-pointer">
                                        <AvatarImage src={user.avatar || "https://github.com/shadcn.png"} alt={user.fullName} />
                                        <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel><Link href="/profile">{user.fullName}</Link></DropdownMenuLabel>
                                    <DropdownMenuItem><Link href="/change-password">Đổi mật khẩu</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button asChild>
                                    <Link href="/login">Đăng nhập</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header
