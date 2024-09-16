import { boolean, z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import React from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import axios from "axios";
import axiosInstance, { endpoints } from "@/lib/axios";
import { error } from "console";
import { toast } from "../ui/use-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";


interface InvoiceProps {
    isOpen: boolean,
    onOpenChange: (isOpen: boolean) => void,
    onRemove: (id: string) => void,
    prescriptionId: string,
}

enum PaymentMethod {
    MOMO= "MOMO_PAY",
    ZALO_PAY = "ZALO_PAY",
    VN_PAY = "VN_PAY"

}

const invoiceFormSchema = z.object({
    amount: z.number().min(10000, "Tối thiểu là 10000"),
    orderInfo: z.string().optional(),
    redirectUrl: z.string(),
    ipnUrl: z.string(),
    lang: z.string(),
    autoCapture: z.boolean(),
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;


export const InvoiceDialog: React.FC<InvoiceProps> = ({ isOpen, onOpenChange, onRemove, prescriptionId }) => {
    const { register, handleSubmit, formState: {errors} } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            amount: 0,
            orderInfo: "",
            redirectUrl: "http://localhost:3000/invoice",
            ipnUrl: "https://75d5-171-243-48-206.ngrok-free.app/api/payment/ipn-momo",
            lang: "en",
            autoCapture: true,
        },
    });

    const onSubmit: SubmitHandler<InvoiceFormData> = async (data) =>{
        try{
            console.log(data);
            const res = await axiosInstance.post(endpoints['create-momo'], data)

            if(res.data){
                const invoiceData = {
                    appointmentFee: data.amount,
                    paymentMethod: PaymentMethod.MOMO,
                    orderId: res.data.orderId,
                    paymentDescription: data.orderInfo,
                };

                await axiosInstance.post(endpoints['create-invoice'](prescriptionId), invoiceData)

                window.location.href = res.data.payUrl;
            } else throw new Error("Không nhận được Lỗi MoMo");

        }catch(error){
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể thanh toán với" + " momo"
            })
            console.error(error);
        }
    }
        

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Phương Thức Thanh Toán
                    </DialogTitle>
                    <DialogDescription>
                        Chọn phương thức thanh toán cho hóa đơn
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                    <RadioGroup defaultValue="momo" className="grid grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem value="momo" id="momo" className="peer sr-only"/>
                        <Label htmlFor="momo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <Image
                                src="/momo.png"
                                alt="momo"
                                width={60}
                                height={40}
                                priority
                            />
                        MoMo
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="zalopay" id="zalopay" className="peer sr-only"/>
                        <Label htmlFor="zalopay" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <Image
                                src="/zalopay.png"
                                alt="zalopay"
                                width={60}
                                height={40}
                                priority
                            />
                        ZaloPay
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="vnpay" id="vnpay" className="peer sr-only"/>
                        <Label htmlFor="vnpay" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <Image
                                src="/vnpay.jpg"
                                alt="vnpay"
                                width={60}
                                height={40}
                                priority
                            />
                        VnPay
                        </Label>
                    </div>
                    </RadioGroup>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="amount">Số tiền:</Label>
                        <Input type="number" id="amount" {...register("amount", { valueAsNumber: true})}/>
                        {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="orderInfo">Thông tin hóa đơn:</label>
                        <Input id="orderInfo" {...register("orderInfo")}/>
                    </div>

                    <Button type="submit">Xác nhận thanh toán</Button>
                </div>
                </form>
                
            </DialogContent>
        </Dialog>
    )
}