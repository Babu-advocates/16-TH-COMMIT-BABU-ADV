import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Download, Search, IndianRupee, Calendar as CalendarIcon, FileText, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { AppSidebar } from "@/components/AppSidebar";

const PaymentDetails = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Sample payment data
  const payments = [
    {
      id: "PAY001",
      caseId: "CASE001",
      bankName: "State Bank of India",
      amount: 50000,
      paymentDate: "2024-01-15",
      status: "Completed",
      paymentMethod: "Bank Transfer",
      transactionId: "TXN123456789",
      clientName: "Ramesh Kumar",
      description: "Legal fee for loan recovery case"
    },
    {
      id: "PAY002", 
      caseId: "CASE002",
      bankName: "HDFC Bank",
      amount: 35000,
      paymentDate: "2024-01-14",
      status: "Completed",
      paymentMethod: "UPI",
      transactionId: "UPI987654321",
      clientName: "Priya Sharma",
      description: "Consultation and documentation fee"
    },
    {
      id: "PAY003",
      caseId: "CASE003", 
      bankName: "ICICI Bank",
      amount: 75000,
      paymentDate: "2024-01-13",
      status: "Pending",
      paymentMethod: "Cheque",
      transactionId: "CHQ456789123",
      clientName: "Suresh Patel",
      description: "Court representation fee"
    },
    {
      id: "PAY004",
      caseId: "CASE004",
      bankName: "Axis Bank", 
      amount: 42000,
      paymentDate: "2024-01-12",
      status: "Completed",
      paymentMethod: "NEFT",
      transactionId: "NEFT789123456",
      clientName: "Anjali Gupta",
      description: "Legal advisory fee"
    },
    {
      id: "PAY005",
      caseId: "CASE005",
      bankName: "Punjab National Bank",
      amount: 28000,
      paymentDate: "2024-01-11",
      status: "Failed",
      paymentMethod: "Bank Transfer",
      transactionId: "TXN321654987",
      clientName: "Vikram Singh",
      description: "Document verification fee"
    },
    {
      id: "PAY006",
      caseId: "CASE006",
      bankName: "Canara Bank",
      amount: 60000,
      paymentDate: "2024-01-10",
      status: "Completed",
      paymentMethod: "RTGS",
      transactionId: "RTGS654321789",
      clientName: "Meera Nair",
      description: "Loan agreement drafting fee"
    }
  ];

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === "" || 
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.caseId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Check if payment date falls within selected date range
    const matchesDateRange = !dateRange?.from || !dateRange?.to || (() => {
      const paymentDate = new Date(payment.paymentDate);
      const startDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      
      // Set time to start/end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      paymentDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      return paymentDate >= startDate && paymentDate <= endDate;
    })();

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalAmount = filteredPayments
    .filter(p => p.status.toLowerCase() === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Payment ID", "Case ID", "Bank Name", "Client Name", "Amount", "Payment Date", "Status", "Payment Method", "Transaction ID", "Description"];
    const csvContent = [
      headers.join(","),
      ...filteredPayments.map(payment => [
        payment.id,
        payment.caseId,
        payment.bankName,
        payment.clientName,
        payment.amount,
        payment.paymentDate,
        payment.status,
        payment.paymentMethod,
        payment.transactionId,
        `"${payment.description}"`
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment_details_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">Payment Details</h1>
                      <p className="text-sm text-slate-600">Track all payment transactions</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg transition-all duration-200 hover-scale"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-emerald-50/30 backdrop-blur-sm shadow-elegant border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <IndianRupee className="h-6 w-6 text-emerald-600" />
                <h3 className="font-semibold text-slate-700">Total Received</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600">₹{totalAmount.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Completed payments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-sm shadow-elegant border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-700">Total Transactions</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{filteredPayments.length}</p>
              <p className="text-sm text-slate-600 mt-1">Payment records</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/95 to-amber-50/30 backdrop-blur-sm shadow-elegant border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-6 w-6 text-amber-600" />
                <h3 className="font-semibold text-slate-700">This Month</h3>
              </div>
              <p className="text-2xl font-bold text-amber-600">₹{(totalAmount * 0.7).toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Current month earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-elegant border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <span>Filter Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by client, bank, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          format(dateRange.from, "LLL dd, y")
                        ) : (
                          <span>Pick start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.to ? (
                          format(dateRange.to, "LLL dd, y")
                        ) : (
                          <span>Pick end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        disabled={(date) => dateRange?.from ? date < dateRange.from : false}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-elegant border border-white/20">
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>
              View and manage all payment transactions from your clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-blue-600">{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.caseId}</TableCell>
                      <TableCell>{payment.clientName}</TableCell>
                      <TableCell>{payment.bankName}</TableCell>
                      <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell className="text-slate-600 text-sm">{payment.transactionId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No payments found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PaymentDetails;