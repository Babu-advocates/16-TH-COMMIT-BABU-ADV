import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface EmployeeFormData {
  name: string;
  father_husband_name: string;
  phone_no: string;
  alternate_phone_no?: string;
  mail_id: string;
  gender: string;
  dob: string;
  qualification: string;
  address: string;
  account_no: string;
  ifsc_code: string;
  branch: string;
  bank: string;
  date_of_joining: string;
  photo?: string;
  reference?: string;
  details?: string;
}

interface EmployeeDetailsFormProps {
  onSubmit: (employee: EmployeeFormData) => void;
  onCancel: () => void;
}

const EmployeeDetailsForm = ({ onSubmit, onCancel }: EmployeeDetailsFormProps) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    father_husband_name: '',
    phone_no: '',
    alternate_phone_no: '',
    mail_id: '',
    gender: '',
    dob: '',
    qualification: '',
    address: '',
    account_no: '',
    ifsc_code: '',
    branch: '',
    bank: '',
    date_of_joining: '',
    photo: '',
    reference: '',
    details: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.father_husband_name || !formData.phone_no || !formData.mail_id || 
        !formData.gender || !formData.dob || !formData.qualification || !formData.address ||
        !formData.account_no || !formData.ifsc_code || !formData.branch || !formData.bank || 
        !formData.date_of_joining) {
      alert("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.mail_id)) {
      alert("Please enter a valid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone_no)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="father_husband_name">Father / Husband Name *</Label>
              <Input
                id="father_husband_name"
                value={formData.father_husband_name}
                onChange={(e) => handleInputChange('father_husband_name', e.target.value)}
                placeholder="Enter father/husband name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification *</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                placeholder="Enter qualification"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="phone_no">Phone Number *</Label>
              <Input
                id="phone_no"
                value={formData.phone_no}
                onChange={(e) => handleInputChange('phone_no', e.target.value)}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate_phone_no">Alternate Phone Number</Label>
              <Input
                id="alternate_phone_no"
                value={formData.alternate_phone_no}
                onChange={(e) => handleInputChange('alternate_phone_no', e.target.value)}
                placeholder="Enter alternate phone number"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mail_id">Email ID *</Label>
              <Input
                id="mail_id"
                type="email"
                value={formData.mail_id}
                onChange={(e) => handleInputChange('mail_id', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">Bank Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="account_no">Account Number *</Label>
              <Input
                id="account_no"
                value={formData.account_no}
                onChange={(e) => handleInputChange('account_no', e.target.value)}
                placeholder="Enter bank account number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc_code">IFSC Code *</Label>
              <Input
                id="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => handleInputChange('ifsc_code', e.target.value.toUpperCase())}
                placeholder="Enter IFSC code"
                maxLength={11}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => handleInputChange('branch', e.target.value)}
                placeholder="Enter branch name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Bank *</Label>
              <Input
                id="bank"
                value={formData.bank}
                onChange={(e) => handleInputChange('bank', e.target.value)}
                placeholder="Enter bank name"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">Employment Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="date_of_joining">Date of Joining *</Label>
              <Input
                id="date_of_joining"
                type="date"
                value={formData.date_of_joining}
                onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                placeholder="Enter photo URL (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Enter reference details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                placeholder="Enter any additional details"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Add Employee
        </Button>
      </div>
    </form>
  );
};

export default EmployeeDetailsForm;
