'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import axiosInstance, { endpoints } from '@/lib/axios';
import Paginator from '@/components/Pagination';
import { emitOpenChatEvent } from '@/lib/chatEvents'; // Import the new function

interface MedicalStaff {
    _id: string;
    fullName: string;
    role: string;
    avatar?: string;
    email: string;
}

const MedicalStaffList: React.FC = () => {
    const [staff, setStaff] = useState<MedicalStaff[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchStaff();
        }
    }, [currentPage, searchTerm, isMounted]);

    const fetchStaff = async () => {
        try {
            const response = await axiosInstance.get(endpoints['staff'], {
                params: { page: currentPage, search: searchTerm }
            });
            setStaff(response.data.staff);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch medical staff:', error);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleMessage = (staffEmail: string) => {
        console.log("Handling message for:", staffEmail);
        emitOpenChatEvent(staffEmail);
    };

    if (!isMounted) {
        return null; // or a loading indicator
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Danh sách Y tá và Bác sĩ</h1>
            <Input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email"
                value={searchTerm}
                onChange={handleSearch}
                className="mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
                {staff.map((member) => (
                    <Card key={member._id}>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Avatar className="mr-2">
                                    <img src={member.avatar || '/user.png'} alt={member.fullName} />
                                </Avatar>
                                {member.fullName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{member.role === "nurse" ? "Y tá" : "Bác sĩ"}</p>
                            <p>email: {member.email}</p>
                            <Button
                                onClick={() => handleMessage(member.email)}
                                className="mt-2"
                            >
                                <MessageSquare className="mr-2 h-4 w-4" /> Nhắn tin ngay
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default MedicalStaffList;
