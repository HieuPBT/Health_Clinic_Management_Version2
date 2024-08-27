import { AppointmentInterface } from "./AppointmentInterface"
import { Medicine } from "./MedicineInterface"

export interface Prescription {
    _id: string,
    doctor: string,
    appointment: AppointmentInterface,
    medicineList: Medicine[],
    description: string,
    conclusion: string
}