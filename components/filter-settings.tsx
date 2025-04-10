"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function FilterSettings({ onSettingsChanged }: { onSettingsChanged: () => void }) {
  const { toast } = useToast();

  const [spamThreshold, setSpamThreshold] = useState(0.8);
  const [allowPromotions, setAllowPromotions] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spamThreshold, allowPromotions }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: "Settings saved",
        description: "Your filter settings have been updated.",
      });

      onSettingsChanged(); // refresh inbox, if needed
    } catch (error) {
      console.error("Error saving filter settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium">Spam Threshold (0 - 1)</label>
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={spamThreshold}
          onChange={(e) => setSpamThreshold(parseFloat(e.target.value))}
          className="mt-2 w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="font-medium">Allow Promotions</label>
        <input
          type="checkbox"
          className="ml-2"
          checked={allowPromotions}
          onChange={() => setAllowPromotions(!allowPromotions)}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
