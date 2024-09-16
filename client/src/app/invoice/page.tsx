'use client'
import { useUser } from "@/contexts/UserContext"
import axiosInstance, { endpoints } from "@/lib/axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import AppointmentCard from "@/components/AppointmentCard";
import { useRouter } from "next/navigation";
import { Prescription } from "@/components/interface/PrescriptionInterface";
import Paginator from "@/components/Pagination";
// import InvoiceDialog from "@/components/dialog/InvoiceDialog";

export default function Invoice() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const loadPrescriptions = async (currentPg: number) => {
        try {
            const res = await axiosInstance.get(endpoints['patient-invoices'],
                {
                    params: {
                        page: currentPg || 0,
                    }
                }
            );
            setPrescriptions(res.data.results)
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error loading today prescriptions", error);

        }

        // console.log(res.data.results);
    }

    const removePrescription = (prescriptionsId: string) => {
        setPrescriptions(prevrescriptions => prevrescriptions.filter(prescription => prescription._id !== prescriptionsId));
    }

    useEffect(() => {
        if (user?.role == 'patient' || !user)
            router.push('/')
        else {
            loadPrescriptions(currentPage);
        }
    }, [user, router])

    const pageChange = (page: number) => {
        setCurrentPage(page)
        loadPrescriptions(page)
    }

    // if (loading) {
    //     return (
    //         <div className="flex items-center space-x-4">
    //             <Skeleton className="h-12 w-12 rounded-full" />
    //             <div className="space-y-2">
    //                 <Skeleton className="h-4 w-[250px]" />
    //                 <Skeleton className="h-4 w-[200px]" />
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <>
            <div className="p-4">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {prescriptions.map((p, index) => (
                        <AppointmentCard
                            key={p._id}
                            _id={p._id}
                            patient={p.appointment.patient}
                            bookingDate={p.appointment.bookingDate}
                            bookingTime={p.appointment.bookingTime}
                            department={p.appointment.department}
                            status={p.appointment.status}
                            btn={user?.role == 'nurse' ? { bt1: 'Xuất PDF', bt2: 'Thanh Toán' } : { bt1: '', bt2: 'Kê Toa' }}
                            onConfirm={removePrescription}
                        />

                    ))}
                    {/* <InvoiceDialog/> */}
                </div>
                {prescriptions.length > 0 ? (
                    <Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={pageChange} />
                ) : (
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
