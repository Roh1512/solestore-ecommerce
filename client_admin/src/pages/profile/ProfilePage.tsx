import LogoutAdmin from "@/components/Logout/LogoutAdmin";
import EditProfile from "@/components/ProfileComponents/EditProfile";
import { useGetProfileQuery } from "@/features/profileApiSLice";
import { Mail, Phone, User, CheckCircle, Calendar } from "lucide-react";

import ProfilePicture from "@/components/ProfileComponents/ProfilePicture";
import PageLoading from "@/components/Loading/PageLoading";
import ThemeToggle from "@/components/theme/ToggleTheme";
import { useTheme } from "@/context/ThemeContext";

const ProfilePage = () => {
  const { data, isLoading, isSuccess } = useGetProfileQuery();
  const { theme } = useTheme();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!data) {
    return <PageLoading />;
  }

  const { name, username, email, phone, role, created_at, updated_at } = data;

  return (
    <div className="container mx-auto p-2 md:p-10 bg-base-200 min-h-screen">
      {/* Profile Card */}
      <div className="card w-full max-w-3xl mx-auto bg-base-100 shadow-2xl">
        <div className="flex items-center justify-between p-2">
          {isSuccess && <EditProfile admin={isSuccess && data} />}
          <LogoutAdmin />
        </div>
        {/* Profile Image Section */}
        <div className="m-auto">
          <ProfilePicture admin={data} />
        </div>

        {/* Profile Details */}
        <div className="card-body mt-5 text-center p-2">
          {/* Name and Username */}
          <h2 className="card-title text-3xl font-bold flex items-center justify-center">
            <User className="mr-2 text-primary" />
            {name}
          </h2>
          <p className="text-sm text-gray-500">@{username}</p>

          {/* Role */}
          <div className="badge badge-primary badge-lg mt-3 flex items-center m-auto mb-2">
            <CheckCircle className="mr-1" />
            {role}
          </div>

          {/* Contact Information */}
          <div className="flex items-center justify-evenly flex-wrap gap-3">
            <div className="flex items-center justify-center w-min gap-2">
              <Mail className="mr-2 text-primary" />
              <p className="text-sm font-medium">{email}</p>
            </div>
            <div className="flex items-center justify-center w-min">
              <Phone className="mr-2 text-primary" />
              <p className="text-sm font-medium">{phone || "Not Provided"}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="divider my-8"></div>

          <div className="flex items-center justify-between max-w-96 w-full mx-auto gap-2 font-semibold mb-4 bg-base-200 px-2 py-4">
            <span>{theme === "lofi" ? "Dark" : "Light"} mode</span>{" "}
            <ThemeToggle />
          </div>

          {/* Created At & Updated At */}
          <div className="text-sm text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="flex items-center justify-center">
              <Calendar className="mr-2 text-primary" />
              <span className="font-semibold">Joined:</span>{" "}
              {new Date(created_at).toLocaleDateString()}
            </p>
            <p className="flex items-center justify-center">
              <Calendar className="mr-2 text-primary" />
              <span className="font-semibold">Last Updated:</span>{" "}
              {new Date(updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
