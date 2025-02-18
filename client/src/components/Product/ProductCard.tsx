import { ProductResponse } from "@/client";
import { memo } from "react";
import logoImage from "@/assets/soleStoreLogoSmall.svg";
import { Link } from "react-router-dom";
import AddToCart from "../Cart/AddToCart";

type Props = {
  product: ProductResponse;
};

const optimizeImageUrl = (url: string): string => {
  // Example transformation parameters.
  // If you are using a service like Cloudinary, you might replace '/upload/' with '/upload/w_600,h_400,c_fill,auto_compress/'.
  const transformationParams = "?w=600&h=400&fit=crop&auto=compress";
  return url.includes("?")
    ? url + "&w=600&h=400&fit=crop&auto=compress"
    : url + transformationParams;
};

const ProductCard = memo(({ product }: Props) => {
  const placeholderImage = logoImage;

  // Use the first image if available; otherwise, use the placeholder.
  const originalImageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : placeholderImage;

  // Apply transformation to optimize the image.
  const imageUrl = optimizeImageUrl(originalImageUrl);

  return (
    <div className="card sm:w-80 md:w-96 lg:w-96 bg-base-300 shadow-xl mx-auto">
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="card-body py-4">
        <h2 className="card-title text-4xl font-semibold mx-auto">
          {product.title}
        </h2>
        <div className="flex flex-row items-center justify-center gap-4">
          {product.brand && (
            <p className="badge badge-secondary text-lg font-medium px-2 py-3">
              by {product.brand.title}
            </p>
          )}
          {product.category && (
            <p className="badge badge-secondary font-medium px-2 py-3">
              {product.category.title}
            </p>
          )}
        </div>
        {product.description && <p>{product.description}</p>}
        <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
        <div className="card-actions justify-end">
          <AddToCart key={product.id} product={product} />
          <Link to={`/shop/products/${product.id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
