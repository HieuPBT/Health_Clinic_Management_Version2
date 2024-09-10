export interface AppointmentInterface {
    _id: string;
    department: { name: string };
    patient: {
        fullName: string,
        email: string;
    }
    bookingDate: string;
    bookingTime: string;
    status: string;
}