"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { useToast } from "@/components/ui/use-toast"
import axiosInstance, { endpoints } from "@/lib/axios"

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault()
        if(newPassword !== newPasswordConfirm) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu nhập lại không đúng!",
                variant: "destructive"
            })
            return
        }
        setIsLoading(true)

        try {
            const response = await axiosInstance.post(endpoints['change-password'], { currentPassword, newPassword })
            if (response.status === 200) {

                toast({
                    title: "Thành công!",
                    description: "Đổi mật khẩu thành công!",
                })
                router.push("/")
            }
        } catch (error) {
            console.error("Login error:", error)
            toast({
                title: "Đổi mật khẩu thất bại",
                description: "Mật khẩu hiện tại không đúng!",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[350px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Đổi mật khẩu</CardTitle>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Mật khẩu hiện tại</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại..."
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Mật khẩu mới</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Nhập mật khẩu mới..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Nhập lại mật khẩu mới</Label>
                            <Input
                                id="newPasswordConfirm"
                                type="password"
                                placeholder="Nhập lại mật khẩu mới..."
                                value={newPasswordConfirm}
                                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Đổi mật khẩu
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
