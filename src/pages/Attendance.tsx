import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Filter, User, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-09-05"));
  const [searchStaffId, setSearchStaffId] = useState("");

  // Sample staff attendance data
  const staffAttendance = [
    // September 1, 2025 Records
    {
      id: "ST001",
      staffId: "EMP001",
      name: "Rajesh Kumar",
      department: "Legal",
      position: "Senior Advocate",
      checkIn: "09:15",
      checkOut: "18:30",
      status: "Present",
      date: "2025-09-01",
      workingHours: "9h 15m"
    },
    {
      id: "ST002",
      staffId: "EMP002",
      name: "Priya Sharma",
      department: "Administration",
      position: "Admin Officer",
      checkIn: "09:00",
      checkOut: "18:00",
      status: "Present",
      date: "2025-09-01",
      workingHours: "9h 0m"
    },
    {
      id: "ST003",
      staffId: "EMP003",
      name: "Amit Patel",
      department: "Legal",
      position: "Junior Advocate",
      checkIn: "10:30",
      checkOut: "19:15",
      status: "Late",
      date: "2025-09-01",
      workingHours: "8h 45m"
    },
    {
      id: "ST004",
      staffId: "EMP004",
      name: "Sunita Verma",
      department: "Finance",
      position: "Accountant",
      checkIn: "",
      checkOut: "",
      status: "Absent",
      date: "2025-09-01",
      workingHours: "-"
    },
    {
      id: "ST005",
      staffId: "EMP005",
      name: "Rakesh Gupta",
      department: "Legal",
      position: "Paralegal",
      checkIn: "08:45",
      checkOut: "17:45",
      status: "Present",
      date: "2025-09-01",
      workingHours: "9h 0m"
    },
    {
      id: "ST006",
      staffId: "EMP006",
      name: "Neha Agarwal",
      department: "Administration",
      position: "Receptionist",
      checkIn: "09:30",
      checkOut: "18:15",
      status: "Present",
      date: "2025-09-01",
      workingHours: "8h 45m"
    },
    {
      id: "ST007",
      staffId: "EMP007",
      name: "Vikram Singh",
      department: "IT",
      position: "System Administrator",
      checkIn: "08:30",
      checkOut: "17:30",
      status: "Present",
      date: "2025-09-01",
      workingHours: "9h 0m"
    },
    {
      id: "ST008",
      staffId: "EMP008",
      name: "Meera Joshi",
      department: "HR",
      position: "HR Manager",
      checkIn: "09:10",
      checkOut: "13:00",
      status: "Half Day",
      date: "2025-09-01",
      workingHours: "3h 50m"
    },

    // September 2, 2025 Records
    {
      id: "ST009",
      staffId: "EMP001",
      name: "Rajesh Kumar",
      department: "Legal",
      position: "Senior Advocate",
      checkIn: "09:00",
      checkOut: "19:00",
      status: "Present",
      date: "2025-09-02",
      workingHours: "10h 0m"
    },
    {
      id: "ST010",
      staffId: "EMP002",
      name: "Priya Sharma",
      department: "Administration",
      position: "Admin Officer",
      checkIn: "09:15",
      checkOut: "18:15",
      status: "Present",
      date: "2025-09-02",
      workingHours: "9h 0m"
    },
    {
      id: "ST011",
      staffId: "EMP003",
      name: "Amit Patel",
      department: "Legal",
      position: "Junior Advocate",
      checkIn: "",
      checkOut: "",
      status: "Absent",
      date: "2025-09-02",
      workingHours: "-"
    },
    {
      id: "ST012",
      staffId: "EMP004",
      name: "Sunita Verma",
      department: "Finance",
      position: "Accountant",
      checkIn: "09:30",
      checkOut: "18:30",
      status: "Present",
      date: "2025-09-02",
      workingHours: "9h 0m"
    },
    {
      id: "ST013",
      staffId: "EMP007",
      name: "Vikram Singh",
      department: "IT",
      position: "System Administrator",
      checkIn: "10:15",
      checkOut: "19:15",
      status: "Late",
      date: "2025-09-02",
      workingHours: "9h 0m"
    },
    {
      id: "ST014",
      staffId: "EMP008",
      name: "Meera Joshi",
      department: "HR",
      position: "HR Manager",
      checkIn: "08:45",
      checkOut: "17:45",
      status: "Present",
      date: "2025-09-02",
      workingHours: "9h 0m"
    },
    {
      id: "ST015",
      staffId: "EMP009",
      name: "Sanjay Kapoor",
      department: "Security",
      position: "Security Officer",
      checkIn: "06:00",
      checkOut: "14:00",
      status: "Present",
      date: "2025-09-02",
      workingHours: "8h 0m"
    },

    // September 3, 2025 Records
    {
      id: "ST016",
      staffId: "EMP001",
      name: "Rajesh Kumar",
      department: "Legal",
      position: "Senior Advocate",
      checkIn: "08:30",
      checkOut: "18:00",
      status: "Present",
      date: "2025-09-03",
      workingHours: "9h 30m"
    },
    {
      id: "ST017",
      staffId: "EMP005",
      name: "Rakesh Gupta",
      department: "Legal",
      position: "Paralegal",
      checkIn: "09:00",
      checkOut: "13:30",
      status: "Half Day",
      date: "2025-09-03",
      workingHours: "4h 30m"
    },
    {
      id: "ST018",
      staffId: "EMP006",
      name: "Neha Agarwal",
      department: "Administration",
      position: "Receptionist",
      checkIn: "09:00",
      checkOut: "18:00",
      status: "Present",
      date: "2025-09-03",
      workingHours: "9h 0m"
    },
    {
      id: "ST019",
      staffId: "EMP009",
      name: "Sanjay Kapoor",
      department: "Security",
      position: "Security Officer",
      checkIn: "22:00",
      checkOut: "06:00",
      status: "Present",
      date: "2025-09-03",
      workingHours: "8h 0m"
    },
    {
      id: "ST020",
      staffId: "EMP010",
      name: "Kavita Reddy",
      department: "Legal",
      position: "Legal Assistant",
      checkIn: "",
      checkOut: "",
      status: "Absent",
      date: "2025-09-03",
      workingHours: "-"
    },
    {
      id: "ST021",
      staffId: "EMP011",
      name: "Arjun Malhotra",
      department: "Legal",
      position: "Contract Specialist",
      checkIn: "09:20",
      checkOut: "18:20",
      status: "Present",
      date: "2025-09-03",
      workingHours: "9h 0m"
    },

    // September 4, 2025 Records
    {
      id: "ST022",
      staffId: "EMP002",
      name: "Priya Sharma",
      department: "Administration",
      position: "Admin Officer",
      checkIn: "08:45",
      checkOut: "17:45",
      status: "Present",
      date: "2025-09-04",
      workingHours: "9h 0m"
    },
    {
      id: "ST023",
      staffId: "EMP003",
      name: "Amit Patel",
      department: "Legal",
      position: "Junior Advocate",
      checkIn: "09:30",
      checkOut: "18:30",
      status: "Present",
      date: "2025-09-04",
      workingHours: "9h 0m"
    },
    {
      id: "ST024",
      staffId: "EMP004",
      name: "Sunita Verma",
      department: "Finance",
      position: "Accountant",
      checkIn: "10:45",
      checkOut: "19:30",
      status: "Late",
      date: "2025-09-04",
      workingHours: "8h 45m"
    },
    {
      id: "ST025",
      staffId: "EMP007",
      name: "Vikram Singh",
      department: "IT",
      position: "System Administrator",
      checkIn: "08:15",
      checkOut: "17:15",
      status: "Present",
      date: "2025-09-04",
      workingHours: "9h 0m"
    },
    {
      id: "ST026",
      staffId: "EMP012",
      name: "Deepika Rao",
      department: "Finance",
      position: "Financial Analyst",
      checkIn: "09:00",
      checkOut: "18:00",
      status: "Present",
      date: "2025-09-04",
      workingHours: "9h 0m"
    },

    // September 5, 2025 Records
    {
      id: "ST027",
      staffId: "EMP001",
      name: "Rajesh Kumar",
      department: "Legal",
      position: "Senior Advocate",
      checkIn: "08:45",
      checkOut: "19:15",
      status: "Present",
      date: "2025-09-05",
      workingHours: "10h 30m"
    },
    {
      id: "ST028",
      staffId: "EMP002",
      name: "Priya Sharma",
      department: "Administration",
      position: "Admin Officer",
      checkIn: "09:20",
      checkOut: "18:20",
      status: "Present",
      date: "2025-09-05",
      workingHours: "9h 0m"
    },
    {
      id: "ST029",
      staffId: "EMP003",
      name: "Amit Patel",
      department: "Legal",
      position: "Junior Advocate",
      checkIn: "10:45",
      checkOut: "19:30",
      status: "Late",
      date: "2025-09-05",
      workingHours: "8h 45m"
    },
    {
      id: "ST030",
      staffId: "EMP004",
      name: "Sunita Verma",
      department: "Finance",
      position: "Accountant",
      checkIn: "08:30",
      checkOut: "17:30",
      status: "Present",
      date: "2025-09-05",
      workingHours: "9h 0m"
    },
    {
      id: "ST031",
      staffId: "EMP005",
      name: "Rakesh Gupta",
      department: "Legal",
      position: "Paralegal",
      checkIn: "",
      checkOut: "",
      status: "Absent",
      date: "2025-09-05",
      workingHours: "-"
    },
    {
      id: "ST032",
      staffId: "EMP006",
      name: "Neha Agarwal",
      department: "Administration",
      position: "Receptionist",
      checkIn: "09:00",
      checkOut: "13:30",
      status: "Half Day",
      date: "2025-09-05",
      workingHours: "4h 30m"
    },
    {
      id: "ST033",
      staffId: "EMP007",
      name: "Vikram Singh",
      department: "IT",
      position: "System Administrator",
      checkIn: "08:15",
      checkOut: "17:15",
      status: "Present",
      date: "2025-09-05",
      workingHours: "9h 0m"
    },
    {
      id: "ST034",
      staffId: "EMP008",
      name: "Meera Joshi",
      department: "HR",
      position: "HR Manager",
      checkIn: "09:30",
      checkOut: "18:45",
      status: "Present",
      date: "2025-09-05",
      workingHours: "9h 15m"
    },
    {
      id: "ST035",
      staffId: "EMP009",
      name: "Sanjay Kapoor",
      department: "Security",
      position: "Security Officer",
      checkIn: "22:00",
      checkOut: "06:00",
      status: "Present",
      date: "2025-09-05",
      workingHours: "8h 0m"
    },
    {
      id: "ST036",
      staffId: "EMP010",
      name: "Kavita Reddy",
      department: "Legal",
      position: "Legal Assistant",
      checkIn: "11:15",
      checkOut: "20:00",
      status: "Late",
      date: "2025-09-05",
      workingHours: "8h 45m"
    },
    {
      id: "ST037",
      staffId: "EMP011",
      name: "Arjun Malhotra",
      department: "Legal",
      position: "Contract Specialist",
      checkIn: "09:10",
      checkOut: "18:10",
      status: "Present",
      date: "2025-09-05",
      workingHours: "9h 0m"
    },
    {
      id: "ST038",
      staffId: "EMP012",
      name: "Deepika Rao",
      department: "Finance",
      position: "Financial Analyst",
      checkIn: "",
      checkOut: "",
      status: "Absent",
      date: "2025-09-05",
      workingHours: "-"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Absent": return "bg-red-100 text-red-800 border-red-200";
      case "Late": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Half Day": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present": return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "Absent": return <XCircle className="h-4 w-4 text-red-600" />;
      case "Late": return <Clock className="h-4 w-4 text-amber-600" />;
      default: return <UserCheck className="h-4 w-4 text-slate-500" />;
    }
  };

  const filteredAttendance = staffAttendance.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStaffId = searchStaffId === "" || staff.staffId.toLowerCase().includes(searchStaffId.toLowerCase());
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    const matchesDate = selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime()) 
      ? format(selectedDate, "yyyy-MM-dd") === staff.date 
      : true;
    
    return matchesSearch && matchesStaffId && matchesStatus && matchesDate;
  });

  const attendanceStats = {
    total: staffAttendance.length,
    present: staffAttendance.filter(s => s.status === "Present").length,
    absent: staffAttendance.filter(s => s.status === "Absent").length,
    late: staffAttendance.filter(s => s.status === "Late").length
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">Attendance Management</h1>
                      <p className="text-sm text-slate-600">Track staff attendance and working hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Staff</p>
                        <p className="text-2xl font-bold text-slate-900">{attendanceStats.total}</p>
                      </div>
                      <User className="h-8 w-8 text-slate-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-600">Present</p>
                        <p className="text-2xl font-bold text-emerald-700">{attendanceStats.present}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Absent</p>
                        <p className="text-2xl font-bold text-red-700">{attendanceStats.absent}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-600">Late</p>
                        <p className="text-2xl font-bold text-amber-700">{attendanceStats.late}</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters Section */}
              <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by name or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-white/50 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by Staff ID..."
                        value={searchStaffId}
                        onChange={(e) => setSearchStaffId(e.target.value)}
                        className="pl-10 w-48 bg-white/50 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-48 justify-start text-left font-normal bg-white/50 border-slate-200",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime()) 
                            ? format(selectedDate, "PPP") 
                            : <span>Pick a date</span>
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                        <SelectItem value="Late">Late</SelectItem>
                        <SelectItem value="Half Day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Attendance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAttendance.map((staff, index) => (
                  <Card 
                    key={staff.id} 
                    className="bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-sm shadow-card border border-white/20 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(staff.status)}
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-purple-600 transition-colors duration-200">
                              {staff.name}
                            </CardTitle>
                            <CardDescription className="text-purple-600 font-medium">
                              ID: {staff.staffId}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(staff.status)} font-medium px-3 py-1`}>
                          {staff.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Department:</span>
                          <span className="font-medium text-slate-700">{staff.department}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Position:</span>
                          <span className="font-medium text-slate-700">{staff.position}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Check In:</span>
                          <span className="font-semibold text-emerald-600">
                            {staff.checkIn || "-"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Check Out:</span>
                          <span className="font-semibold text-blue-600">
                            {staff.checkOut || "-"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-sm text-slate-500">Working Hours:</span>
                          <span className="font-semibold text-slate-700">{staff.workingHours}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Results */}
              {filteredAttendance.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No attendance records found</h3>
                  <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Attendance;