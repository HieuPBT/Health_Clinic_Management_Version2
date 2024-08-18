import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance, { endpoints } from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Medicine {
    name: string;
    quantity: number;
    note?: string;
}

interface PrescriptionForm {
    appointment: string;
    description: string;
    conclusion: string;
    medicines: Medicine[];
}

interface PrescriptionDialogProps {
    id: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
    appointment: z.string(),
    description: z.string().optional(),
    conclusion: z.string().min(2, "Kết Luận phải có ít nhất 2 ký tự"),
    medicines: z.array(
        z.object({
            name: z.string(),
            quantity: z.number().min(1, "Số Lượng phải lớn hơn 0"),
            note: z.string().optional(),
        })
    ).optional(),
});

const PrescriptionDialog: React.FC<PrescriptionDialogProps> = ({
    isOpen,
    onOpenChange,
    id
}) => {
    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<PrescriptionForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            appointment: id,
            description: "",
            conclusion: "",
            medicines: [],
        },
    });

    const { fields, append, update, remove } = useFieldArray({
        control,
        name: "medicines",
    });

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Medicine[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

    useEffect(() => {
        const fetchMedicines = async () => {
            if (searchTerm.length > 1) {
                try {
                    const response = await axiosInstance.get(`${endpoints['search-medicines']}?name=${searchTerm}`);
                    setSearchResults(response.data.results);
                } catch (error) {
                    console.error("Error fetching medicines:", error);
                }
            }
        };

        fetchMedicines();
    }, [searchTerm]);

    const handleAddMedicine = () => {
        if (selectedMedicine) {
            const existingIndex = fields.findIndex(
                (med) => med.name === selectedMedicine.name
            );

            if (existingIndex >= 0) {
                const existingMedicine = fields[existingIndex];
                update(existingIndex, {
                    ...existingMedicine,
                    quantity: existingMedicine.quantity + 1,
                });
            } else {
                append({ name: selectedMedicine.name, quantity: 1, note: "" });
            }

            setSelectedMedicine(null);
            setSearchTerm("");
            setSearchResults([]);
        }
    };

    const onSubmit = async (data: PrescriptionForm) => {
        try {

            await axiosInstance.post(endpoints['create-prescription'], data);
            console.log(data)
            onOpenChange(false);
            reset(); 
        } catch (error) {
            console.error("Error submitting form", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Kê Toa</DialogTitle>
                    <DialogDescription>Kê toa thuốc cho bệnh nhân</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Mô Tả
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Mô Tả"
                                {...register("description")}
                                className="col-span-3"
                            />
                            {errors.description && (
                                <p className="col-span-4 text-red-500 text-sm">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="conclusion" className="text-right">
                                Kết Luận
                            </Label>
                            <Input
                                id="conclusion"
                                {...register("conclusion")}
                                className="col-span-3"
                            />
                            {errors.conclusion && (
                                <p className="col-span-4 text-red-500 text-sm">
                                    {errors.conclusion.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <Label className="text-right">Danh sách thuốc</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    placeholder="Tìm kiếm thuốc"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="col-span-3"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddMedicine}
                                    disabled={!selectedMedicine}
                                >
                                    <PlusCircle className="mr-2" />
                                    Thêm thuốc
                                </Button>
                            </div>
                            {searchResults.length > 0 && (
                                <div className="mt-2">
                                    <Select
                                        onValueChange={(value) =>
                                            setSelectedMedicine(searchResults.find((med) => med.name === value) || null)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn thuốc từ kết quả tìm kiếm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {searchResults.map((medicine, index) => (
                                                <SelectItem key={index} value={medicine.name}>
                                                    {medicine.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {fields.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-6 items-center gap-4"
                                >
                                    <Input
                                        placeholder="Tên Thuốc"
                                        {...register(`medicines.${index}.name` as const)}
                                        className="col-span-2"
                                        readOnly
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Số Lượng"
                                        {...register(`medicines.${index}.quantity` as const)}
                                        className="col-span-1"
                                    />
                                    <Input
                                        placeholder="Note"
                                        {...register(`medicines.${index}.note` as const)}
                                        className="col-span-2"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => remove(index)}
                                        className="col-span-1"
                                    >
                                        <XCircle className="mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Lưu</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PrescriptionDialog;
