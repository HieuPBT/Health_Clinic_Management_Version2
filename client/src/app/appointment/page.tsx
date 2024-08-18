'use client'
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import axios from "axios"
import axiosInstance, { endpoints } from "@/lib/axios"
import AppointmentCard from "@/components/AppointmentCard"
import { AppointmentCardProps } from "@/components/AppointmentCard"

export default function Appoinment() {
    const { user } = useUser()
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const loadAppointments = async () => {
        const res = await axiosInstance.get(endpoints['patient-appointments'])

        setAppointments(res.data.results);
    }
    useEffect(() => {
        if (user?.role == 'patient')
            router.push("/")
        else {
            setLoading(false);
            loadAppointments();
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
                    {appointments.map((appointment: AppointmentCardProps, index) => (
                        <AppointmentCard
                            key={appointment._id}
                            _id={appointment._id}
                            patient={appointment.patient}
                            bookingDate={appointment.bookingDate}
                            bookingTime={appointment.bookingTime}
                            department={appointment.department}
                            status={appointment.status}
                            btn={user?.role == 'nurse' ? { bt1: 'Từ Chối', bt2: 'Xác Nhận' } : { bt1: '', bt2: 'Kê Toa' }}
                        />
                        
                    ))}
                </div>
            )
            }
        </>

    )
}