import React, { useEffect } from "react";
import { BrandResponse } from "@/client";
import DeleteBrand from "./DeleteBrand";
import { useDeleteBrandMutation } from "@/features/brandApiSlice";
import { toast } from "react-toastify";
import EditBrand from "./EditBrand";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";

type Props = {
  brand: BrandResponse;
};

const Brand: React.FC<Props> = ({ brand }) => {
  const [deleteBrand, { data, isLoading, isSuccess, isError, error }] =
    useDeleteBrandMutation();
  const currentBrandId = brand.id;
  const handleDeleteBrand = async () => {
    try {
      const res = await deleteBrand({ brandId: brand.id }).unwrap();
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Brand deleted");
    }
    if (isError && error) {
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage);
      } else {
        toast.error("Error deleting brand");
      }
    }
  }, [data?.message, error, isError, isSuccess]);

  return (
    <div className="bg-base-200 p-2 shadow-lg flex flex-row items-center justify-between min-w-64 rounded-xl max-h-fit">
      <h2 className="card-title text-2xl font-bold" tabIndex={0}>
        {brand.title}
      </h2>
      <div className="flex gap-0">
        <EditBrand brand={brand} editBrandId={brand.id} />
        <DeleteBrand
          brand={brand}
          onDelete={handleDeleteBrand}
          isLoading={isLoading}
          deleteBrandId={currentBrandId}
        />
      </div>
    </div>
  );
};

export default Brand;
