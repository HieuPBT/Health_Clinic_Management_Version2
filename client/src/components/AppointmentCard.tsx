'use client'
import React, { useState } from 'react';
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SquareUserRound, Clock, CalendarDays, Mail } from 'lucide-react';
import PrescriptionDialog from './PrescriptionDialog';

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
}


const AppointmentCard: React.FC<AppointmentCardProps> = ({ _id, patient, bookingDate, bookingTime, department, status, btn }) => {
    const formattedDate = format(new Date(bookingDate), "dd/MM/yyyy");
    const [isDialogOpen, setDialogOpen] = useState(false);

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
                    <Button variant="destructive">{btn.bt1}</Button>
                )}
                {btn.bt2 && (
                    <Button variant="default" onClick={() => setDialogOpen(true)}>{btn.bt2}</Button>
                )}
            </CardFooter>
            <PrescriptionDialog isOpen={isDialogOpen} onOpenChange={setDialogOpen} id={_id}/>
        </Card>
    )
}

export default AppointmentCard;