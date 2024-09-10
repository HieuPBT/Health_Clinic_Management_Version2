"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axiosInstance, { endpoints } from '@/lib/axios';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

type Department = {
  _id: string;
  name: string;
};

type Appointment = {
  _id: string;
  patient: string;
  department: Department;
  bookingDate: string;
  bookingTime: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  confirmedBy?: string;
};

type AppointmentStatus = 'TẤT CẢ' | 'CHƯA XÁC NHẬN' | 'ĐÃ XÁC NHẬN' | 'ĐÃ HUỶ' | 'ĐÃ TỪ CHỐI' | 'CHƯA THANH TOÁN' | 'ĐÃ THANH TOÁN';

type ApiResponse = {
  results: Appointment[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  nextPage: string | null;
  prevPage: string | null;
};

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>('TẤT CẢ');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const {toast} = useToast();

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      let params = {
        page: currentPage
      }
      if (currentStatus !== 'TẤT CẢ') {
        params.status = currentStatus;
      }
      const response = await axiosInstance.get(endpoints['my-appointment'], {
        params: params
      });
      setAppointments(response.data.results);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, currentStatus]);

  const handleAction = async (appointmentId: string, action: 'cancel' | 'rebook' | 'pay') => {
    try {
      switch (action) {
        case 'cancel':
          setAppointmentToCancel(appointmentId);
          setShowConfirmDialog(true);
        case 'rebook':
        case 'pay':
        default:
      }
    } catch (err) {
      console.log(err);
    }
    await fetchAppointments();
  };

  const confirmCancelAppointment = async () => {
    if (appointmentToCancel) {
      try {
        await axiosInstance.patch(endpoints['cancel-appointment'](appointmentToCancel));
        toast({
          title: 'Thành công!',
          description: 'Hủy lịch hẹn thành công! Bạn có thể nhấn nút "đặt lại" để đặt lịch lại.'
        })
        await fetchAppointments();
      } catch (err) {
        console.log(err);
      }
    }
    setShowConfirmDialog(false);
    setAppointmentToCancel(null);
  };

  const renderActionButton = (appointment: Appointment) => {
    switch (appointment.status) {
      case 'CHƯA XÁC NHẬN':
      case 'ĐÃ XÁC NHẬN':
        return <Button onClick={() => handleAction(appointment._id, 'cancel')}>Hủy</Button>;
      case 'ĐÃ HUỶ':
      case 'ĐÃ TỪ CHỐI':
      case 'ĐÃ THANH TOÁN':
        return <Button onClick={() => handleAction(appointment._id, 'rebook')}>Đặt lại</Button>;
      case 'CHƯA THANH TOÁN':
        return <Button onClick={() => handleAction(appointment._id, 'pay')}>Thanh toán</Button>;
      default:
        return null;
    }
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <Card className="mb-4">
      <CardContent className="flex justify-between items-center p-4">
        <div>
          <p className="font-bold">{new Date(appointment.bookingDate).toLocaleDateString()} - {appointment.bookingTime}</p>
          <p>{appointment.department.name}</p>
          <p>{appointment.status}</p>
        </div>
        {renderActionButton(appointment)}
      </CardContent>
    </Card>
  );

  const SkeletonCard: React.FC = () => (
    <Card className="mb-4">
      <CardContent className="flex justify-between items-center p-4">
        <div className="w-2/3">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </CardContent>
    </Card>
  );

  const filteredAppointments = currentStatus === 'TẤT CẢ'
    ? appointments
    : appointments.filter(app => app.status === currentStatus);

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    setCurrentStatus(newStatus);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={currentStatus} onValueChange={(value) => handleStatusChange(value as AppointmentStatus)}>
        <TabsList>
          <TabsTrigger value="TẤT CẢ">Tất cả</TabsTrigger>
          <TabsTrigger value="CHƯA XÁC NHẬN">Chưa xác nhận</TabsTrigger>
          <TabsTrigger value="ĐÃ XÁC NHẬN">Đã xác nhận</TabsTrigger>
          <TabsTrigger value="CHƯA THANH TOÁN">Chưa thanh toán</TabsTrigger>
          <TabsTrigger value="ĐÃ THANH TOÁN">Đã thanh toán</TabsTrigger>
          <TabsTrigger value="ĐÃ HUỶ">Đã hủy</TabsTrigger>
          <TabsTrigger value="ĐÃ TỪ CHỐI">Đã từ chối</TabsTrigger>
        </TabsList>
        <TabsContent value={currentStatus}>
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment._id} appointment={appointment} />
            ))
          )}
          <div className="flex justify-between mt-4">
            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Trang trước
            </Button>
            <span>Trang {currentPage} / {totalPages}</span>
            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              Tiếp
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy lịch hẹn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelAppointment}>Xác nhận hủy</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyAppointments;
