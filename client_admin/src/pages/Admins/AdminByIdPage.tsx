import DeleteAdmin from "@/components/Admins/DeleteAdmin";
import UpdateRole from "@/components/Admins/UpdateRole";
import PageLoading from "@/components/Loading/PageLoading";
import { useGetAdminQuery } from "@/features/allAdminsApiSlice";
import { default_profile_img } from "@/utils/default_images";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams } from "react-router-dom";

const AdminByIdPage = () => {
  const { adminId } = useParams();
  const { data: admin, isLoading } = useGetAdminQuery(
    adminId ? { adminId } : skipToken // Skip query if adminId is undefined
  );

  // Apply Cloudinary optimizations dynamically
  const optimizedImageUrl = admin?.profile_img_url
    ? admin.profile_img_url.replace(
        "/upload/",
        "/upload/w_200,h_200,c_fill,q_auto,f_auto/"
      )
    : default_profile_img; // Fallback image

  if (isLoading) {
    return <PageLoading />;
  }

  if (!admin) {
    return <div className="text-center text-error">Admin not found!</div>;
  }

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-4xl mx-auto bg-base-100 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Details</h1>

        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <div className="avatar">
            <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={optimizedImageUrl}
                alt={`${admin.username}'s profile`}
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Admin Details */}
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Username:</span>
            <span>{admin.username}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Name:</span>
            <span>{admin.name || "N/A"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Email:</span>
            <span>{admin.email}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Role:</span>
            <div className="flex gap-2 items-center justify-center">
              <UpdateRole admin={admin} />
              <span>{admin.role}</span>
            </div>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Phone:</span>
            <span>{admin.phone || "N/A"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Created At:</span>
            <span>{new Date(admin.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Updated At:</span>
            <span>{new Date(admin.updated_at).toLocaleString()}</span>
          </div>
        </div>
        <br />
        <DeleteAdmin
          text="Delete Admin"
          admin={admin}
          deleteAdminId={admin._id}
        />
      </div>
    </div>
  );
};

export default AdminByIdPage;
