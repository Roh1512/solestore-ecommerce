import { ProductResponse } from "@/client";
import { memo } from "react";
import PlaceHolderImage from "@/assets/placeholder_image.jpg";
import { Link } from "react-router-dom";
import AddToCart from "../Cart/AddToCart";
import { handleImageError } from "@/utils/default_images";
import { IndianRupee } from "lucide-react";

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
  // Use the first image if available; otherwise, use the placeholder.
  const originalImageUrl =
    product.images && product.images.length > 0 && product.images[0].url;

  // Apply transformation to optimize the image.
  const imageUrl = originalImageUrl && optimizeImageUrl(originalImageUrl!);

  return (
    <div className="card sm:w-80 md:w-96 lg:w-96 bg-base-100 border border-base-300 text-base-content shadow-xl mx-auto">
      <figure className="p-5">
        <img
          src={imageUrl || PlaceHolderImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-64 object-cover rounded-xl"
          onError={handleImageError}
        />
      </figure>
      <div className="card-body py-4">
        <h2 className="card-title text-2xl font-semibold mx-auto">
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
        <div className="text-lg font-bold flex items-center justify-center gap-2">
          <IndianRupee />
          {product.price.toFixed(2)}
        </div>
        <div className="card-actions justify-end">
          <AddToCart key={product.id} product={product} />
          <Link to={`/shop/products/${product.id}`} className="btn btn-neutral">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
