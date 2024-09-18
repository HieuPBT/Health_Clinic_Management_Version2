import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CalendarDateRangePicker } from "../date-range-picker/date-range-picker";
import PatientTable from "./patient-table";

export default function SearchPatient(){
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
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <PatientTable />
          </div>
        </div>
    )
}