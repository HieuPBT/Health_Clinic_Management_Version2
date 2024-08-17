"use client"

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
import { useUser } from "@/contexts/UserContext"
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const Header = () => {
    const { user, logout } = useUser()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const commonRoutes = [
        { href: '/', label: 'Trang Chủ' },
        { href: '/news', label: 'Tin Tức' },
    ]

    const roleSpecificRoutes = {
        nurse: [
            { href: '/appointment', label: 'Appointments' },
            { href: '/create-invoice', label: 'Create Invoice' },
        ],
        doctor: [
            { href: '/appointment', label: 'Appointments' },
            { href: '/prescription', label: 'Prescriptions' },
            { href: '/patient', label: 'Patients' },
        ],
        patient: [
            { href: '/create-appointment', label: 'Đặt Lịch Khám' },
            { href: '/my-appointment', label: 'Lịch Hẹn' },
        ],
    }

    const getRoutes = () => {
        if (!user) return commonRoutes.slice(0, 1) // Only show Home for non-logged in users
        const userRoutes = roleSpecificRoutes[user.role as keyof typeof roleSpecificRoutes] || []
        return [...commonRoutes, ...userRoutes]
    }

    return (
        <header className="border-b">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="font-bold text-xl">
                        <Image
                            src="https://res.cloudinary.com/dlwiwldkd/image/upload/v1723697301/logo_dfpsko.png"
                            alt="Logo"
                            width={60}
                            height={40}
                            priority
                        />
                    </Link>
                    <nav className="hidden md:flex space-x-4">
                        {getRoutes().map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className="text-sm font-medium transition-colors hover:text-primary"
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
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
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button asChild variant="ghost">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">Register</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
