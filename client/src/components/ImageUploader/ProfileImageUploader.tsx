import { useUpdateProfileImageMutation } from "@/features/userProfileApiSlice";
import { memo, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import ButtonLoading from "../Loading/ButtonLoading";
import { toast } from "react-toastify";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";
import AlertText from "../ErrorElements/AlertText";

const ProfileImageUploader = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [updateProfileImage, { isLoading, isError, error, isSuccess }] =
    useUpdateProfileImageMutation();

  const [apiError, setApiError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  const removeImage = useCallback(() => {
    setImage(null);
    setPreview(null);
  }, []);

  const handleUpload = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!image) return;
      setApiError(null);

      const formData = new FormData();
      formData.append("file", image);

      try {
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        const response = await updateProfileImage(formData).unwrap();
        console.log("Updated image: ", response);
        removeImage();
        setApiError(null);
        const modal = document.getElementById(
          "profile_img_modal"
        ) as HTMLDialogElement | null;
        if (modal) {
          modal.close();
        }
      } catch (error) {
        console.error(error);
      }
    },
    [image, removeImage, updateProfileImage]
  );

  useEffect(() => {
    if (isSuccess) {
      toast.success("Profile image updated");
    }
    if (isError && error) {
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage);
      }
    }
  }, [error, isError, isSuccess]);

  return (
    <div className="p-4 border rounded-md">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 rounded-md ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the image here...</p>
        ) : (
          <p>Drag & drop an image here, or click to select one</p>
        )}
      </div>

      {/* Preview and Remove Button */}
      {preview && (
        <div className="relative mt-4 w-32 h-32">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-md"
          />
          <button
            className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 rounded-full shadow-md"
            onClick={removeImage}
            title="Remove Image"
          >
            ✕
          </button>
        </div>
      )}

      <br />
      {apiError && <AlertText message={apiError} />}

      {/* Upload Button */}
      {image && (
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={isLoading}
        >
          {isLoading ? <ButtonLoading text="Uploading" /> : "Upload"}
        </button>
      )}
    </div>
  );
};

export default memo(ProfileImageUploader);
