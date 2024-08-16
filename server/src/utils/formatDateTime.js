import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const formatDateTime = (date, time) => {
    let appointmentDate;

    if (date instanceof Date) {
        appointmentDate = new Date(date);
    }

    if (typeof time === 'string' && time.includes(':')) {
        const [hour, minute] = time.split(':');
        appointmentDate.setHours(parseInt(hour), parseInt(minute));
    } else {
        console.warn('Invalid time format:', time);
        appointmentDate.setHours(0, 0, 0, 0);
    }

    const formattedDate = format(appointmentDate, 'EEEE, dd/MM/yyyy', { locale: vi });
    const formattedTime = format(appointmentDate, 'HH:mm');

    return {
        date: formattedDate,
        time: formattedTime
    };
};

export default formatDateTime;
