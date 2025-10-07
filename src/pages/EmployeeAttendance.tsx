import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Clock, CheckCircle, X, History, UserCheck, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { showToast } from "@/lib/toast";
import { PastAttendance } from "@/components/PastAttendance";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceRecord {
  type: 'check-in' | 'check-out';
  timestamp: Date;
  photo: string;
  location?: string;
  date: string;
}

// Simulate getting today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export default function EmployeeAttendance() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'check-in' | 'check-out'>('check-in');
  const [location, setLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // Check if user has already checked in today
  const checkTodayAttendance = useCallback(async () => {
    const today = getTodayDateString();
    const username = localStorage.getItem('employeeUsername');
    
    if (!username) return;

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_username', username)
      .eq('date', today)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking attendance:', error);
      return;
    }

    if (!data || data.length === 0) {
      setAttendanceType('check-in');
    } else {
      const lastRecord = data[0];
      if (lastRecord.type === 'check-in') {
        setAttendanceType('check-out');
      } else {
        setAttendanceType('check-in');
      }
    }
  }, []);

  useEffect(() => {
    checkTodayAttendance();
  }, [checkTodayAttendance]);

  const getLocation = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      showToast.error("Camera access denied. Please allow camera permissions.");
      setIsCapturing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(photoData);
        
        // Stop camera after capture
        stopCamera();
        
        // Try to get location
        setIsGettingLocation(true);
        try {
          const currentLocation = await getLocation();
          setLocation(currentLocation);
          showToast.success("Photo & Location captured successfully!");
        } catch (error) {
          console.error('Error getting location:', error);
          showToast.success("Photo captured successfully!");
        } finally {
          setIsGettingLocation(false);
        }
      }
    }
  }, [getLocation, stopCamera]);

  const handleSubmit = useCallback(async () => {
    if (!capturedImage) {
      showToast.error("Please capture a photo before submitting attendance.");
      return;
    }

    const username = localStorage.getItem('employeeUsername');
    const employeeId = localStorage.getItem('employeeId');

    if (!username) {
      showToast.error("Employee session not found. Please login again.");
      return;
    }

    try {
      showToast.success("Uploading photo to Cloudinary...");

      // Upload image to Cloudinary via edge function
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
        'upload-to-cloudinary',
        {
          body: {
            image: capturedImage,
            folder: 'employee-attendance',
          },
        }
      );

      if (uploadError || !uploadData?.success) {
        throw new Error(uploadData?.error || 'Failed to upload image to Cloudinary');
      }

      const cloudinaryUrl = uploadData.url;

      // Store attendance record with Cloudinary URL
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employeeId || username,
          employee_username: username,
          type: attendanceType,
          timestamp: new Date().toISOString(),
          photo: cloudinaryUrl,
          location: location || 'Location unavailable',
          date: getTodayDateString(),
        });

      if (error) throw error;

      showToast.success(`${attendanceType === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully!`);
      
      // Reset form
      setCapturedImage(null);
      setLocation('');
      stopCamera();
      
      // Update attendance type for next action
      await checkTodayAttendance();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      showToast.error("Failed to record attendance. Please try again.");
    }
  }, [capturedImage, attendanceType, location, stopCamera, checkTodayAttendance]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setLocation('');
    startCamera();
  }, [startCamera]);

  const mockAttendanceData = [
    {
      date: '2024-01-15',
      checkIn: '09:00 AM',
      checkOut: '05:30 PM',
      hoursWorked: '8h 30m',
      status: 'Present' as const,
      location: 'Main Office - Delhi',
      tasks: ['Case review: Bank vs. ABC Corp', 'Client consultation', 'Document preparation']
    },
    {
      date: '2024-01-14',
      checkIn: '08:45 AM',
      checkOut: '06:00 PM',
      hoursWorked: '9h 15m',
      status: 'Present' as const,
      location: 'Main Office - Delhi',
      tasks: ['Court hearing preparation', 'Legal research', 'Team meeting']
    },
    {
      date: '2024-01-13',
      checkIn: '09:15 AM',
      checkOut: '05:45 PM',
      hoursWorked: '8h 30m',
      status: 'Present' as const,
      location: 'Main Office - Delhi',
      tasks: ['Client documentation', 'Contract review', 'Administrative tasks']
    }
  ];

  const todayAttendanceStatus = () => {
    const today = getTodayDateString();
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    if (todayRecords.length === 0) {
      return { status: 'Not Started', color: 'bg-slate-100 text-slate-600' };
    }
    
    const lastRecord = todayRecords[todayRecords.length - 1];
    if (lastRecord.type === 'check-in') {
      return { status: 'Checked In', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Checked Out', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const todayStatus = todayAttendanceStatus();

  return (
    <div className="min-h-screen bg-gradient-employee-light p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/employee-dashboard')}
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-elegant border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-employee-rich rounded-full flex items-center justify-center shadow-lg">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Employee Attendance</CardTitle>
            <CardDescription className="text-slate-600">
              Capture your attendance with photo verification and location tracking
            </CardDescription>
            
            {/* Today's Status */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Today's Status:</span>
              <Badge className={todayStatus.color}>
                {todayStatus.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="capture" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="capture" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Capture Attendance
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Attendance History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="capture" className="space-y-6">
                {/* Attendance Type Selection */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    variant={attendanceType === 'check-in' ? 'default' : 'outline'}
                    onClick={() => setAttendanceType('check-in')}
                    className="flex items-center gap-2 bg-employee-legal hover:bg-employee-legal-hover"
                    disabled={attendanceType !== 'check-in'}
                  >
                    <Clock className="h-4 w-4" />
                    Check In
                  </Button>
                  <Button
                    variant={attendanceType === 'check-out' ? 'default' : 'outline'}
                    onClick={() => setAttendanceType('check-out')}
                    className="flex items-center gap-2 bg-employee-legal hover:bg-employee-legal-hover"
                    disabled={attendanceType !== 'check-out'}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Check Out
                  </Button>
                </div>

                {/* Camera Section */}
                <Card className="border-2 border-dashed border-slate-200">
                  <CardContent className="p-6">
                    {!capturedImage ? (
                      <div className="space-y-4">
                        {!isCapturing ? (
                          <div className="text-center">
                            <Camera className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-600 mb-4">
                              Start your camera to capture attendance photo
                            </p>
                            <Button onClick={startCamera} className="bg-employee-legal hover:bg-employee-legal-hover">
                              <Camera className="h-4 w-4 mr-2" />
                              Start Camera
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="relative bg-black rounded-lg overflow-hidden">
                              <video
                                ref={videoRef}
                                className="w-full h-80 object-cover"
                                autoPlay
                                muted
                                playsInline
                              />
                              <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="flex gap-4 justify-center">
                              <Button 
                                onClick={capturePhoto} 
                                disabled={isGettingLocation}
                                className="bg-employee-legal hover:bg-employee-legal-hover"
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                {isGettingLocation ? 'Capturing...' : 'Capture Photo'}
                              </Button>
                              <Button variant="outline" onClick={stopCamera}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <img 
                            src={capturedImage} 
                            alt="Captured attendance" 
                            className="w-full h-80 object-cover rounded-lg"
                          />
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 right-2 bg-green-100 text-green-800"
                          >
                            Photo Captured
                          </Badge>
                        </div>
                        
                        {location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                            <MapPin className="h-4 w-4" />
                            <span>Location: {location}</span>
                          </div>
                        )}
                        
                        <div className="flex gap-4 justify-center">
                          <Button onClick={handleSubmit} className="bg-employee-legal hover:bg-employee-legal-hover">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit {attendanceType === 'check-in' ? 'Check In' : 'Check Out'}
                          </Button>
                          <Button variant="outline" onClick={retakePhoto}>
                            Retake Photo
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <PastAttendance />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}