export interface PatientProfile{
    _id: string,
    doctor: Doctor,
    appointment: Appointment,
    department: Department,
    patient: Patient,
    medicineList: MedicineList[],
    description: string,
    conclusion: string,
}

interface Doctor{
    _id: string,
    name: string,
}

interface Appointment{
    _id: string,
    bookingDate: string,
    bookingTime: string,
}

interface Medicine {
    name: string,
    unit: string
}

interface MedicineList{
    medicine: Medicine,
    quantity: number,
    note: string
}

interface Patient{
    _id: string,
    email: string,
    fullName: string,
}

interface Department{
    _id: string,
    name: string
}
