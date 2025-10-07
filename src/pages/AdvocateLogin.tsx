import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Shield, Users, ArrowLeft, Mail, Lock, Eye, EyeOff, Copy, Check, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import advocateImage from "@/assets/advocate1.png";
import { supabase } from "@/integrations/supabase/client";
import { useImagePreloader } from "@/hooks/useImagePreloader";
type LoginType = 'admin' | 'employee' | 'litigation' | null;
const AdvocateLogin = () => {
  const [selectedLogin, setSelectedLogin] = useState<LoginType>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const navigate = useNavigate();

  // Preload images - use useMemo to prevent infinite re-renders
  const imageArray = useMemo(() => [advocateImage], []);
  const {
    imagesLoaded,
    cachedImages
  } = useImagePreloader(imageArray);
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    if (imagesLoaded) {
      setShowContent(true);
    }
  }, [imagesLoaded]);
  const demoCredentials = {
    admin: {
      email: "admin@babuadvocates.com",
      password: "admin123"
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLogin === 'admin') {
      if (email === demoCredentials.admin.email && password === demoCredentials.admin.password) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        toast.success('Welcome to your admin dashboard!');
        navigate('/admin-dashboard');
      } else {
        toast.error('Invalid admin credentials. Please use the demo credentials.');
      }
    } else if (selectedLogin === 'employee') {
      try {
        const {
          data,
          error
        } = await supabase.from('employee_accounts').select('*').eq('username', username).eq('password', password).eq('is_active', true).single();
        if (error || !data) {
          toast.error('Invalid credentials. Please check your username and password.');
          return;
        }

        // Store employee info for session management
        localStorage.setItem('employeeLogin', 'true');
        localStorage.setItem('employeeUsername', data.username);
        localStorage.setItem('employeeId', data.id);
        toast.success('Welcome to your employee dashboard!');
        navigate('/employee-dashboard');
      } catch (error) {
        toast.error('An error occurred during login. Please try again.');
      }
    } else if (selectedLogin === 'litigation') {
      try {
        const {
          data,
          error
        } = await supabase.from('litigation_accounts').select('*').eq('username', username).eq('password', password).eq('is_active', true).single();
        if (error || !data) {
          toast.error('Invalid credentials. Please check your username and password.');
          return;
        }

        // Store litigation info for session management
        localStorage.setItem('litigationLogin', 'true');
        localStorage.setItem('litigationUsername', data.username);
        localStorage.setItem('litigationId', data.id);
        toast.success('Welcome to your litigation dashboard!');
        navigate('/litigation-dashboard');
      } catch (error) {
        toast.error('An error occurred during login. Please try again.');
      }
    }
  };
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };
  const resetForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setCopiedField(null);
  };
  const handleBackToSelection = () => {
    setSelectedLogin(null);
    resetForm();
  };
  const handleLoginSelection = (type: LoginType) => {
    setSelectedLogin(type);
    resetForm();
  };
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Back to Home - Top Left */}
      <Link to="/" className="absolute top-6 left-6 z-10">
        <Button variant="outline" className="bg-white text-black border border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>
      
      {/* Main Container */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Illustration Area */}
          <div className="relative flex items-center justify-center p-4 lg:p-8">
            {/* Background decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float-slow"></div>
              <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-purple-200/30 rounded-full blur-lg animate-float-reverse"></div>
              <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-indigo-200/30 rounded-full blur-md animate-pulse-slow"></div>
            </div>
            
            {/* Main illustration container - Bigger on mobile */}
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-lg">
              <img src={cachedImages[advocateImage] || advocateImage} alt="Legal Advocate Illustration" className={`w-full h-auto object-contain drop-shadow-2xl transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`} loading="eager" decoding="sync" />
            </div>
          </div>
          
          {/* Right Side - Login Selection or Form */}
          <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-md">
              <Card className={`bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden transition-opacity duration-300 ${showContent ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}>
                
                {/* Login Selection View */}
                {!selectedLogin && <>
                    <CardHeader className="text-center pb-6 pt-8 px-8">
                      <CardTitle className="text-3xl font-bold text-slate-800 mb-2">Login Portal</CardTitle>
                      <p className="text-slate-500 text-sm">Choose your login type to continue</p>
                    </CardHeader>
                    <CardContent className="space-y-4 px-8 pb-8">
                      <Button onClick={() => handleLoginSelection('admin')} className="w-full h-14 bg-admin-red hover:bg-admin-red-hover text-admin-red-foreground font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-red-200 animate-scale-in">
                        <Shield className="h-6 w-6" />
                        <span className="text-lg">Admin Login</span>
                      </Button>
                      
                      <Button onClick={() => handleLoginSelection('employee')} className="w-full h-14 bg-employee-legal hover:bg-employee-legal-hover text-employee-legal-foreground font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-300 animate-scale-in" style={{
                    animationDelay: '0.1s'
                  }}>
                        <Users className="h-6 w-6" />
                        <span className="text-lg">Employee Login</span>
                      </Button>
                      
                      <Button onClick={() => handleLoginSelection('litigation')} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-green-300 animate-scale-in" style={{
                    animationDelay: '0.2s'
                  }}>
                        <Users className="h-6 w-6" />
                        <span className="text-lg">Litigation Login</span>
                      </Button>
                    </CardContent>
                  </>}

                {/* Login Form View */}
                {selectedLogin && <>
                    {/* Header with back button */}
                    <div className={`px-6 py-4 text-center text-white font-medium relative ${selectedLogin === 'admin' ? 'bg-admin-red' : selectedLogin === 'litigation' ? 'bg-green-600' : 'bg-employee-legal'}`}>
                      <button onClick={handleBackToSelection} className={`absolute left-4 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded text-sm font-medium transition-all duration-300 flex items-center gap-1 border-2 border-white ${selectedLogin === 'admin' ? 'bg-admin-red text-white hover:bg-admin-red-hover' : selectedLogin === 'litigation' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-employee-legal text-white hover:bg-employee-legal-hover'}`}>
                        <ArrowLeft className="h-3 w-3" />
                        Back
                      </button>
                      {selectedLogin === 'admin' ? 'Admin Login' : selectedLogin === 'litigation' ? 'Litigation Login' : 'Employee Login'}
                    </div>

                    <CardContent className="p-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h3 className={`text-xl font-bold mb-1 ${selectedLogin === 'admin' ? 'text-admin-red' : selectedLogin === 'litigation' ? 'text-green-600' : 'text-employee-legal'}`}>
                          Welcome Back
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Sign in to your Legal account as {selectedLogin === 'admin' ? 'Admin' : selectedLogin === 'litigation' ? 'Litigation' : 'Employee'}
                        </p>
                        
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <FloatingInput 
                            id={selectedLogin === 'admin' ? "email" : "username"} 
                            label={selectedLogin === 'admin' ? 'Email Address' : 'Username'}
                            type={selectedLogin === 'admin' ? "email" : "text"} 
                            value={selectedLogin === 'admin' ? email : username} 
                            onChange={e => selectedLogin === 'admin' ? setEmail(e.target.value) : setUsername(e.target.value)} 
                            required 
                          />
                        </div>
                        
                        <div className="relative">
                          <FloatingInput 
                            id="password" 
                            label="Password"
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>

                        <Button type="submit" className={`w-full h-10 text-sm font-medium rounded-lg mt-6 transition-all duration-300 transform hover:scale-[1.02] ${selectedLogin === 'admin' ? 'bg-admin-red hover:bg-admin-red-hover text-admin-red-foreground' : selectedLogin === 'litigation' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-employee-legal hover:bg-employee-legal-hover text-employee-legal-foreground'}`}>
                          Sign In as {selectedLogin === 'admin' ? 'Admin' : selectedLogin === 'litigation' ? 'Litigation' : 'Employee'}
                        </Button>
                      </form>

                      {/* Demo Credentials */}
                      
                    </CardContent>
                  </>}
                
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default AdvocateLogin;