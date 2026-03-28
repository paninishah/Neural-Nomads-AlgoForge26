import type { Role } from "@/components/RoleLogin";
import FarmerProfile from "./FarmerProfile";
import NGOProfile    from "./NGOProfile";
import AdminProfile  from "./AdminProfile";

interface ProfilePageProps {
  role: Role;
}

const ProfilePage = ({ role }: ProfilePageProps) => {
  if (role === "farmer") return <FarmerProfile role={role} />;
  if (role === "ngo")    return <NGOProfile role={role} />;
  if (role === "admin")  return <AdminProfile role={role} />;
  return null;
};

export default ProfilePage;
