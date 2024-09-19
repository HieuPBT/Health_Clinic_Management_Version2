import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CalendarDateRangePicker } from "../date-range-picker/date-range-picker";
import PatientTable from "./patient-table";
import { useContext, useEffect, useState } from "react";
import { PatientProfile } from "@/types/patient-profile";
import axiosInstance, { endpoints } from "@/lib/axios";
import MySkeleton from "../MySkeleton";
import { DateRange } from "react-day-picker";
import { UserContext, UserContextType } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function SearchPatient(){
    const [tableData, setTableData] = useState<PatientProfile[]>([]);
    const [queryString, setQueryString] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [searchDate, setSearchDate] = useState<DateRange | undefined>();
    const {user, isLoading} = useContext(UserContext) as UserContextType;
    const router = useRouter();

    const searchQuery = async() =>{
        const res = await axiosInstance.get(`${endpoints['search-patient-profile']}?search=${queryString}${searchDate && `&start_date=${searchDate.from}&end_date=${searchDate.to}`}`)
        setTableData(res.data.results);
        setLoading(false);

    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
      setQueryString(e.target.value);
    }

    useEffect(() =>{
      if(queryString !== ""){
        searchQuery();
      }
      else
        setTableData([]);

    },[queryString])

    if(!user){
      router.push('/login');
      return null;
    }

    if(user && user.role !== "doctor"){
      router.push("/");
      return null;
    }

    return(
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow p-5">
          <div className="flex flex-row space-x-4 justify-center items-center">
            <div className="space-y-2">
              <Label className="block text-sm font-semibbold text-gray-700 mb-1">Chọn thời gian</Label>
              <div className="relative">
                <CalendarDateRangePicker onDateChange={setSearchDate}/>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-gray-700 mb-1">Tìm kiếm</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-gray-500"/>
                <Input
                  className="pl-8 md:w-[100px] lg:w-[300px]"
                  type="search"
                  placeholder="Tên bệnh nhân hoặc email"
                  value={queryString}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            {loading ? <MySkeleton rows={1}/> :
              <PatientTable data={tableData}/>
            }
          </div>
        </div>
    )
}
