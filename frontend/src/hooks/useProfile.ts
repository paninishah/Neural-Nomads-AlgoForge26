import { useState, useCallback, useEffect } from "react";
import type { Role } from "@/components/RoleLogin";
import { profileApi } from "@/api/client";

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

// Seed initial profile from values stored in localStorage at login time,
// so the UI shows real data immediately, not dummy placeholders.
function getInitialProfile(role: Role): any {
  const storedName  = localStorage.getItem("annadata_user_name");
  const storedPhone = localStorage.getItem("annadata_user_phone");
  const storedOrg   = localStorage.getItem("annadata_user_org");
  const storedEmail = localStorage.getItem("annadata_user_email");

  const base = { ...defaultProfiles[role] };

  if (role === "farmer") {
    if (storedName)  base.name  = storedName;
    if (storedPhone) base.phone = "+91 " + storedPhone;
  } else if (role === "ngo") {
    if (storedName)  base.name  = storedName;
    if (storedOrg)   base.org   = storedOrg;
    if (storedEmail) base.email = storedEmail;
  } else if (role === "admin") {
    if (storedName)  { base.name = storedName; base.adminId = storedName; }
  }

  return base;
}

export const useProfile = (role: Role) => {
  // Use getInitialProfile so real user values appear straight away
  const [profile, setProfile] = useState<any>(() => getInitialProfile(role));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("annadata_user_id");
      if (!userId) {
         setLoading(false);
         return;
      }
      try {
        const res = await profileApi.getProfile(userId);
        const data = res.data.data;

        if (!data || !data.id) {
          // No profile in DB yet — still show the localStorage data we already have
          setLoading(false);
          return;
        }

        // Profile exists in DB — merge it in
        if (role === "farmer") {
          setProfile((prev: any) => ({
            ...prev,
            name:      data.name      || prev.name,
            village:   data.village   || prev.village,
            district:  data.district  || prev.district,
            state:     data.state     || prev.state,
            farmSize:  data.land_acres ? String(data.land_acres) : prev.farmSize,
            crops:     data.crop      ? [data.crop]              : prev.crops,
          }));
        } else if (role === "ngo") {
          setProfile((prev: any) => ({
            ...prev,
            name:       data.name            || prev.name,
            org:        data.organization_name|| prev.org,
            regNumber:  data.registration_number || prev.regNumber,
            website:    data.website         || prev.website,
            states:     data.states_covered  && data.states_covered.length  ? data.states_covered  : prev.states,
            districts:  data.districts_covered && data.districts_covered.length ? data.districts_covered : prev.districts,
            focusAreas: data.focus_areas     && data.focus_areas.length     ? data.focus_areas     : prev.focusAreas,
            verified:   data.ngo_verified    ?? prev.verified,
          }));
        } else if (role === "admin") {
          setProfile((prev: any) => ({
            ...prev,
            adminId: data.admin_id || prev.adminId,
          }));
        }
      } catch (err) {
        console.error("Could not fetch profile from backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [role]);

  const updateProfile = useCallback(async (data: Partial<any>) => {
    // 1. Optimistic update
    let nextProfile: any;
    setProfile((prev: any) => {
      nextProfile = { ...prev, ...data };
      return nextProfile;
    });
    
    // 2. Map frontend structures to ProfileCreate
    const userId = localStorage.getItem("annadata_user_id");
    if (!userId || !nextProfile) return;

    try {
      // Map based on role
      const payload: any = {};
      if (role === "farmer") {
        payload.name = nextProfile.name;
        payload.village = nextProfile.village;
        payload.state = nextProfile.state;
        payload.crop = nextProfile.crops && nextProfile.crops.length > 0 ? nextProfile.crops[0] : undefined;
        payload.land_acres = nextProfile.farmSize ? parseFloat(nextProfile.farmSize) : undefined;
      } else if (role === "ngo") {
        payload.organization_name = nextProfile.org;
        payload.registration_number = nextProfile.regNumber;
        payload.website = nextProfile.website;
        payload.states_covered = nextProfile.states;
        payload.districts_covered = nextProfile.districts;
        payload.focus_areas = nextProfile.focusAreas;
      } else if (role === "admin") {
        payload.admin_id = nextProfile.adminId;
      }

      await profileApi.updateProfile(payload);
    } catch(e) {
      console.error("Failed to sync profile updates", e);
    }
  }, [role]);

  const resetProfile = useCallback(() => {
    setProfile(getInitialProfile(role));
  }, [role]);

  return { profile, updateProfile, resetProfile, loading };
};
