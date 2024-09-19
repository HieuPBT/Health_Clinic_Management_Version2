'use client'
import React, { useState } from 'react';
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SquareUserRound, Clock, CalendarDays, Mail } from 'lucide-react';
import PrescriptionDialog from './PrescriptionDialog';
import axiosInstance, { endpoints } from '@/lib/axios';
import { useToast } from './ui/use-toast';
import { InvoiceDialog } from './dialog/InvoiceDialog';

export interface AppointmentCardProps {
    _id: string;
    department: { name: string };
    patient: {
        fullName: string,
        email: string;
    }
    bookingDate: string;
    bookingTime: string;
    status: string;
    btn: { bt1: string, bt2: string };
    onConfirm: (appointmentId: string) => void;
}


const AppointmentCard: React.FC<AppointmentCardProps> = ({ _id, patient, bookingDate, bookingTime, department, status, btn,
    onConfirm }) => {
    const formattedDate = format(new Date(bookingDate), "dd/MM/yyyy");
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async (id: string) => {
        setIsExporting(true);
        try {
            const response = await axiosInstance.get(endpoints['export-prescription-pdf'](id), {
                responseType: 'blob'
            });

            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `prescription_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast({
                title: "Thành công",
                description: "Toa thuốc đã được gửi qua email dưới dạng PDF"
            });
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể xuất PDF"
            });
        } finally {
            setIsExporting(false);
        }
    };
    const confirmAppointment = async (appointmentId: string) => {
        try {
            const res = await axiosInstance.patch(endpoints['confirm-appointment'](appointmentId));
            toast({
                title: "Thành công",
                description: "Xác thực lịch hẹn thành công"
            })
            if (onConfirm) onConfirm(appointmentId);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể xác nhận lịch hẹn"
            })
        }

        console.log('xac nhan');
    }

    const rejectAppointment = async (appointmentId: string) => {
        try {
            await axiosInstance.post(endpoints['reject-appointment'](appointmentId));
            toast({
                title: "Thành công",
                description: "Từ chối lịch hẹn thành công"
            })
            if (onConfirm) onConfirm(appointmentId);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể từ chối lịch hẹn"
            })
        }
    }

    return (
        <Card className='m-2 w-[350px]'>
            <CardHeader>
                <CardTitle className='flex justify-between'>
                    <span>{`Khoa: ${department.name}`}</span>
                    <Badge variant={status === 'CHƯA XÁC NHẬN' ? 'destructive' : 'secondary'}>{status}</Badge>
                </CardTitle>
                <CardDescription>
                    <div className='flex mt-2'>
                        <SquareUserRound className='mr-2' />
                        <span>{patient.fullName}</span>
                    </div>
                    <div className='flex mt-2'>
                        <Mail className='mr-2' />
                        <span>{patient.email}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex justify-between'>
                    <div className='flex'>
                        <CalendarDays className='mr-1' />
                        {formattedDate}
                    </div>
                    <div className='flex'>
                        <Clock className='mr-1' />{bookingTime}
                    </div>

                </div>
            </CardContent>
            <CardFooter className='flex justify-between'>
                {btn.bt1 && (
                    <Button
                        variant="destructive"
                        onClick={() => btn.bt1 === 'Từ Chối' ? rejectAppointment(_id) : handleExportPDF(_id)}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Đang xuất...' : btn.bt1}
                    </Button>
                )}
                {btn.bt2 && (
                    <Button variant="default" onClick={() => btn.bt2 === 'Xác Nhận' ? confirmAppointment(_id) : setDialogOpen(true)}>{btn.bt2}</Button>
                )}
            </CardFooter>
            {btn.bt2 === 'Kê Toa' ? (
                <PrescriptionDialog isOpen={isDialogOpen} onOpenChange={setDialogOpen} id={_id} onRemove={onConfirm} />
            ) : (
                <InvoiceDialog isOpen={isDialogOpen} onOpenChange={setDialogOpen} onRemove={onConfirm} prescriptionId={_id} />
            )}
        </Card>
    );
}

export default AppointmentCard;
