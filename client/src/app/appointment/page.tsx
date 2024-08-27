'use client'
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import axiosInstance, { endpoints } from "@/lib/axios"
import AppointmentCard from "@/components/AppointmentCard"
import Paginator from "@/components/Pagination"
import { AppointmentInterface } from "@/components/interface/AppointmentInterface"

export default function Appointment() {
    const { user } = useUser()
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<AppointmentInterface[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadAppointments = async (currentPg: number) => {
        try {
            const res = await axiosInstance.get(endpoints['patient-appointments'], {
                params: {
                    page: currentPg || 0,
                }
            });
            setAppointments(res.data.results);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error loading appointments:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user || user.role === 'patient') {
            router.push("/");
        } else {
            loadAppointments(currentPage);
        }
    }, [user, router]);

    const pageChange = (page: number) => {
        setCurrentPage(page)
        loadAppointments(page)
    }

    const removeAppointment = (appointmentId: string) => {
        setAppointments(prevAppointments => prevAppointments.filter(appointment => appointment._id !== appointmentId));
    }

    if (loading) {
        return (
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {appointments.map((appointment) => (
                    <AppointmentCard
                        key={appointment._id}
                        {...appointment}
                        btn={
                            user?.role === 'nurse'
                                ? { bt1: 'Từ Chối', bt2: 'Xác Nhận' }
                                : { bt1: '', bt2: 'Kê Toa' }
                        }
                        onConfirm={removeAppointment}
                    />
                ))}
            </div>
            {appointments.length > 0 ? ( 
                <Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={pageChange} />
            ): (
                <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
            )
            }

        </div>
    );
}
