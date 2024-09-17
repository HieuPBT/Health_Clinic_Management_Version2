import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import React, { useEffect } from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import axiosInstance, { endpoints } from "@/lib/axios";
import { toast } from "../ui/use-toast";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";

interface InvoiceProps {
    isOpen: boolean,
    onOpenChange: (isOpen: boolean) => void,
    onRemove: (id: string) => void,
    prescriptionId: string,
}

enum PaymentMethod {
    MOMO = "MOMO_PAY",
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
    paymentMethod: z.nativeEnum(PaymentMethod)
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
const getIpnUrl = (method: PaymentMethod) => {
    const baseUrl = "https://2650-2001-ee0-4f80-4e60-4c13-253f-d17f-ac0c.ngrok-free.app/api/payment";
    switch (method) {
        case PaymentMethod.MOMO:
            return `${baseUrl}/ipn-momo`;
        case PaymentMethod.ZALO_PAY:
            return `${baseUrl}/callback-zalopay`;
        case PaymentMethod.VN_PAY:
            return `${baseUrl}/vnpay-ipn`;
        default:
            return baseUrl;
    }
};
export const InvoiceDialog: React.FC<InvoiceProps> = ({ isOpen, onOpenChange, onRemove, prescriptionId }) => {
    const { control, handleSubmit, formState: { errors }, register, watch, setValue } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            amount: 0,
            orderInfo: "",
            redirectUrl: "http://localhost:3000/invoice",
            ipnUrl: getIpnUrl(PaymentMethod.MOMO),
            lang: "vi",
            autoCapture: true,
            paymentMethod: PaymentMethod.MOMO
        },
    });
    const ipnUrl = watch("ipnUrl");
    useEffect(() => {
        console.log("Current IPN URL in form:", ipnUrl);
    }, [ipnUrl]);
    const watchPaymentMethod = watch("paymentMethod");
    useEffect(() => {
        console.log(getIpnUrl(watchPaymentMethod))
        setValue("ipnUrl", getIpnUrl(watchPaymentMethod));
    }, [watchPaymentMethod, setValue]);

    const onSubmit: SubmitHandler<InvoiceFormData> = async (data) => {
        try {
            let response;
            switch (data.paymentMethod) {
                case PaymentMethod.MOMO:
                    response = await axiosInstance.post(endpoints['create-momo'], data);
                    break;
                case PaymentMethod.ZALO_PAY:
                    console.log('zalo payment')
                    response = await axiosInstance.post(endpoints['create-zalopay'], {
                        amount: data.amount,
                        callback_url: data.ipnUrl,
                        redirecturl: data.redirectUrl
                    });
                    break;
                case PaymentMethod.VN_PAY:
                    response = await axiosInstance.post(endpoints['create-vnpay'], {
                        amount: data.amount,
                        language: data.lang,
                        bankCode: "VNBANK"
                    });
                    break;
                default:
                    throw new Error("Phương thức thanh toán không hợp lệ");
            }

            if (response.data) {
                const invoiceData = {
                    appointmentFee: data.amount,
                    paymentMethod: data.paymentMethod,
                    orderId: response.data.orderId || response.data.app_trans_id,
                    paymentDescription: data.orderInfo,
                };
                console.log(response.data.order_url);

                await axiosInstance.post(endpoints['create-invoice'](prescriptionId), invoiceData);

                window.location.href = response.data.payUrl || response.data.order_url;
            } else throw new Error("Không nhận được phản hồi từ cổng thanh toán");

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể thanh toán với " + data.paymentMethod
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
                        <Controller
                            name="paymentMethod"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-3 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem value={PaymentMethod.MOMO} id="momo" className="peer sr-only" />
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
                                        <RadioGroupItem value={PaymentMethod.ZALO_PAY} id="zalopay" className="peer sr-only" />
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
                                        <RadioGroupItem value={PaymentMethod.VN_PAY} id="vnpay" className="peer sr-only" />
                                        <Label htmlFor="vnpay" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <Image
                                                src="/vnpay.jpg"
                                                alt="vnpay"
                                                width={60}
                                                height={40}
                                                priority
                                            />
                                            VNPay
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="amount">Số tiền:</Label>
                            <Input type="number" id="amount" step={10000} {...register("amount", { valueAsNumber: true })} />
                            {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="orderInfo">Thông tin hóa đơn:</Label>
                            <Input id="orderInfo" {...register("orderInfo")} />
                        </div>

                        <Button type="submit">Xác nhận thanh toán</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
