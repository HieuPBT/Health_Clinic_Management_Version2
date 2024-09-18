import { DialogDescription, DialogTrigger } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { PatientProfile } from "@/types/patient-profile";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import { TableCell } from "@mui/material";

interface Props{
    open: boolean
    onOpenChange: () => void
    data: PatientProfile | null

}
export default function PatientDetail({ open, data, onOpenChange} :Props){
    if(!data) return null;
    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>Thông tin lịch khám</DialogHeader>
               <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientName" className="text-right">Bệnh nhân</Label>
                    <Input id="patientName" className="col-span-3" readOnly value={data.patient.fullName}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientName" className="text-right">Khoa</Label>
                    <Input id="patientName" className="col-span-3" value={data.department.name} readOnly/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Danh sách thuốc</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên thuốc</TableHead>
                                <TableHead>Ghi chú</TableHead>
                                <TableHead>Số lượng</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.medicineList.map((m, index) =>(
                                <TableRow key={index}>
                                    <TableCell>Tên thuốc</TableCell>
                                    <TableCell>{m.note}</TableCell>
                                    <TableCell>{m.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
               </div>
            </DialogContent>
        </Dialog>
    )
}