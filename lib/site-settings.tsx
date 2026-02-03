"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SiteSettings {
  cohort_date_short: string;
  cohort_date_full: string;
  enrollment_status: string;
  first_class_pill: string;
  reserve_spot_text: string;
  cta_heading: string;
  [key: string]: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
}

// Default values (fallback if fetch fails)
const defaultSettings: SiteSettings = {
  cohort_date_short: "Jan 23-25",
  cohort_date_full: "January 23-25, 2025",
  enrollment_status: "Now enrolling for January 2025",
  first_class_pill: "First class: Jan 23-25",
  reserve_spot_text: "Reserve your spot for Jan 23-25",
  cta_heading: "Reserve Jan 23-25 and train with us",
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
