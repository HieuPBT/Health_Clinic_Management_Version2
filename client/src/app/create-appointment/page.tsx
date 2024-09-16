"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import axiosInstance, { endpoints } from '@/lib/axios';
import { yyyyMdFmt } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

const ALLOWED_BOOKING_TIMES = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const DISABLED_DATES = [
  new Date(2024, 7, 15),  // August 15, 2024
  new Date(2024, 7, 16),  // August 16, 2024
];

const DISABLED_TIMES = ['09:00', '13:30', '16:00'];

interface Department {
  _id: string;
  name: string;
}

const AppointmentBooking = () => {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [fromDate, setFromDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [disabledDates, setDisabledDates] = useState([]);
  const [toDate, setToDate] = useState(() => {
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    return thirtyDaysLater;
  });
  const [date, setDate] = useState(null);
  const [availableBookingTimes, setAvailableBookingTimes] = useState([]);
  const { toast } = useToast();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const isDateDisabled = (date: Date) => {
    return disabledDates.some((disabledDate: Date) =>
      date.getFullYear() === disabledDate.getFullYear() &&
      date.getMonth() === disabledDate.getMonth() &&
      date.getDate() === disabledDate.getDate()
    );
  };

  const loadDepartments = useCallback(async () => {
    try {
      const res = await axiosInstance.get(endpoints['departments']);
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [])

  const loadDisabledDates = useCallback(async () => {
    try {
      const res = await axiosInstance.get(endpoints['appointments-count']);
      setDisabledDates(res.data.filter((d: any) => d.count >= 3).map((d: any) => new Date(d.date)))
    } catch (err) {
      console.error(err);
    }
  }, [])

  const loadAllowedBookingTimes = async () => {
    console.log("Loading all bookings")
    try {
      const res = await axiosInstance.get(`${endpoints['available-booking-times']}?date=${yyyyMdFmt(date)}&department=${department}`)
      setAvailableBookingTimes(res.data);
    } catch (err) {
      console.error(err);
    }
  }
  if(!user){
    router.push("/login")
    return null;
  }

  useEffect(() => {
    if (step === 2) {
      loadDisabledDates();
    }
  }, [step])

  useEffect(() => {
    loadDepartments();
  }, [])

  useEffect(() => {
    if (step === 3)
      loadAllowedBookingTimes();
  }, [step])

  const createAppointment = async () => {
    try {
      const res = await axiosInstance.post(endpoints['create-appointment'], {
        department: department,
        bookingDate: yyyyMdFmt(date),
        bookingTime: time
      })
      if (res.status === 201) {
        toast({
          title: 'Thành công!',
          description: 'Đặt lịch thành công! Vui lòng chờ y tá xác nhận lịch hẹn của bạn.'
        })
        setStep(1);
        setDate(null);
        setTime('');
        setDepartment('');
      }
    } catch (err) {
      console.error(err);
    }
  }


  const isTimeDisabled = (time: never) => !availableBookingTimes.includes(time);

  const Legend = () => (
    <div className="flex flex-col space-y-2 mt-4">
      <div className="text-sm font-semibold">Chú thích:</div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        <span>Còn lịch</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
        <span>Kín lịch</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-green-500 rounded"></div>
        <span>Đang chọn</span>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Chọn khoa khám</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setDepartment} value={department}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoa khám" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept: Department) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={nextStep} disabled={!department} className="mt-4">
                Tiếp
              </Button>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Chọn ngày khám</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                fromDate={fromDate}
                toDate={toDate}
                onSelect={(newDate) => newDate && setDate(newDate)}
                disabled={isDateDisabled}
                className="rounded-md border"
              />
              <CardDescription>
                Lưu ý: Chỉ có thể đặt lịch cho ngày mai cho đến 30 ngày tiếp theo. Những ngày không thể chọn là do khoa đã kín lịch hẹn ngày hôm đó.
              </CardDescription>
              <div className="flex justify-between mt-4">
                <Button onClick={prevStep}>Quay lại</Button>
                <Button onClick={nextStep} disabled={!date}>Tiếp</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        // loadAllowedBookingTimes();
        return (
          <Card>
            <CardHeader>
              <CardTitle>Chọn khung giờ khám</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {ALLOWED_BOOKING_TIMES.map((t) => (
                  <Button
                    key={t}
                    onClick={() => setTime(t)}
                    variant={time === t ? "default" : "outline"}
                    disabled={isTimeDisabled(t)}
                    className={`w-full ${isTimeDisabled(t)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : time === t
                        ? 'bg-green-500 text-white'
                        : 'bg-sky-400 text-white'
                      }`}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <Legend />
              <div className="flex justify-between mt-4">
                <Button onClick={prevStep}>Quay lại</Button>
                <Button onClick={createAppointment} disabled={!time}>
                  Xác nhận đặt lịch
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-between mt-4">
                <Button onClick={prevStep}>Quay lại</Button>
                <Button onClick={() => alert('Booking confirmed!')} disabled={!paymentMethod}>
                  Xác nhận đặt lịch
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Đặt lịch khám</h1>
      {renderStep()}
    </div>
  );
};

export default AppointmentBooking;
