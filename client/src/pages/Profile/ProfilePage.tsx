import PageLoading from "@/components/Loading/PageLoading";
import LogoutButton from "@/components/LogoutButtons/LogoutUser";
import EditProfileDetails from "@/components/ProfileComponents/EditProfileDetails";
import ProfilePicture from "@/components/ProfileComponents/ProfilePicture";
import UpdateContanctInfo from "@/components/ProfileComponents/UpdateContanctInfo";
import ThemeToggle from "@/components/Theme/ToggleTheme";
import { useGetProfileQuery } from "@/features/userProfileApiSlice";
import { Calendar, Mail, Phone, User, HomeIcon } from "lucide-react";

const ProfilePage = () => {
  const { data, isLoading } = useGetProfileQuery();
  if (isLoading) {
    return <PageLoading />;
  }
  if (!data) {
    return <PageLoading />;
  }

  console.log(data);

  const {
    name,
    username,
    email,
    phone,
    address,
    created_at,
    updated_at,
    profile_img_url,
  } = data;

  return (
    <div className="container mx-auto p-5 md:p-10 bg-base-200 min-h-screen">
      {/* Profile Card */}
      <div className="card w-full max-w-3xl mx-auto bg-base-100 shadow-2xl">
        <div className="flex items-center justify-between p-2">
          {/* {isSuccess && <EditProfile admin={isSuccess && data} />} */}
          <EditProfileDetails user={data} />
          <LogoutButton />
        </div>
        {/* Profile Image Section */}
        <div className="m-auto">
          <ProfilePicture image_url={profile_img_url} />
        </div>

        {/* Profile Details */}
        <div className="card-body mt-5 text-center">
          {/* Name and Username */}
          <h2 className="card-title text-3xl font-bold flex items-center justify-center">
            <User className="mr-2 text-primary" />
            {name}
          </h2>
          <p className="text-sm text-gray-500">@{username}</p>

          {/* Contact Information */}
          <div className="flex items-center justify-evenly flex-wrap gap-3 w-full">
            <div className="flex items-center justify-center w-min gap-2">
              <Mail className="mr-2 text-primary" />
              <p className="text-sm font-medium">{email}</p>
            </div>
            <div className="flex items-center justify-center w-fit">
              <Phone className="mr-2 text-primary" />
              <p className="text-sm font-medium">{phone || "Not Provided"}</p>
            </div>
            <br />
          </div>
          <div className="w-fit flex items-center justify-center text-center gap-4 m-auto mt-3">
            <h3 className="w-fit flex items-center justify-center text-center">
              <HomeIcon className="mr-2 text-primary" />
              Address:
            </h3>
            <p className="text-sm font-medium">{address || "Not Provided"}</p>
          </div>

          <br />
          <UpdateContanctInfo user={data} />

          <br />
          <br />
          <div className="bg-base-100 px-2 py-4 flex items-center justify-center gap-4">
            <span className="font-semibold text-lg">Theme: </span>
            <ThemeToggle />
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
