"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axiosInstance, { endpoints } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { debounce } from "@mui/material";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
        gender: "",
        dateOfBirth: "",
        phoneNumber: "",
        address: "",
        healthInsurance: ""
    });
    const [avatar, setAvatar] = useState(null);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(true);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).toLowerCase());
    };

    const checkEmailAvailability = useCallback(
        debounce(async (email) => {
            if (email && isEmailValid) {
                setIsCheckingEmail(true);
                try {
                    const response = await axiosInstance.post(endpoints['check-email'], { email });
                    setIsEmailAvailable(response.data.available);
                } catch (error) {
                    console.error("Error checking email:", error);
                    setIsEmailAvailable(true);
                }
                setIsCheckingEmail(false);
            }
        }, 500),
        [isEmailValid]
    );

    const handleGenderChange = (value) => {
        setFormData(prev => ({ ...prev, gender: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'email') {
            const isValid = validateEmail(value);
            setIsEmailValid(isValid);
            if (isValid) {
                checkEmailAvailability(value);
            } else {
                setIsEmailAvailable(true);
            }
        }
    };

    useEffect(() => {
        if (isEmailValid) {
            checkEmailAvailability(formData.email);
        }
    }, [isEmailValid, formData.email, checkEmailAvailability]);

    const handleContinue = () => {
        if (isEmailValid && isEmailAvailable && formData.email) {
            setStep(2);
        } else {
            toast({
                title: "Email không hợp lệ",
                description: "Vui lòng nhập một địa chỉ email hợp lệ và chưa được sử dụng.",
                variant: "destructive",
            });
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (event:any) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu xác nhận không khớp.",
                variant: "destructive",
            });
            return;
        }

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'confirmPassword') {
                formDataToSend.append(key, formData[key]);
            }
        });
        if (avatar) {
            formDataToSend.append("avatar", avatar);
        }

        try {
            const response = await axiosInstance.post(endpoints['register'], formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                toast({
                    title: "Thành công",
                    description: "Đăng ký thành công, vui lòng kiểm tra email để kích hoạt tài khoản!",
                });
                router.push('/login');
            } else {
                toast({
                    title: "Thất bại",
                    description: "Đăng ký thất bại, đã có lỗi xảy ra",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error submitting the form:", error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row items-center text-2xl font-bold text-center">
                    {step === 2 && (
                        <Button variant="ghost" onClick={handleBack} className="p-0 mr-3">
                            <ArrowBackIosIcon />
                        </Button>
                    )}
                    {step === 1 ? "Tạo một tài khoản" : "Hoàn thành đăng ký"}
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <>
                            {/* Step 1 content */}
                            <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    <span className="flex justify-center">Nhập email của bạn</span>
                                </p>
                                <div className="flex justify-between m-3">
                                    <Button variant="outline" className="w-full mr-10">
                                        <GitHubIcon className="mr-2 h-4 w-4" />Github
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <GoogleIcon className="mr-2 h-4 w-4" /> Google
                                    </Button>
                                </div>
                                <div className="flex items-center my-4">
                                    <hr className="flex-grow border-t border-gray-300" />
                                    <span className="mx-3 text-gray-500">HOẶC TIẾP TỤC VỚI</span>
                                    <hr className="flex-grow border-t border-gray-300" />
                                </div>
                            </div>
                            <form>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Nhập địa chỉ email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            autoComplete="off"
                                        />
                                        {isEmailValid && isCheckingEmail && (
                                            <p className="text-sm text-gray-500">Đang kiểm tra email...</p>
                                        )}
                                        {isEmailValid && !isCheckingEmail && !isEmailAvailable && (
                                            <p className="text-sm text-red-500">Email đã tồn tại</p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleContinue}
                                    className="w-full mt-6"
                                    disabled={!isEmailValid || !isEmailAvailable || isCheckingEmail}
                                >
                                    Tiếp tục
                                </Button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Họ và tên</Label>
                                    <Input
                                        id="name"
                                        name="fullName"
                                        type="text"
                                        placeholder="Họ Và Tên..."
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Giới tính</Label>
                                    <Select
                                        onValueChange={handleGenderChange}
                                        defaultValue={formData.gender}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Nam</SelectItem>
                                            <SelectItem value="female">Nữ</SelectItem>
                                            <SelectItem value="other">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Số điện thoại</Label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="Nhập số điện thoại"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        placeholder="Nhập địa chỉ"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="healthInsurance">Số bảo hiểm y tế</Label>
                                    <Input
                                        id="healthInsurance"
                                        name="healthInsurance"
                                        type="text"
                                        placeholder="Nhập số bảo hiểm y tế"
                                        value={formData.healthInsurance}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="avatar">Ảnh đại diện</Label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        onChange={(e) => setAvatar(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-6">Đăng ký</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
