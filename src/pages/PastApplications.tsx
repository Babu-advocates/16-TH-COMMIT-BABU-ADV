import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { History, FileText, Calendar, User, DollarSign, CheckCircle, XCircle, Eye, Building2, ArrowUpDown, Loader2, Phone, Mail, MapPin, Download } from "lucide-react";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { QueryForm } from "@/components/QueryForm";
import { ApplicationDetailsModal } from "@/components/ApplicationDetailsModal";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  application_id: string;
  borrower_name: string;
  loan_type: string;
  loan_amount: number;
  status: string;
  submission_date: string;
  bank_name: string;
  created_at: string;
  updated_at: string;
}

const PastApplications = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");

  // Determine if this is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Fetch applications from Supabase
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Get employee username from localStorage
        const employeeUsername = localStorage.getItem('employeeUsername');
        
        let query = supabase
          .from('applications')
          .select('*');

        if (!isAdminRoute && employeeUsername) {
          // For employee route, show only applications assigned to this employee with completed status
          query = query
            .eq('assigned_to_username', employeeUsername)
            .in('status', ['submitted', 'completed', 'approved', 'rejected']);
        } else {
          // For admin route, show all submitted applications
          query = query.eq('status', 'submitted');
        }
        
        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        setApplications(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [toast, isAdminRoute]);

  // Get unique banks for filter
  const banks = useMemo(() => {
    const uniqueBanks = [...new Set(applications
      .map(app => app.bank_name)
      .filter(bankName => bankName && bankName.trim() !== '') // Filter out empty/null bank names
    )];
    return uniqueBanks.sort();
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications;

    // Filter by bank
    if (selectedBank !== "all") {
      filtered = filtered.filter(app => app.bank_name === selectedBank);
    }

    // Sort by date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at);
      const dateB = new Date(b.updated_at);
      
      return sortOrder === "newest" 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return sorted;
  }, [applications, selectedBank, sortOrder]);
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "submitted":
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Submitted
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  const handleFileView = async (file: any, bucketName = 'application-documents') => {
    try {
      const fileName = file?.name || 'document';
      console.log('Attempting to access file:', fileName);

      // Check if file has a direct URL (newer uploads)
      if (file?.url) {
        await downloadFile(file.url, fileName);
        return;
      }

      // Check if file has a storage path (newer uploads)
      if (file?.path) {
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(file.path, 3600);

        if (signedError) {
          console.error('Error creating signed URL:', signedError);
          toast({
            title: 'Error',
            description: 'Could not access file',
            variant: 'destructive'
          });
          return;
        }

        if (signedUrlData?.signedUrl) {
          await downloadFile(signedUrlData.signedUrl, fileName);
          return;
        }
      }

      // Legacy fallback - search for file in storage
      const { data: fileList, error: listError } = await supabase.storage
        .from('application-documents')
        .list('', {
          limit: 1000,
          search: fileName
        });

      if (listError) {
        console.error('Error checking file existence:', listError);
        toast({
          title: 'Error',
          description: 'Could not check file availability',
          variant: 'destructive'
        });
        return;
      }

      const foundFile = fileList?.find(f => f.name === fileName);
      if (!foundFile) {
        toast({
          title: 'File Not Found',
          description: 'The document was not found in storage.',
          variant: 'destructive'
        });
        return;
      }

      // File found at root level
      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 3600);

      if (signedError) {
        console.error('Error creating signed URL:', signedError);
        toast({
          title: 'Error',
          description: 'Could not access file',
          variant: 'destructive'
        });
        return;
      }

      if (signedUrlData?.signedUrl) {
        await downloadFile(signedUrlData.signedUrl, fileName);
      } else {
        toast({
          title: 'Error',
          description: 'Could not access file',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Error in handleFileView:', error);
      toast({
        title: 'Error',
        description: 'Failed to access document',
        variant: 'destructive'
      });
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: 'Success',
        description: `${fileName} downloaded successfully`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Download error:', error);
      
      try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          toast({
            title: 'Popup Blocked',
            description: 'Please allow popups or check your downloads folder',
            variant: 'destructive'
          });
        }
      } catch (fallbackError) {
        toast({
          title: 'Error',
          description: 'Could not download or open the file',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        {isAdminRoute ? <AppSidebar /> : <EmployeeSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                      <History className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent">Past Applications</h1>
                      <p className="text-sm text-slate-600">View completed loan applications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
              <Card className="bg-white/95 backdrop-blur-sm shadow-elegant border border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Past Applications
                      </CardTitle>
                      <CardDescription>
                        View completed applications
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Applications</h3>
                        <p className="text-sm text-slate-600">
                          Showing {filteredAndSortedApplications.length} of {applications.length} applications
                        </p>
                      </div>
                      
                      {/* Sorting Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <Select value={selectedBank} onValueChange={setSelectedBank}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filter by bank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Banks</SelectItem>
                              {banks.map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4 text-slate-500" />
                          <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newest">Newest First</SelectItem>
                              <SelectItem value="oldest">Oldest First</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                        <span className="ml-2 text-slate-600">Loading applications...</span>
                      </div>
                    ) : filteredAndSortedApplications.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
                        <p className="text-slate-600">No applications match your current filters.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAndSortedApplications.map((application) => (
                          <Card key={application.id} className="border border-slate-200 hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <h3 className="text-lg font-semibold text-slate-800">
                                        {application.borrower_name}
                                      </h3>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(application.status)}
                                        {getStatusBadge(application.status)}
                                      </div>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      ID: {application.application_id}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-slate-500" />
                                      <span className="text-slate-600">{application.bank_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-slate-500" />
                                      <span className="text-slate-600">{application.loan_type}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-slate-500" />
                                      <span className="text-slate-600">₹{application.loan_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-slate-500" />
                                      <span className="text-slate-600">
                                        Updated: {new Date(application.updated_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedApplicationId(application.application_id);
                                      setDetailsModalOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        applicationId={selectedApplicationId}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </SidebarProvider>
  );
  };

export default PastApplications;