'use client'
import { useUser } from "@/contexts/UserContext"
import axiosInstance, { endpoints } from "@/lib/axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import AppointmentCard, { AppointmentCardProps } from "@/components/AppointmentCard";
import { useRouter } from "next/navigation";


export default function Invoice() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState([]);
    const loadPrescriptions = async () => {
        const res = await axiosInstance.get(endpoints['create-invoice'])
        setPrescriptions(res.data.results)
        console.log(res.data.results);
    }

    useEffect(() => {
        if (user?.role == 'patient' || !user)
            router.push('/')
        else {
            setLoading(false);
            loadPrescriptions();
        }
    }, [user, router])
    return (
        <>
            {loading ? (<div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>) : (
                <div className="flex flex-row items-center">
                    {prescriptions.map((p: AppointmentCardProps, index) => (
                        <AppointmentCard
                            key={p._id}
                            _id={p._id}
                            patient={p.appointment.patient}
                            bookingDate={p.appointment.bookingDate}
                            bookingTime={p.appointment.bookingTime}
                            department={p.appointment.department}
                            status={p.appointment.status}
                            btn={user?.role == 'nurse' ? { bt1: '', bt2: 'Thanh Toán' } : { bt1: '', bt2: 'Kê Toa' }}
                        />

                    ))}
                </div>
            )
            }
        </>
    )
}
