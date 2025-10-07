import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArrowLeft, Landmark, Eye, Calendar, Shield, Edit, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CreateBankAccountList = () => {
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch bank accounts on component mount and after successful updates
  const fetchBankAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bank accounts:', error);
        showToast.error("Failed to load bank accounts");
      } else {
        setBankAccounts(data || []);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      showToast.error("Failed to load bank accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
    
    // Set up real-time subscription for bank_accounts
    const channel = supabase
      .channel('bank-accounts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bank_accounts' }, 
        () => {
          fetchBankAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEdit = (account: any) => {
    setEditingId(account.id);
    setEditUsername(account.username);
    setEditPassword(account.password);
    setEditBankName(account.bank_name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditUsername("");
    setEditPassword("");
    setEditBankName("");
  };

  const handleUpdateAccount = async (accountId: string) => {
    if (!editUsername.trim() || !editPassword.trim() || !editBankName.trim()) {
      showToast.error("Please fill in all fields");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({
          username: editUsername.trim(),
          password: editPassword,
          bank_name: editBankName.trim(),
        })
        .eq('id', accountId);

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          showToast.error("Username already exists. Please choose a different username.");
        } else {
          showToast.error(`Failed to update account: ${error.message}`);
        }
        return;
      }

      showToast.success("Bank account updated successfully!");
      handleCancelEdit();
      fetchBankAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      showToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="bg-gradient-to-r from-white/95 via-blue-50/95 to-purple-50/95 backdrop-blur-lg shadow-xl border-b border-gradient-to-r from-blue-200/30 to-purple-200/30">
            <div className="px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-6">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-110" />
                  <Button
                    onClick={() => navigate("/admin-dashboard")}
                    variant="ghost"
                    className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50/50 rounded-xl px-4 py-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg">
                    <Landmark className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-green-600 to-blue-600 bg-clip-text text-transparent">
                      Bank Account Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage bank login credentials</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Bank Accounts Table Section */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto">
              <Card className="bg-gradient-to-br from-white/90 via-slate-50/20 to-green-50/20 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5"></div>
                <CardHeader className="relative bg-gradient-to-r from-green-600/10 to-blue-600/10 border-b border-slate-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-green-600 bg-clip-text text-transparent">
                          Created Bank Accounts
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">View and manage all bank login credentials</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-green-50/50 px-4 py-2 rounded-xl">
                        <Landmark className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {bankAccounts.length} Account{bankAccounts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button
                        onClick={() => navigate("/admin/create-bank-account")}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Landmark className="h-4 w-4 mr-2" />
                        Create New Account
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8">
                  {isLoadingAccounts ? (
                    <div className="flex justify-center items-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                      <span className="ml-4 text-slate-600 font-medium">Loading bank accounts...</span>
                    </div>
                  ) : bankAccounts.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/50">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-slate-50 to-green-50 border-slate-200/50">
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Landmark className="h-4 w-4" />
                                <span>Bank Name</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Username</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Password</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Date Created</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6">Status</TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bankAccounts.map((account, index) => (
                            <TableRow key={account.id} className={`border-slate-100/50 hover:bg-gradient-to-r hover:from-green-50/30 hover:to-blue-50/30 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                            }`}>
                              {/* Bank Name Column */}
                              <TableCell className="font-bold text-slate-800 py-4 px-6">
                                {editingId === account.id ? (
                                  <Input
                                    value={editBankName}
                                    onChange={(e) => setEditBankName(e.target.value)}
                                    className="h-8 bg-white border border-green-300 focus:border-green-500 rounded-md"
                                    placeholder="Enter bank name"
                                  />
                                ) : (
                                  account.bank_name
                                )}
                              </TableCell>

                              {/* Username Column */}
                              <TableCell className="font-medium text-slate-700 py-4 px-6">
                                {editingId === account.id ? (
                                  <Input
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="h-8 bg-white border border-blue-300 focus:border-blue-500 rounded-md"
                                    placeholder="Enter username"
                                  />
                                ) : (
                                  account.username
                                )}
                              </TableCell>

                              {/* Password Column */}
                              <TableCell className="font-mono text-slate-600 py-4 px-6">
                                {editingId === account.id ? (
                                  <Input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    className="h-8 bg-white border border-purple-300 focus:border-purple-500 rounded-md"
                                    placeholder="Enter password"
                                  />
                                ) : (
                                  "••••••••"
                                )}
                              </TableCell>

                              {/* Date Created Column */}
                              <TableCell className="text-slate-600 py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">
                                    {new Date(account.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Status Column */}
                              <TableCell className="py-4 px-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  account.is_active 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    account.is_active ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  {account.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </TableCell>

                              {/* Actions Column */}
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center justify-center space-x-2">
                                  {editingId === account.id ? (
                                    <>
                                      <Button
                                        onClick={() => handleUpdateAccount(account.id)}
                                        disabled={isUpdating}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                                      >
                                        {isUpdating ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        ) : (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        onClick={handleCancelEdit}
                                        variant="outline"
                                        size="sm"
                                        className="border-red-300 text-red-600 hover:bg-red-50 h-8 px-3"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      onClick={() => handleEdit(account)}
                                      variant="outline"
                                      size="sm"
                                      className="border-blue-300 text-blue-600 hover:bg-blue-50 h-8 px-3"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="mb-4">
                        <Landmark className="h-16 w-16 text-slate-300 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">No Bank Accounts Created</h3>
                      <p className="text-slate-500 mb-6">Get started by creating your first bank account from the admin dashboard.</p>
                      <Button
                        onClick={() => navigate("/admin/create-bank-account")}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                      >
                        <Landmark className="h-4 w-4 mr-2" />
                        Create Bank Account
                      </Button>
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

export default CreateBankAccountList;