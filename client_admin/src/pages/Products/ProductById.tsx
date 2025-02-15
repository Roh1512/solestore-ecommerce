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
import { useCallback, useEffect } from "react";
import UpdateSizeStock from "@/components/Products/UpdateSizeStock";
import UpdateProductDetails from "@/components/Products/UpdateProductDetails";
import DeleteProduct from "@/components/Products/DeleteProduct";

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

  // Carousel for images
  const images =
    product.images && product.images.length > 0 ? (
      <div className="max-w-2xl mx-auto">
        <div className="carousel w-full rounded-box">
          {product.images.map((image, index) => (
            <div
              id={image.public_id}
              key={image.public_id}
              className="carousel-item relative w-full"
            >
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                className="w-full object-cover rounded-box"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteImage(image.public_id);
                }}
                className="btn btn-error btn-circle absolute top-2 right-2"
                title="Delete image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-2">
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
      <div className="max-w-2xl mx-auto p-4 text-center">
        <img
          src={LogoImg}
          alt="Placeholder"
          className="mx-auto rounded-box w-full object-cover"
        />
        <p className="flex items-center justify-center gap-2 text-lg mt-4">
          <Info className="w-4 h-4" />
          There are no images
        </p>
      </div>
    );

  // Display available sizes with size and stock information
  const sizesDisplay = product.sizes && product.sizes.length > 0 && (
    <div className="mt-4 border border-primary rounded-box p-4 w-fit mx-auto">
      <h4 className="text-xl font-bold mb-2">Available Sizes</h4>
      <div className="flex flex-wrap gap-4 justify-center">
        {product.sizes.map((sizeObj, index) => (
          <div
            key={index}
            className="bg-base-200 text-base-content rounded-lg p-4 flex flex-col items-center"
          >
            <span className="font-bold text-2xl">{sizeObj.size}</span>
            <span className="text-sm">Stock: {sizeObj.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="py-4 w-full flex items-center justify-between">
        <BackButton />
        <DeleteProduct product={product} />
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Images */}
          <div>
            {images}
            <div className="mt-6">
              <AddImages product={product} />
            </div>
          </div>
          {/* Right Side: Product Details */}
          <div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <UpdateProductDetails product={product} />
                <h3 className="card-title justify-center text-3xl font-bold">
                  {product.title}
                </h3>
                <p className="text-2xl font-bold text-center text-accent">
                  ${product.price.toFixed(2)}
                </p>
                {product.description && (
                  <p className="mt-4 text-center text-base-content">
                    {product.description}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-outline">Brand</span>
                    <span className="badge badge-primary">
                      {product.brand.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-outline">
                      <ChartBarStacked className="w-4 h-4" /> Category
                    </span>
                    <span className="badge badge-primary">
                      {product.category.title}
                    </span>
                  </div>
                </div>
                {sizesDisplay}
                <div className="mt-6">
                  <UpdateSizeStock product={product} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Date Information */}
        <div className="mt-8 text-center text-sm text-base-content">
          <p>
            <span className="font-bold">Created on:</span> {formattedCreatedAt}
          </p>
          <p>
            <span className="font-bold">Last updated:</span>{" "}
            {formattedUpdatedAt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductById;
