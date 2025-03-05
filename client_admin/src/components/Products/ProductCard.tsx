import { ProductResponse } from "@/client";
import { memo } from "react";
import { Link } from "react-router-dom";
import placeholderImage from "@/assets/placeholder_image.jpg";
import { handleImageError } from "@/utils/default_images";
import { IndianRupee } from "lucide-react";

type Props = {
  product: ProductResponse;
};

const ProductCard = memo(({ product }: Props) => {
  // Define a placeholder image URL (you can customize this URL as needed)

  // Use the first image if available; otherwise, use the placeholder
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : placeholderImage;

  return (
    <div className="card sm:w-80 md:w-96 lg:w-96 bg-base-300 shadow-xl mx-auto">
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full object-cover min-h-52 max-h-64"
          onError={handleImageError}
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
        <div className="text-lg font-bold flex items-center justify-center gap-2">
          <IndianRupee />
          {product.price.toFixed(2)}
        </div>
        <div className="card-actions justify-end">
          <Link
            to={`/admin/products/${product.id}`}
            className="btn btn-primary"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
