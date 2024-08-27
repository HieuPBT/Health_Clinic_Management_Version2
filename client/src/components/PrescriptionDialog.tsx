import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance, { endpoints } from "@/lib/axios";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import MedicationIcon from '@mui/icons-material/Medication';
import { toast } from "./ui/use-toast";
import { FormField } from "./ui/form";
import { Medicine } from "./interface/MedicineInterface";

interface PrescriptionForm {
    appointment: string;
    description?: string;
    conclusion: string;
    medicineList: Medicine[];
}

interface PrescriptionDialogProps {
    id: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onRemove: (appointmentId: string) => void;
}

interface MedicineInputProps {
    onAddMedicine: (medicine: Medicine) => void;
}

const formSchema = z.object({
    appointment: z.string(),
    description: z.string().optional(),
    conclusion: z.string().min(2, "Kết Luận phải có ít nhất 2 ký tự"),
    medicineList: z.array(
        z.object({
            name: z.string(),
            quantity: z.number().min(1, "Số Lượng phải lớn hơn 0"),
            note: z.string().optional(),
        })
    ).optional(),
});

const useMedicineSearch = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Medicine[]>([]);

    useEffect(() => {
        const fetchMedicines = async () => {
            if (searchTerm.length > 0) {
                try {
                    const response = await axiosInstance.get<Medicine[]>(`${endpoints['search-medicines']}?name=${searchTerm}`);
                    setSearchResults(response.data);
                } catch (error) {
                    console.error("Error fetching medicines", error);
                }
            } else setSearchResults([]);
        };

        const debounce = setTimeout(fetchMedicines, 100);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    return { searchTerm, setSearchTerm, searchResults };
};

const MedicineInput: React.FC<MedicineInputProps> = ({ onAddMedicine }) => {
    const { searchTerm, setSearchTerm, searchResults } = useMedicineSearch();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button>Nhập tên thuốc</Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" side="right" align="start">
                <Command>
                    <CommandInput placeholder="Nhập tên thuốc" value={searchTerm} onValueChange={setSearchTerm} />
                    <CommandList>
                        {/* <CommandEmpty>Không tìm thấy</CommandEmpty> */}
                        {searchResults.map((s: any) => (
                            <CommandItem key={s.id} value={s.name}
                                onSelect={() => onAddMedicine({ name: s.name, quantity: 1 })}
                            >
                                <MedicationIcon className="mr-2 h-4 w-4" />
                                {s.name}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const PrescriptionDialog: React.FC<PrescriptionDialogProps> = ({ isOpen, onOpenChange, id, onRemove }) => {
    const { control, handleSubmit, register, reset, formState: { errors } } = useForm<PrescriptionForm>({
        resolver: zodResolver(formSchema),
        defaultValues: { appointment: id, description: "", conclusion: "", medicineList: [] },
    });

    const { fields, append, update, remove } = useFieldArray({
        control,
        name: "medicineList",
    });

    const handleAddMedicine = (selectedMedicine: Medicine) => {
        const existingIndex = fields.findIndex(
            (med) => med.name === selectedMedicine.name
        );

        if (existingIndex >= 0) {
            update(existingIndex, { ...fields[existingIndex], quantity: fields[existingIndex].quantity + 1 });
        } else {
            append({ ...selectedMedicine, quantity: 1 });
        }
    };

    const onSubmit: SubmitHandler<PrescriptionForm> = async (data) => {
        try {
            console.log(data);
            await axiosInstance.post(endpoints['create-prescription'], data);
            toast({
                title: "Thành Công",
                description: "Kê Toa Thuốc Thành Công"
            })
            onOpenChange(false);
            reset();
            if(onRemove) onRemove(data.appointment);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi, Không thể kê toa",
                description: "Vui lòng thử lại"
            })
            console.error(error);
        }
    };

    const formFields = useMemo(() => (
        <>
            <div className="grid gap-4 py-4">
                {(["description", "conclusion"] as const).map((field) => (
                    <div key={field} className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">{field === "description" ? "Mô Tả" : "Kết Luận"}</Label>
                        {field === "description" ? (
                            <Textarea id={field} placeholder="Mô Tả" {...register(field)} className="col-span-3"/>
                        ) :
                        (
                            <Input id={field} {...register(field)} className="col-span-3"/>
                        )
                    }
                    {errors[field] && (
                        <p className="col-span-4 text-red-500 text-sm">{errors[field]?.message}</p>
                    )}                   
                    </div>
                ))}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Thêm Thuốc</Label>
                    <div className="col-span-3 flex items-center space-x-4">
                        <MedicineInput onAddMedicine={handleAddMedicine}/>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 mt-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-6 items-center gap-4">
                        <Input placeholder="Tên Thuốc" {...register(`medicineList.${index}.name`)} className="col-span-2" readOnly />
                        <Input type="number" placeholder="Số Lượng" {...register(`medicineList.${index}.quantity`, {
                                valueAsNumber: true, 
                                min: { value: 1, message: "Số lượng phải lớn hơn 0" },
                            })}
                            className="col-span-1"
                        />
                        {errors.medicineList?.[index]?.quantity && (
                            <p className="col-span-6 text-red-500 text-sm">{errors.medicineList[index]?.quantity?.message}</p>
                        )}
                        <Input placeholder="Ghi chú" {...register(`medicineList.${index}.note`)} className="col-span-2" />
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => remove(index)}
                            className="col-span-1"
                        >
                            <XCircle className="mr-1" />Xóa
                        </Button>
                    </div>
                ))}
            </div>
        </>
    ), [fields, errors, register, remove]);

return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Kê Toa</DialogTitle>
                <DialogDescription>Kê toa thuốc cho bệnh nhân</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                {formFields}
                <DialogFooter className="mt-3">
                    <Button type="submit">Tạo</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    );
};

export default PrescriptionDialog;
