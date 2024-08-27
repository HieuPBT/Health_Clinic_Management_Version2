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
    const {toast} = useToast();
    const confirmAppointment = async(appointmentId: string) =>{
        try{
            const res = await axiosInstance.patch(endpoints['confirm-appointment'](appointmentId));
            toast({
                title: "Thành công",
                description: "Xác thực lịch hẹn thành công"
            })
            if(onConfirm) onConfirm(appointmentId);
            
        }catch(error){
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể xác nhận lịch hẹn"
            })
        }
        
        console.log('xac nhan');
    }

    const rejectAppointment = async(appointmentId: string)=>{
        try{
            await axiosInstance.post(endpoints['reject-appointment'](appointmentId));
            toast({
                title: "Thành công",
                description: "Từ chối lịch hẹn thành công"
            })
            if(onConfirm) onConfirm(appointmentId);

        } catch(error){
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
                    <Button variant="destructive" onClick={() => rejectAppointment(_id)}>{btn.bt1}</Button>
                )}
                {btn.bt2 && (
                    <Button variant="default" onClick={() => btn.bt2 === 'Xác Nhận'? confirmAppointment(_id):setDialogOpen(true)}>{btn.bt2}</Button>
                )}
            </CardFooter>
            <PrescriptionDialog isOpen={isDialogOpen} onOpenChange={setDialogOpen} id={_id} onRemove={onConfirm}/>
        </Card>
    )
}

export default AppointmentCard;