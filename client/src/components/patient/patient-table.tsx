'use client'
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { PatientProfile } from "@/types/patient-profile";
import axiosInstance, { endpoints } from "@/lib/axios";
import PatientDetail from "./patient-detail";
interface Props {
    data: PatientProfile[]
}

export default function PatientTable({ data }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [selectedData, setSelectedData] = useState<PatientProfile | null>(null);

    const handleOpen = (i: PatientProfile) =>{
        setSelectedData(i);
        setOpen(true);
    }

    const handleClose = () =>{
        setOpen(false);
    }

    return (
        <div className="overflow-x-auto">
            <div>
                <Table className="rounded-md border">
                    {/* <TableCaption>test</TableCaption> */}
                    <TableHeader>
                        <TableRow>
                            <TableHead>Id</TableHead>
                            <TableHead>Bệnh nhân</TableHead>
                            <TableHead>Khoa</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Kết luận</TableHead>
                            <TableHead>Ngày khám</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((i, index) => (
                            <TableRow key={index} onClick={() => handleOpen(i)}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{i.patient.fullName}</TableCell>
                                <TableCell>{i.department.name}</TableCell>
                                <TableCell>{i.description}</TableCell>
                                <TableCell>{i.conclusion}</TableCell>
                                <TableCell>{new Date(i.appointment.bookingDate).toLocaleString()}</TableCell>
                                
                            </TableRow>

                        ))}
                        <PatientDetail open={open} data={selectedData} onOpenChange={handleClose}/>
                    </TableBody>
                </Table>
                
            </div>

        </div>

    )
}