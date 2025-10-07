import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LitigationSidebar } from "@/components/LitigationSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, Search, Filter, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - Replace with actual data from your backend
const mockCases = [
  {
    id: "1",
    category: "bank",
    caseNo: "O.S.123/2024",
    borrowerName: "John Doe",
    bankName: "State Bank",
    courtName: "District Court",
    courtDistrict: "Chennai",
    filingDate: "2024-01-15",
    nextHearingDate: "2024-11-20",
    status: "Active",
    loanAmount: "5000000",
  },
  {
    id: "2",
    category: "private",
    caseNo: "C.S.456/2024",
    borrowerName: "Jane Smith",
    bankName: "-",
    courtName: "High Court",
    courtDistrict: "Madurai",
    filingDate: "2024-02-10",
    nextHearingDate: "2024-11-25",
    status: "Pending",
    loanAmount: "-",
  },
  {
    id: "3",
    category: "bank",
    caseNo: "O.S.789/2024",
    borrowerName: "Robert Wilson",
    bankName: "HDFC Bank",
    courtName: "Sessions Court",
    courtDistrict: "Coimbatore",
    filingDate: "2024-03-05",
    nextHearingDate: "2024-12-01",
    status: "Active",
    loanAmount: "7500000",
  },
];

export default function AllLitigationCases() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredCases = mockCases.filter((caseItem) => {
    const matchesSearch =
      caseItem.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.courtName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || caseItem.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" || caseItem.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Active: "default",
      Pending: "secondary",
      Closed: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-100 font-kontora">
        <LitigationSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">All Cases</h1>
              <p className="text-sm text-muted-foreground">View and manage all litigation cases</p>
            </div>
            <Button
              onClick={() => navigate("/litigation/create")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Scale className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Litigation Cases</CardTitle>
                    <CardDescription>
                      {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""} found
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by case no, borrower name, or court..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case No</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Borrower Name</TableHead>
                        <TableHead>Bank Name</TableHead>
                        <TableHead>Court</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Filing Date</TableHead>
                        <TableHead>Next Hearing</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            No cases found. Try adjusting your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCases.map((caseItem) => (
                          <TableRow key={caseItem.id}>
                            <TableCell className="font-medium">{caseItem.caseNo}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {caseItem.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{caseItem.borrowerName}</TableCell>
                            <TableCell>{caseItem.bankName}</TableCell>
                            <TableCell>{caseItem.courtName}</TableCell>
                            <TableCell>{caseItem.courtDistrict}</TableCell>
                            <TableCell>{new Date(caseItem.filingDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(caseItem.nextHearingDate).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Navigate to case details page when implemented
                                  console.log("View case:", caseItem.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
