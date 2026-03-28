import { useState, useCallback } from "react";
import type { Role } from "@/components/RoleLogin";

// ── Default profiles per role ────────────────────────
const defaultProfiles: Record<Role, any> = {
  farmer: {
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    village: "Amlori",
    district: "Singrauli",
    state: "Madhya Pradesh",
    language: "Hindi",
    farmSize: "4.5",
    crops: ["Wheat", "Soybean"],
    irrigation: "Borewell",
  },
  ngo: {
    name: "Kiran Mehta",
    org: "Kisan Seva Kendra",
    regNumber: "NGO/MH/2019/0042",
    website: "www.kisanseva.org",
    states: ["Maharashtra", "Madhya Pradesh"],
    districts: ["Pune", "Nashik"],
    focusAreas: ["Fraud Awareness", "Legal Aid", "Loans"],
    verified: true,
  },
  admin: {
    name: "System Administrator",
    adminId: "SYS-ADMIN-01",
  },
};

export const useProfile = (role: Role) => {
  const key = `annadata_profile_${role}`;

  const [profile, setProfile] = useState<any>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultProfiles[role];
    } catch {
      return defaultProfiles[role];
    }
  });

  const updateProfile = useCallback((data: Partial<any>) => {
    setProfile((prev: any) => {
      const next = { ...prev, ...data };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  const resetProfile = useCallback(() => {
    const defaults = defaultProfiles[role];
    setProfile(defaults);
    try { localStorage.setItem(key, JSON.stringify(defaults)); } catch {}
  }, [role, key]);

  return { profile, updateProfile, resetProfile };
};
