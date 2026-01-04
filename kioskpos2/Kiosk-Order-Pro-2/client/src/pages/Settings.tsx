import { useState, useEffect } from "react";
import { KioskLayout } from "@/components/KioskLayout";
import { useSettings, useUpdateSettings } from "@/hooks/use-kiosk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, Phone, MapPin, Save, Loader2 } from "lucide-react";

export default function Settings() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    shopName: "",
    chefNumber: "",
    address: ""
  });

  // Populate form when data loads
  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName || "",
        chefNumber: settings.chefNumber || "",
        address: settings.address || ""
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(formData, {
      onSuccess: () => toast({ title: "Settings saved successfully" }),
      onError: () => toast({ title: "Failed to save settings", variant: "destructive" })
    });
  };

  return (
    <KioskLayout>
      <div className="container mx-auto p-8 max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-8">System Settings</h1>

        <div className="grid gap-6">
          <Card className="border-border bg-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Shop Details
              </CardTitle>
              <CardDescription>
                Basic information about your kiosk displayed on the dashboard and receipts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Shop Name</label>
                <Input 
                  value={formData.shopName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Address (for Receipts)</label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-background"
                  placeholder="123 Main St, City, Country"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Kitchen Integration
              </CardTitle>
              <CardDescription>
                Configure WhatsApp number to send orders directly to the chef.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Chef's WhatsApp Number</label>
                <div className="flex gap-2 items-center">
                  <Input 
                    value={formData.chefNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, chefNumber: e.target.value }))}
                    className="bg-background"
                    placeholder="+919999999999"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: Include country code (e.g., +1 for US, +91 for India). No spaces or dashes.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={handleSave} disabled={updateSettings.isPending} className="gap-2">
              {updateSettings.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
