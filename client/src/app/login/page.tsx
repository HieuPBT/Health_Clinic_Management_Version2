"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { useToast } from "@/components/ui/use-toast"
import axiosInstance from "@/lib/axios"
import { useUser } from "@/contexts/UserContext"
import { checkAccountExists, handleLoginFirebase, handleRegisterFirebase } from "@/lib/firebase"
import { FirebaseError } from "firebase/app"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { fetchUser } = useUser()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/auth/login", { email, password })
      localStorage.setItem("token", response.data.token)
      const user = await fetchUser()

      if (response.status === 200) {
        await handleFirebaseAuth(email, password, user)
      }

      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng trở lại!",
      })
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
      const accountExists = await checkAccountExists(email)

      if (accountExists) {
        // Tài khoản đã tồn tại, tiến hành đăng nhập
        await handleLoginFirebase(email, password, user?.avatar || "", user?.fullName || "")
        console.log("Firebase login successful")
      } else {
        // Tài khoản chưa tồn tại, tiến hành đăng ký
        await handleRegisterFirebase(email, password, user?.fullName || "", user?.avatar || "")
        console.log("Firebase account created successfully")
      }
    } catch (error) {
      console.error("Firebase auth error:", error)
      if (error instanceof FirebaseError) {
        toast({
          title: "Xác thực Firebase thất bại",
          description: `Lỗi: ${error.code}. Một số tính năng có thể bị hạn chế.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Xác thực Firebase thất bại",
          description: "Đã xảy ra lỗi không xác định. Một số tính năng có thể bị hạn chế.",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
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
                placeholder="m@example.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
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
