import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CalendarDateRangePicker } from "../date-range-picker/date-range-picker";
import PatientTable from "./patient-table";
import { useEffect, useState } from "react";
import { PatientProfile } from "@/types/patient-profile";
import axiosInstance, { endpoints } from "@/lib/axios";
import { Skeleton } from "../ui/skeleton";
import MySkeleton from "../MySkeleton";

export default function SearchPatient(){
    const [tableData, setTableData] = useState<PatientProfile[]>([]);
    const [queryString, setQueryString] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const searchQuery = async() =>{
        const res = await axiosInstance.get(`${endpoints['search-patient-profile']}?search=${queryString}`)
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

    return(
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow p-5">
          <div className="flex flex-row space-x-4 justify-center items-center">
            {/* <Input type="date" placeholder="Start Date"/>
            <Input type="date" placeholder="End Date"/> */}
            <div className="space-y-2">
              <Label className="block text-sm font-semibbold text-gray-700 mb-1">Chọn thời gian</Label>
              <div className="relative">
                <CalendarDateRangePicker />
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