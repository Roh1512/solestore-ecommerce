import React from "react";
import { BrandResponse } from "@/client";
import DeleteBrand from "./DeleteBrand";
import EditBrand from "./EditBrand";

type Props = {
  brand: BrandResponse;
};

const Brand: React.FC<Props> = ({ brand }) => {
  return (
    <div className="bg-base-200 p-2 shadow-lg flex flex-row items-center justify-between min-w-64 rounded-xl max-h-fit">
      <h2 className="card-title text-2xl font-bold" tabIndex={0}>
        {brand.title}
      </h2>
      <div className="flex gap-0">
        <EditBrand brand={brand} editBrandId={brand.id} />
        <DeleteBrand brand={brand} deleteBrandId={brand.id} />
      </div>
    </div>
  );
};

export default Brand;
