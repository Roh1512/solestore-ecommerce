import { useAddImagesMutation } from "@/features/productApiSlice";
import { memo, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import AlertText from "../ErrorElements/AlertText";
import ButtonLoading from "../Loading/ButtonLoading";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";
import { toast } from "react-toastify";

type Props = {
  productId: string;
};

const ProductImagesUploader = ({ productId }: Props) => {
  // State for storing selected image files
  const [images, setImages] = useState<File[]>([]);
  // State for storing corresponding preview URLs
  const [previews, setPreviews] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Callback for when files are dropped/selected
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setApiError(null);
    // Append new files to existing list (you could also choose to replace)
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
  });

  // Create preview URLs when images change.
  useEffect(() => {
    const newPreviews = images.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Clean up preview URLs when images change or component unmounts.
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Mutation hook to add images to a product.
  const [addImages, { isLoading, isError, error, isSuccess }] =
    useAddImagesMutation();

  // Remove a single image by index
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (images.length === 0) return;

    const formData = new FormData();
    // Append each image under the "images" field.
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await addImages({ productId, formData }).unwrap();
      // Clear images and previews on success.
      setImages([]);
      setPreviews([]);
      setApiError(null);
    } catch (err) {
      console.error("Upload error:", err);
    }
  }, [images, addImages, productId]);

  useEffect(() => {
    if (isError && error) {
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage);
      }
    }
    if (isSuccess) {
      toast.success("Images uploaded");
    }
  }, [error, isError, isSuccess]);

  return (
    <div className="p-4 border rounded-md">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 rounded-md cursor-pointer ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop images here...</p>
        ) : (
          <p>Drag & drop images here, or click to select files</p>
        )}
      </div>

      {/* Preview Images Grid */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                onClick={() => removeImage(index)}
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {apiError && typeof apiError === "string" && (
        <AlertText message={apiError} />
      )}

      {/* Upload Button */}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        onClick={handleUpload}
        disabled={isLoading || images.length === 0}
      >
        {isLoading ? <ButtonLoading text="Uploading" /> : "Upload Images"}
      </button>
    </div>
  );
};

export default memo(ProductImagesUploader);
