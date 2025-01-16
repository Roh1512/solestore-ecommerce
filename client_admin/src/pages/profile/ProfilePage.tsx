import LogoutAdmin from "@/components/Logout/LogoutAdmin";
import EditProfile from "@/components/ProfileComponents/EditProfile";
import { useGetProfileQuery } from "@/features/profileApiSLice";
import { Mail, Phone, User, CheckCircle, Calendar } from "lucide-react";

const ProfilePage = () => {
  const { data, isLoading, isSuccess } = useGetProfileQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="loading loading-spinner text-primary"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <p className="text-error text-lg">
          Error: Unable to fetch profile data.
        </p>
      </div>
    );
  }

  const {
    name,
    username,
    email,
    phone,
    role,
    profile_img_url,
    created_at,
    updated_at,
  } = data;

  return (
    <div className="container mx-auto p-5 md:p-10 bg-base-200 min-h-screen">
      {/* Profile Card */}
      <div className="card w-full max-w-3xl mx-auto bg-base-100 shadow-2xl">
        {/* Profile Image Section */}
        <div className="relative">
          <figure className="w-full h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1593642532973-d31b6557fa68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
          </figure>
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <img
              src={profile_img_url || ""}
              alt={`${username}'s profile`}
              className="rounded-full w-24 h-24 border-4 border-base-100 shadow-lg"
            />
          </div>
        </div>

        {/* Profile Details */}
        <div className="card-body mt-14 text-center">
          {/* Name and Username */}
          <h2 className="card-title text-3xl font-bold flex items-center justify-center">
            <User className="mr-2 text-primary" />
            {name}
          </h2>
          <p className="text-sm text-gray-500">@{username}</p>
          <div>{isSuccess && <EditProfile admin={isSuccess && data} />}</div>

          {/* Role */}
          <div className="badge badge-primary badge-lg mt-3 flex items-center">
            <CheckCircle className="mr-1" />
            {role}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex items-center justify-center">
              <Mail className="mr-2 text-primary" />
              <p className="text-sm font-medium">{email}</p>
            </div>
            <div className="flex items-center justify-center">
              <Phone className="mr-2 text-primary" />
              <p className="text-sm font-medium">{phone || "Not Provided"}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="divider my-8"></div>

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
          <div className="m-auto">
            <LogoutAdmin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
