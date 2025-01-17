import { AdminResponse } from "@/client";
import { default_profile_img } from "@/utils/default_images";
import { CirclePlus } from "lucide-react";
import ProfileImageUploader from "../ImageUploader/ProfileImageUploader";

type Props = {
  admin: AdminResponse;
};

const ProfilePicture = (props: Props) => {
  const openModal = () => {
    const modal = document.getElementById(
      "profile_img_modal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  const closeModal = () => {
    const modal = document.getElementById(
      "profile_img_modal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };

  return (
    <div className="relative w-24 h-24">
      {/* Profile Image */}
      <img
        src={props?.admin?.profile_img_url || default_profile_img}
        alt={`${props?.admin?.username}'s profile`}
        className="rounded-full w-24 h-24 border-4 border-base-100 shadow-lg object-cover"
        onClick={openModal}
      />
      {/* Update Button */}
      <button
        className="absolute bottom-0 right-0 bg-secondary text-secondary-content p-0 rounded-full shadow-md z-10"
        title="Update Profile Picture"
        onClick={openModal}
      >
        <CirclePlus className="w-9 h-9" />
      </button>
      {/* Modal */}
      <dialog id="profile_img_modal" className="modal">
        <form method="dialog" className="modal-box">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={closeModal}
          >
            ✕
          </button>
          <h3 className="text-lg font-bold mb-4">Update Profile Image</h3>
          <p>Here you can update your profile image.</p>
          <ProfileImageUploader />
        </form>
        <form className="modal-backdrop">
          <button type="button" onClick={closeModal}></button>
        </form>
      </dialog>
    </div>
  );
};

export default ProfilePicture;
