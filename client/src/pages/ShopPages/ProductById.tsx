import PageLoading from "@/components/Loading/PageLoading";
import { useGetProductQuery } from "@/features/productApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams } from "react-router-dom";
import LogoImg from "@/assets/soleStoreLogoSmall.svg";
import { ChartBarStacked, Info } from "lucide-react";
import BackButton from "@/components/Buttons/BackButton";
import { useEffect } from "react";
import AddToCart from "@/components/Cart/AddToCart";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { handleImageError } from "@/utils/default_images";

const ProductById = () => {
  const { productId } = useParams();
  const { data: product, isLoading } = useGetProductQuery(
    productId ? { productId } : skipToken
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
        <Carousel
          showArrows={true}
          showStatus={false}
          showThumbs={false}
          infiniteLoop={true}
          useKeyboardArrows={true}
          autoPlay={false}
          stopOnHover={true}
          swipeable={true}
          dynamicHeight={false}
          emulateTouch={true}
          className="rounded-box"
        >
          {product.images.map((image, index) => (
            <div key={image.public_id} className="relative">
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                className="max-h-96 w-full object-fill bg-base-300"
                loading={index === 0 ? "eager" : "lazy"}
                onError={handleImageError}
              />
            </div>
          ))}
        </Carousel>
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
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Images */}
          <div>{images}</div>
          {/* Right Side: Product Details */}
          <div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <AddToCart product={product} />
                <h3 className="card-title justify-center text-3xl font-bold">
                  {product.title}
                </h3>
                <p className="text-2xl font-bold text-center text-red-800">
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
