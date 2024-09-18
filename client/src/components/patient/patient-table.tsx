import { 
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
 } from "../ui/table";

export default function PatientTable(){
    return(
        <div className="overflow-x-auto">
            <div>
            <Table className="rounded-md border">
            {/* <TableCaption>test</TableCaption> */}
            <TableHeader>
                <TableRow>
                    <TableHead>PatientID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>conclusion</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>BN01</TableCell>
                    <TableCell>Nguyễn văn a</TableCell>
                    <TableCell>Vitamin</TableCell>
                    <TableCell>12/02/2003</TableCell>
                </TableRow>
            </TableBody>
        </Table>
            </div>
            
        </div>
        
    )
}