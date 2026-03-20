import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import client from '@/api/client';
import {
  MapPin,
  Loader2,
  Navigation,
  Save,
  Settings,
  Bell,
  Globe,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import '@/styles/Settings.css';

interface Office {
  _id?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  grace_period_mins: number;
  name?: string;
}

function NotificationSettingsPanel() {
  const [settings, setSettings] = useState({
    lateAlerts: true,
    earlyExitAlerts: true,
    dailySummary: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await client.get('/admin/settings/notifications');
        if (data) setSettings({ ...settings, ...data });
      } catch (error) {
        console.error("Failed to load notification settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await client.post('/admin/settings/notifications', newSettings);
      toast.success("Preference saved");
    } catch (error) {
      toast.error("Failed to save preference");
      setSettings(settings);
    }
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;

  return (
    <div className="notification-panel">
      <div className="notification-row">
        <div className="notification-label-group">
          <Label className="text-base">Late Arrival Alerts</Label>
          <p className="text-sm text-muted-foreground">Notify admin when an employee is late</p>
        </div>
        <Switch
          checked={settings.lateAlerts}
          onCheckedChange={(checked) => updateSetting('lateAlerts', checked)}
        />
      </div>
      <Separator />
      <div className="notification-row">
        <div className="notification-label-group">
          <Label className="text-base">Early Exit Alerts</Label>
          <p className="text-sm text-muted-foreground">Notify admin when an employee leaves early</p>
        </div>
        <Switch
          checked={settings.earlyExitAlerts}
          onCheckedChange={(checked) => updateSetting('earlyExitAlerts', checked)}
        />
      </div>
      <Separator />
      <div className="notification-row">
        <div className="notification-label-group">
          <Label className="text-base">Daily Summary</Label>
          <p className="text-sm text-muted-foreground">Receive a daily attendance report via email</p>
        </div>
        <Switch
          checked={settings.dailySummary}
          onCheckedChange={(checked) => updateSetting('dailySummary', checked)}
        />
      </div>
    </div>
  );
}

function ProfileSettingsPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await client.put('/auth/profile', formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" value={formData.full_name} onChange={handleChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={formData.email} onChange={handleChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input id="phone_number" value={formData.phone_number} onChange={handleChange} />
      </div>
      <Button onClick={handleSave} disabled={loading} className="mt-4">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Profile
      </Button>
    </div>
  );
}

function HolidaySettingsPanel() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchHolidays = async () => {
    try {
      const { data } = await client.get('/admin/holidays');
      setHolidays(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async () => {
    if (!date || !name) {
      return toast.error("Please fill out both name and date.");
    }
    setAdding(true);
    try {
      await client.post('/admin/holidays', { date, name });
      toast.success("Holiday added successfully!");
      fetchHolidays();
      setDate('');
      setName('');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add holiday.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm("Remove this holiday?")) return;
    try {
      await client.delete(`/admin/holidays/${id}`);
      toast.success("Holiday removed.");
      fetchHolidays();
    } catch (error) {
      toast.error("Failed to remove holiday.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-muted/50 p-4 rounded-xl space-y-4">
        <h4 className="font-semibold text-sm">Add New Holiday</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Holiday Name</Label>
            <Input placeholder="e.g. Christmas Day" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleAddHoliday} disabled={adding} className="w-full md:w-auto">
          {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Add Holiday
        </Button>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-4">Upcoming Holidays</h4>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        ) : holidays.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No holidays saved.</p>
        ) : (
          <div className="space-y-2">
            {holidays.map(h => (
              <div key={h._id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground">
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteHoliday(h._id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [office, setOffice] = useState<Office>({
    latitude: 0,
    longitude: 0,
    radius_meters: 100,
    grace_period_mins: 15,
    name: 'Main Office',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const { data } = await client.get('/office');
        if (data) {
          setOffice(data);
        }
      } catch (error) {
        console.error("Error fetching office settings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOffice();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const officeData = {
      latitude: office.latitude,
      longitude: office.longitude,
      radius_meters: office.radius_meters,
      grace_period_mins: office.grace_period_mins,
      name: office.name || 'Main Office',
    };

    try {
      const { data } = await client.post('/office', officeData);
      setOffice(data);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOffice({
          ...office,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGettingLocation(false);
        toast.success('Location updated! Click Save to apply.');
      },
      (error) => {
        setGettingLocation(false);
        toast.error('Failed to get location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20 min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-container">
        <div className="settings-header">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings</h1>
            <p className="text-muted-foreground mt-1 text-lg">Configure your workspace and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="settings-tabs-list">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="settings-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  General Configuration
                </CardTitle>
                <CardDescription>Basic settings for your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="settings-grid">
                  <div className="grid gap-2">
                    <Label htmlFor="office-name">Office Name</Label>
                    <Input
                      id="office-name"
                      value={office.name}
                      onChange={(e) => setOffice({ ...office, name: e.target.value })}
                      placeholder="e.g. Main HQ"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="grace-period">Grace Period (minutes)</Label>
                    <div className="flex gap-4">
                      <Input
                        id="grace-period"
                        type="number"
                        value={office.grace_period_mins}
                        onChange={(e) => setOffice({ ...office, grace_period_mins: parseInt(e.target.value) || 0 })}
                        className="max-w-[150px]"
                      />
                      <p className="text-sm text-muted-foreground self-center">
                        Time allowed after shift start before marking as late.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="settings-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Admin Profile
                </CardTitle>
                <CardDescription>Manage your personal administrator details</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettingsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-6">
            <Card className="settings-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Holiday Calendar
                </CardTitle>
                <CardDescription>Configure public holidays to pause attendance schedulers</CardDescription>
              </CardHeader>
              <CardContent>
                <HolidaySettingsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card className="settings-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Geofencing Configuration
                </CardTitle>
                <CardDescription>Set up your office location and attendance radius</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="settings-grid-2">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={office.latitude}
                        onChange={(e) => setOffice({ ...office, latitude: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={office.longitude}
                        onChange={(e) => setOffice({ ...office, longitude: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Radius (meters)</Label>
                      <Input
                        type="number"
                        value={office.radius_meters}
                        onChange={(e) => setOffice({ ...office, radius_meters: parseInt(e.target.value) || 100 })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Employees must be within this distance to check in.
                      </p>
                    </div>
                  </div>

                  <div className="location-preview">
                    <div className="location-icon-wrapper">
                      <Globe className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Current Location</h4>
                      <p className="text-sm text-muted-foreground">
                        {office.latitude.toFixed(6)}, {office.longitude.toFixed(6)}
                      </p>
                    </div>
                    <Button variant="outline" onClick={useCurrentLocation} disabled={gettingLocation} className="w-full">
                      {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Navigation className="w-4 h-4 mr-2" />}
                      Use My Current Location
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="settings-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage system alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettingsPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
