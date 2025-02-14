import PageLoading from "@/components/Loading/PageLoading";
import {
  useGetProductQuery,
  useDeleteImagesMutation,
} from "@/features/productApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams } from "react-router-dom";
import LogoImg from "@/assets/soleStoreLogoSmall.svg";
import { ChartBarStacked, Info } from "lucide-react";
import BackButton from "@/components/Buttons/BackButton";
import AddImages from "@/components/Products/AddImages";
import { toast } from "react-toastify";
import { useCallback } from "react";

const ProductById = () => {
  const { productId } = useParams();
  const { data: product, isLoading } = useGetProductQuery(
    productId ? { productId } : skipToken
  );

  // Mutation hook to delete images.
  const [deleteImages] = useDeleteImagesMutation();

  const handleDeleteImage = useCallback(
    async (publicId: string) => {
      if (window.confirm("Are you sure you want to delete this image?")) {
        try {
          await deleteImages({
            productId: product!.id,
            public_ids: [publicId],
          }).unwrap();
          toast.success("Image deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete image");
        }
      }
    },
    [deleteImages, product]
  );

  if (isLoading) {
    return <PageLoading />;
  }

  if (!product) {
    return (
      <div className="text-center text-error text-lg">Product not found!</div>
    );
  }

  // Format dates using toLocaleDateString with options
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedCreatedAt = new Date(product.created_at).toLocaleDateString(
    undefined,
    dateOptions
  );
  const formattedUpdatedAt = new Date(product.updated_at).toLocaleDateString(
    undefined,
    dateOptions
  );

  // Display the carousel with indicators and a delete button for each image
  const images =
    product.images && product.images.length > 0 ? (
      <div className="w-full max-w-lg mx-auto">
        <div className="carousel carousel-center rounded-box relative">
          {product.images.map((image, index) => (
            <div
              id={image.public_id}
              key={image.public_id}
              className="carousel-item w-full max-w-md mr-2 relative"
            >
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                className="rounded-box w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteImage(image.public_id);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                title="Delete image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {/* Indicators without updating history state */}
        <div className="flex justify-center w-full py-2 gap-2">
          {product.images.map((image) => (
            <button
              key={image.public_id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(image.public_id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="btn btn-xs btn-circle"
            ></button>
          ))}
        </div>
      </div>
    ) : (
      <div className="w-full max-w-lg mx-auto p-4">
        <img
          src={LogoImg}
          alt="Placeholder"
          className="rounded-box w-full h-auto object-cover"
        />
        <p className="flex gap-2 mx-auto items-center justify-center text-lg">
          <Info />
          There are no images
        </p>
      </div>
    );

  // Display available sizes with size and stock information
  const sizesDisplay = product.sizes && product.sizes.length > 0 && (
    <div className="mt-2 border-2 rounded-xl border-primary p-2 w-fit mx-auto">
      <h4 className="text-xl font-semibold mb-2">Available Sizes</h4>
      <div className="flex gap-4 flex-wrap items-center justify-center">
        {product.sizes.map((sizeObj, index) => (
          <div
            key={index}
            className="bg-base-200 text-base-content rounded-lg p-2 flex flex-col items-center"
          >
            <span className="font-bold text-lg">{sizeObj.size}</span>
            <span className="text-sm">Stock: {sizeObj.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-start">
      <BackButton />
      <div className="container mx-auto p-2">
        {images}
        <AddImages product={product} />
        <h3 className="text-2xl font-bold mt-4 text-center">{product.title}</h3>
        <div className="text-center mt-2">
          <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
          {product.description ? (
            <p className="mt-2">{product.description}</p>
          ) : (
            <br />
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4 mt-4">
          <p className="flex mx-auto">
            <span className="font-semibold badge bg-base-300 text-base-content text-md p-2">
              Brand
            </span>
            <span className="badge badge-primary text-md p-2">
              {product.brand.title}
            </span>
          </p>
          <p className="flex mx-auto">
            <span className="font-semibold badge bg-base-300 text-base-content text-md p-2">
              <ChartBarStacked className="w-4 h-4" />
              Category
            </span>
            <span className="badge badge-primary text-md p-2">
              {product.category.title}
            </span>
          </p>
        </div>

        {sizesDisplay}
        <button className="btn">Update Size and Stock</button>
      </div>
      {/* Date Information */}
      <div className="text-center mt-4 text-sm text-gray-500 mx-auto">
        <p>
          <span className="font-semibold">Created on:</span>{" "}
          {formattedCreatedAt}
        </p>
        <p>
          <span className="font-semibold">Last updated:</span>{" "}
          {formattedUpdatedAt}
        </p>
      </div>
    </div>
  );
};

export default ProductById;
