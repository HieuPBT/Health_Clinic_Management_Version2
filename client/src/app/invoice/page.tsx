'use client'
import { useUser } from "@/contexts/UserContext"
import axiosInstance, { endpoints } from "@/lib/axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import AppointmentCard from "@/components/AppointmentCard";
import { useRouter } from "next/navigation";
import { Prescription } from "@/components/interface/PrescriptionInterface";
// import InvoiceDialog from "@/components/dialog/InvoiceDialog";

export default function Invoice() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const loadPrescriptions = async () => {
        const res = await axiosInstance.get(endpoints['patient-invoices'])
        setPrescriptions(res.data.results)
        console.log(res.data.results);
    }

    const removePrescription = (prescriptionsId: string) => {
        setPrescriptions(prevrescriptions=> prevrescriptions.filter(prescription => prescription._id !== prescriptionsId));
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
            )
            }
        </>
    )
}
