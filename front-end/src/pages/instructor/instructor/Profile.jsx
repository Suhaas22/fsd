import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Avatar } from "../../../components/instructor/ui/Avatar";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Camera, Building2, CheckCircle2, LogOut, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../../utils/api";

export function Profile() {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [orgStatusMessage, setOrgStatusMessage] = useState("");
  const [isAffiliated, setIsAffiliated] = useState(true);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    title: "Lead Instructor, Computer Science",
    email: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
    orgName: "",
    orgDepartment: "",
    orgRole: "",
    orgWorkEmail: "",
    orgWebsite: "",
    orgJoined: "",
    skills: "",
    education: "",
    experience: "Teaching and software engineering leader.",
  });

  useEffect(() => {
    api.get("/instructors/1", "instructor")
      .then((data) => {
        if (data) {
          setFormData({
            fullName: data.name || "Dr. Sarah Jenkins",
            title: "Lead Instructor, Computer Science",
            email: data.email || "sarah.jenkins@university.edu",
            phone: data.phone || "+1 (555) 123-4567",
            location: data.location || "San Francisco, CA",
            website: data.website || "https://sarahjenkins.dev",
            bio: data.bio || "Dr. Sarah Jenkins has over 15 years of experience in software engineering and education.",
            orgName: data.organization || "University of Tech",
            orgDepartment: data.orgDepartment || "Department of Computer Science & Engineering",
            orgRole: data.orgRole || "Admin & Lead Faculty",
            orgWorkEmail: data.orgWorkEmail || "s.jenkins@univ.edu",
            orgWebsite: data.orgWebsite || "https://univ.edu",
            orgJoined: data.orgJoined || "Jan 12, 2023",
            skills: data.expertise || "React, Node.js, Python, System Architecture",
            education: data.qualification || "Ph.D. Computer Science, Stanford University",
            experience: "Former Staff Engineer. Currently teaching full-time.",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching instructor profile:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    api.patch("/instructors/1", {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      website: formData.website,
      bio: formData.bio,
      organization: formData.orgName,
      expertise: formData.skills,
      qualification: formData.education,
    }, "instructor")
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      })
      .catch((err) => console.error("Error updating profile:", err));
  };

  const handleLeaveOrganization = () => {
    setIsAffiliated(false);
    setFormData((prev) => ({
      ...prev,
      orgName: "",
      orgDepartment: "",
      orgRole: "Independent Instructor",
      orgWorkEmail: "",
      orgWebsite: "",
      orgJoined: "",
    }));
    setShowLeaveModal(false);
    setOrgStatusMessage("You have successfully left the organization.");
    setTimeout(() => setOrgStatusMessage(""), 5000);
  };

  const handleRejoinOrg = () => {
    setIsAffiliated(true);
    setFormData((prev) => ({
      ...prev,
      orgName: "University of Tech",
      orgDepartment: "Department of Computer Science & Engineering",
      orgRole: "Admin & Lead Faculty",
      orgWorkEmail: "s.jenkins@univ.edu",
      orgWebsite: "https://univ.edu",
      orgJoined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    setOrgStatusMessage("Re-affiliated with organization.");
    setTimeout(() => setOrgStatusMessage(""), 4000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Instructor Profile</h1>
          <p className="text-navy-500">Manage your public instructor profile, personal details, and organization information.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Saved successfully!
            </div>
          )}
          {orgStatusMessage && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-navy-700 bg-navy-50 px-3 py-2 rounded-lg border border-navy-200 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-primary-600" />
              {orgStatusMessage}
            </div>
          )}
          <Button type="submit">Save Changes</Button>
        </div>
      </div>

      {/* Header Profile Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" size="xl" className="h-24 w-24" />
              <button type="button" className="absolute inset-0 bg-navy-900/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
                  <Input 
                    value={formData.fullName} 
                    onChange={(e) => handleChange("fullName", e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Professional Title</label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => handleChange("title", e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details Card */}
      <Card className="border-primary-100 shadow-sm">
        <CardHeader className="border-b border-navy-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 border border-primary-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Organization Details</CardTitle>
                <CardDescription>Your affiliated university or institutional organization account.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isAffiliated ? "success" : "secondary"}>
                {isAffiliated ? "Active Affiliation" : "Independent"}
              </Badge>
              {isAffiliated ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLeaveModal(true)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Leave Organization
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleRejoinOrg}
                >
                  <Building2 className="w-4 h-4 mr-1.5" />
                  Join Organization
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-6">
          {isAffiliated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Organization Name</label>
                <Input 
                  value={formData.orgName} 
                  onChange={(e) => handleChange("orgName", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Department / Faculty</label>
                <Input 
                  value={formData.orgDepartment} 
                  onChange={(e) => handleChange("orgDepartment", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Role in Organization</label>
                <Input 
                  value={formData.orgRole} 
                  onChange={(e) => handleChange("orgRole", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Institutional Email</label>
                <Input 
                  type="email" 
                  value={formData.orgWorkEmail} 
                  onChange={(e) => handleChange("orgWorkEmail", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Organization Website</label>
                <Input 
                  type="url" 
                  value={formData.orgWebsite} 
                  onChange={(e) => handleChange("orgWebsite", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Joined Date</label>
                <Input 
                  value={formData.orgJoined} 
                  readOnly 
                  className="bg-navy-50 text-navy-500 cursor-not-allowed"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-navy-200 rounded-xl bg-navy-50/50">
              <Building2 className="w-8 h-8 text-navy-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-navy-800">You are currently an Independent Instructor</p>
              <p className="text-xs text-navy-500 mt-1">You are not affiliated with any university or institutional organization account.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Organization Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-navy-100 w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-navy-900">Leave Organization?</h3>
                <p className="text-sm text-navy-500 mt-1">
                  Are you sure you want to leave <span className="font-semibold text-navy-800">{formData.orgName}</span>? You will lose access to institutional resources and faculty privileges.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowLeaveModal(false)}
                className="text-navy-400 hover:text-navy-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleLeaveOrganization}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm & Leave
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => handleChange("email", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Phone</label>
              <Input 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => handleChange("phone", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Location</label>
              <Input 
                value={formData.location} 
                onChange={(e) => handleChange("location", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Personal Website</label>
              <Input 
                type="url" 
                value={formData.website} 
                onChange={(e) => handleChange("website", e.target.value)} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Bio</label>
            <textarea 
              className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent min-h-[100px]"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Expertise / Skills</label>
            <Input 
              value={formData.skills} 
              onChange={(e) => handleChange("skills", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Education</label>
            <Input 
              value={formData.education} 
              onChange={(e) => handleChange("education", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Experience</label>
            <textarea 
              className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent min-h-[80px]"
              value={formData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-navy-100 pt-6">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
