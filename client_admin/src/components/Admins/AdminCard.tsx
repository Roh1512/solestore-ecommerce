import { AdminResponse } from "@/client";
import { default_profile_img } from "@/utils/default_images";
import { memo } from "react";
import { Link } from "react-router-dom";

type Props = {
  admin: AdminResponse | undefined;
};

const AdminCard = memo(({ admin }: Props) => {
  // Apply Cloudinary optimizations dynamically
  const optimizedImageUrl = admin?.profile_img_url
    ? admin.profile_img_url.replace(
        "/upload/",
        "/upload/w_200,h_200,c_fill,q_auto,f_auto/"
      )
    : default_profile_img; // Fallback image
  return (
    <div className="card card-side bg-base-200 shadow-lg shadow-base-300 pl-2">
      <figure>
        <img
          src={optimizedImageUrl}
          alt="profile image"
          loading="lazy"
          className="rounded-full w-20 h-20"
        />
      </figure>
      <div className="card-body h-min py-3">
        <h2 className="card-title">@{admin?.username}</h2>
        <p>{admin?.name}</p>
        <div className="card-actions justify-end">
          <Link
            to={`/admin/admins/${admin?._id}`}
            className="btn btn-sm btn-neutral btn-outline"
          >
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
});

export default AdminCard;
