import { default_profile_img } from "@/utils/default_images";
import { CirclePlus } from "lucide-react";
import ProfileImageUploader from "../ImageUploader/ProfileImageUploader";
import { closeModal, openModal } from "@/utils/modal_utils";
import { memo } from "react";

type Props = {
  image_url: string | null | undefined;
};

const ProfilePicture = (props: Props) => {
  const modalId = "profile_img_modal";
  const modalOpen = () => openModal(modalId);
  const modalClose = () => closeModal(modalId);
  return (
    <div className="relative w-24 h-24">
      {/* Profile Image */}
      <img
        src={props.image_url || default_profile_img}
        alt={`profile image`}
        loading="lazy"
        className="rounded-full w-24 h-24 border-4 border-base-100 shadow-lg object-cover"
        onClick={modalOpen}
        crossOrigin="anonymous"
      />
      {/* Update Button */}
      <button
        className="absolute bottom-0 right-0 bg-secondary text-secondary-content p-0 rounded-full shadow-md z-10"
        title="Update Profile Picture"
        onClick={modalOpen}
      >
        <CirclePlus className="w-9 h-9" />
      </button>
      {/* Modal */}
      <dialog id="profile_img_modal" className="modal">
        <form method="dialog" className="modal-box">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={modalClose}
          >
            ✕
          </button>
          <h3 className="text-lg font-bold mb-4">Update Profile Image</h3>
          <p>Here you can update your profile image.</p>
          <ProfileImageUploader />
        </form>
        <form className="modal-backdrop">
          <button type="button" onClick={modalClose}></button>
        </form>
      </dialog>
    </div>
  );
};

export default memo(ProfilePicture);
