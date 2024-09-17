"use client"
import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { useToast } from "@/components/ui/use-toast"
import axiosInstance, { endpoints } from "@/lib/axios"
import { UserContext, UserContextType } from "@/contexts/UserContext"
import { checkAccountExists, handleLoginFirebase, handleRegisterFirebase } from "@/lib/firebase"
import { FirebaseError } from "firebase/app"
import { Alert } from "@/components/ui/alert"
import MySkeleton from "@/components/MySkeleton"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isSent, setIsSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { fetchUser, logout, user, isLoading: isLD } = useContext(UserContext) as UserContextType

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (isLD) {
    return <MySkeleton rows={5} />;
  }

  if (user) {
    return null;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/auth/login", { email, password })
      localStorage.setItem("token", response.data.token)
      const user = await fetchUser()
      if (!user.isActive) {
        setIsActive(false)
        logout()
        toast({
          title: "Tài khoản chưa xác thực!",
          description: "Vui lòng kiểm tra tài khoản email để xác thực tài khoản, sau đó hãy thử đăng nhập lại",
          variant: "destructive"
        })
        return
      }

      if (response.status === 200) {
        await handleFirebaseAuth(email, password, user)
      }

      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Đăng nhập thất bại",
        description: "Vui lòng kiểm tra lại thông tin đăng nhập và thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFirebaseAuth(email: string, password: string, user: any) {
    try {
      await handleLoginFirebase(email, password, user?.avatar || "", user?.fullName || "")
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng trở lại!",
      })
    } catch (error) {
      toast({
        title: "Xác thực Firebase thất bại",
        description: `Vui lòng kiểm tra email để đổi mật khẩu (nhập mật khẩu chúng tôi gửi vào link reset mật khẩu của firebase)`,
        variant: "destructive"
      })
      logout()
      router.push("/login")
      return
      if (error instanceof FirebaseError) {
      } else {
        toast({
          title: "Xác thực Firebase thất bại",
          description: "Đã xảy ra lỗi không xác định. Một số tính năng có thể bị hạn chế.",
          variant: "destructive"
        })
      }
    }
  }

  const handleGetActivateLink = async () => {
    const res = await axiosInstance.post(endpoints['activate'], {
      email: email
    })
    if (res.status === 200) {
      setIsActive(false)
      setIsSent(true)
      toast({
        title: 'Thành công',
        description: `Email kích hoạt tài khoản đã được gửi tới email ${email}!`
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[500px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Đăng Nhập</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-sm flex justify-between">
              <div>Chưa có tài khoản?{" "}
                <Link href="/register" className="text-gray-500 hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
              <Link href="/forgot-password" className="text-gray-500 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            {(!isActive && !isSent) && <Alert variant={"destructive"}>Nếu link kích hoạt tài khoản đã hết hạn vui lòng bấm vào <strong onClick={handleGetActivateLink} className="cursor-pointer">đây</strong> để gửi link mới</Alert>}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Đăng nhập
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
