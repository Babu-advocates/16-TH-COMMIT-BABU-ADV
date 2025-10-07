import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArrowLeft, UserPlus, Save, Users, Eye, EyeOff, Calendar, Shield, Sparkles, Edit, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CreateEmployeeAccount = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeAccounts, setEmployeeAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch employee accounts on component mount and after successful creation
  const fetchEmployeeAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const { data, error } = await supabase
        .from('employee_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employee accounts:', error);
        showToast.error("Failed to load employee accounts");
      } else {
        setEmployeeAccounts(data || []);
      }
    } catch (error) {
      console.error('Error fetching employee accounts:', error);
      showToast.error("Failed to load employee accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchEmployeeAccounts();
    
    // Set up real-time subscription for employee_accounts
    const channel = supabase
      .channel('employee-accounts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employee_accounts' }, 
        () => {
          fetchEmployeeAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showToast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('employee_accounts')
        .insert({
          username: username.trim(),
          password: password, // In production, this should be hashed
          // created_by will be set properly when admin authentication is implemented
        });

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          showToast.error("Username already exists. Please choose a different username.");
        } else {
          showToast.error(`Failed to create employee account: ${error.message}`);
        }
        return;
      }

      showToast.success("Employee account created successfully!");
      setUsername("");
      setPassword("");
      
      // Refresh the employee accounts list
      fetchEmployeeAccounts();
      
      // Add a small delay before navigation to ensure the toast is visible
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1500);
    } catch (error) {
      console.error('Error creating employee account:', error);
      showToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (account: any) => {
    setEditingId(account.id);
    setEditUsername(account.username);
    setEditPassword(account.password);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditUsername("");
    setEditPassword("");
  };

  const handleUpdateAccount = async (accountId: string) => {
    if (!editUsername.trim() || !editPassword.trim()) {
      showToast.error("Please fill in all fields");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('employee_accounts')
        .update({
          username: editUsername.trim(),
          password: editPassword,
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

      showToast.success("Account updated successfully!");
      handleCancelEdit();
      fetchEmployeeAccounts();
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
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Create Employee Account
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage advocate login credentials</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Form Card with Enhanced Design */}
              <Card className="bg-gradient-to-br from-white/90 via-blue-50/20 to-purple-50/20 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
                <CardHeader className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-200/30">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                        Employee Login for Advocates
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">Create secure login credentials for advocate employees</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-slate-700 font-semibold flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>Username</span>
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter unique username"
                          className="h-12 bg-white/80 border-2 border-blue-200/50 hover:border-blue-400 focus:border-blue-500 transition-all duration-300 rounded-xl shadow-sm"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-slate-700 font-semibold flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span>Password</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter secure password"
                            className="h-12 bg-white/80 border-2 border-purple-200/50 hover:border-purple-400 focus:border-purple-500 transition-all duration-300 rounded-xl shadow-sm pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold py-4 h-14 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 rounded-xl text-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-3" />
                          Create Employee Account
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>

          {/* Enhanced Employee Accounts Table Section */}
          <div className="px-8 pb-8">
            <div className="max-w-6xl mx-auto">
              <Card className="bg-gradient-to-br from-white/90 via-slate-50/20 to-blue-50/20 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-blue-600/5"></div>
                <CardHeader className="relative bg-gradient-to-r from-slate-600/10 to-blue-600/10 border-b border-slate-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl shadow-lg">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                          Created Employee Accounts
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">View and manage all advocate login credentials</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-blue-50/50 px-4 py-2 rounded-xl">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {employeeAccounts.length} Account{employeeAccounts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8">
                  {isLoadingAccounts ? (
                    <div className="flex justify-center items-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <span className="ml-4 text-slate-600 font-medium">Loading employee accounts...</span>
                    </div>
                  ) : employeeAccounts.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/50">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200/50">
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
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
                          {employeeAccounts.map((account, index) => (
                            <TableRow key={account.id} className={`border-slate-100/50 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                            }`}>
                              {/* Username Column */}
                              <TableCell className="font-bold text-slate-800 py-4 px-6">
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
                                  <div className="bg-slate-100/50 rounded-lg px-3 py-1 inline-block">
                                    {account.password}
                                  </div>
                                )}
                              </TableCell>

                              {/* Date Created Column */}
                              <TableCell className="text-slate-600 py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span>
                                    {new Date(account.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Status Column */}
                              <TableCell className="py-4 px-6">
                                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                                  account.is_active 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                }`}>
                                  {account.is_active ? '✓ Active' : '✗ Inactive'}
                                </span>
                              </TableCell>

                              {/* Actions Column */}
                              <TableCell className="py-4 px-6 text-center">
                                {editingId === account.id ? (
                                  <div className="flex items-center justify-center space-x-2">
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
                                      disabled={isUpdating}
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-3"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => handleEdit(account)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 hover:bg-blue-50"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                        <UserPlus className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 mb-3">No Employee Accounts Yet</h3>
                      <p className="text-slate-500 mb-2">Create your first employee account using the form above.</p>
                      <p className="text-sm text-slate-400">All created accounts will appear here with their details.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CreateEmployeeAccount;