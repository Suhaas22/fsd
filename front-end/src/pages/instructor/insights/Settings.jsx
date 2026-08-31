import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { User, Shield, Bell, Settings as SettingsIcon, EyeOff, Smartphone, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onChange && onChange(e.target.checked)}
    />
    <div className="w-11 h-6 bg-navy-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
  </label>
);

export function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    email: "sarah.jenkins@university.edu",
    phone: "+1 (555) 123-4567",
    courseActivityNotifs: true,
    studentActivityNotifs: true,
    marketingUpdates: false,
    language: "English (US)",
    timeZone: "Pacific Time (PT)",
    profileVisibility: true,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.get("/instructors/1", "instructor")
      .then((data) => {
        if (data) {
          setSettings(prev => ({
            ...prev,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
          }));
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  const handleSave = () => {
    api.patch("/instructors/1", {
      email: settings.email,
      phone: settings.phone,
    }, "instructor")
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch((err) => console.error("Error updating settings:", err));
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: EyeOff },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto pb-12">
      <div className="w-full md:w-64 shrink-0 space-y-1">
        <div className="font-bold text-navy-900 px-3 mb-4 text-xl">Settings</div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              activeTab === tab.id 
                ? "bg-primary-50 text-primary-700" 
                : "text-navy-700 hover:bg-navy-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> Settings updated successfully!
          </div>
        )}

        {activeTab === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account email and phone number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Email Address</label>
                <div className="flex gap-3">
                  <Input 
                    value={settings.email} 
                    onChange={e => setSettings({ ...settings, email: e.target.value })} 
                    className="max-w-md" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Phone Number</label>
                <div className="flex gap-3">
                  <Input 
                    type="tel" 
                    value={settings.phone} 
                    onChange={e => setSettings({ ...settings, phone: e.target.value })} 
                    className="max-w-md" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-navy-100 mt-6 pt-6">
              <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Current Password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">New Password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Confirm New Password</label>
                  <Input type="password" />
                </div>
                <Button onClick={handleSave} className="mt-2">Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-navy-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-600">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-navy-900">Authenticator App</h4>
                      <p className="text-sm text-navy-500">Not configured</p>
                    </div>
                  </div>
                  <Button variant="outline">Set Up</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control when and how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 border-b border-navy-100 pb-2">Email Notifications</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-navy-900 text-sm">Course Activity</h5>
                    <p className="text-xs text-navy-500">When someone reviews your course or a course is approved.</p>
                  </div>
                  <Toggle 
                    checked={settings.courseActivityNotifs} 
                    onChange={v => setSettings({ ...settings, courseActivityNotifs: v })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-navy-900 text-sm">Student Activity</h5>
                    <p className="text-xs text-navy-500">When a student enrolls or completes a course.</p>
                  </div>
                  <Toggle 
                    checked={settings.studentActivityNotifs} 
                    onChange={v => setSettings({ ...settings, studentActivityNotifs: v })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-navy-900 text-sm">Marketing & Updates</h5>
                    <p className="text-xs text-navy-500">Receive platform updates and instructor tips.</p>
                  </div>
                  <Toggle 
                    checked={settings.marketingUpdates} 
                    onChange={v => setSettings({ ...settings, marketingUpdates: v })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Language</label>
                <select 
                  value={settings.language}
                  onChange={e => setSettings({ ...settings, language: e.target.value })}
                  className="w-full h-10 rounded-md border border-navy-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                >
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Time Zone</label>
                <select 
                  value={settings.timeZone}
                  onChange={e => setSettings({ ...settings, timeZone: e.target.value })}
                  className="w-full h-10 rounded-md border border-navy-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                >
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>Greenwich Mean Time (GMT)</option>
                </select>
              </div>
              <Button onClick={handleSave}>Save Preferences</Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'privacy' && (
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-navy-900 text-sm">Public Profile Visibility</h5>
                  <p className="text-xs text-navy-500">Allow students to see your instructor profile.</p>
                </div>
                <Toggle 
                  checked={settings.profileVisibility} 
                  onChange={v => setSettings({ ...settings, profileVisibility: v })} 
                />
              </div>
              <div className="pt-6 border-t border-navy-100">
                <h5 className="font-medium text-red-600 mb-2">Danger Zone</h5>
                <p className="text-sm text-navy-500 mb-4">Deleting your account is permanent and cannot be undone.</p>
                <Button variant="danger">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
