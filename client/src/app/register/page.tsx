"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axiosInstance, { endpoints } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [healthInsurance, setHealthInsurance] = useState("");
    const router = useRouter();

    const handleContinue = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("fullName", name);
        formData.append("gender", gender);
        formData.append("dateOfBirth", dateOfBirth);
        formData.append("phoneNumber", phoneNumber);
        formData.append("address", address);
        formData.append("healthInsurance", healthInsurance);
        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            const response = await axiosInstance.post(endpoints['register'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log("Registration successful");
                router.push('/login')
            } else {
                console.error("Registration failed");
            }
        } catch (error) {
            console.error("Error submitting the form:", error);
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
                    {step === 1 ? "Create an account" : "Complete your profile"}
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <>
                            <CardDescription>
                                <span className="flex justify-center">Enter your email below to create your account</span>
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
                                    <span className="mx-3 text-gray-500">OR CONTINUE WITH</span>
                                    <hr className="flex-grow border-t border-gray-300" />
                                </div>
                            </CardDescription>
                            <form>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="button" onClick={handleContinue} className="w-full mt-6">Continue</Button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Input
                                        id="gender"
                                        type="text"
                                        placeholder="Enter your gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        placeholder="Enter your address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="healthInsurance">Health Insurance</Label>
                                    <Input
                                        id="healthInsurance"
                                        type="text"
                                        placeholder="Enter your health insurance number"
                                        value={healthInsurance}
                                        onChange={(e) => setHealthInsurance(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="avatar">Avatar</Label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        onChange={(e) => setAvatar(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-6">Register</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
