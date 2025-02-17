import { closeModal, openModal } from "@/utils/modal_utils";
import CategorySelect from "../Category/CategorySelect";
import { useCallback, useEffect, useMemo, useState } from "react";
import BrandSelect from "../Brand/BrandSelect";
import { ListFilterPlus } from "lucide-react";

type Props = {
  updateParams: (newParams: {
    page?: string;
    category?: string;
    brand?: string;
    size?: number;
  }) => void;
  size?: number;
  category?: string;
  brand?: string;
};

const FilterProducts = ({ updateParams, size, category, brand }: Props) => {
  const modalId = "filter-product-modal";

  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [selectedBrand, setSelectedBrand] = useState(brand || "");
  const [selectedSize, setSelectedSize] = useState<string>(
    size ? size.toString() : ""
  );

  const close = useCallback(() => {
    closeModal(modalId);
  }, []);

  const open = useCallback(() => {
    openModal(modalId);
  }, []);

  // Update local state if props change.
  useEffect(() => {
    setSelectedCategory(category || "");
  }, [category]);

  useEffect(() => {
    setSelectedBrand(brand || "");
  }, [brand]);

  useEffect(() => {
    setSelectedSize(size ? size.toString() : "");
  }, [size]);

  const handleApplyFilters = () => {
    const sizeNum = selectedSize ? parseInt(selectedSize, 10) : undefined;
    updateParams({
      category: selectedCategory || undefined,
      brand: selectedBrand || undefined,
      size: sizeNum,
      page: "1",
    });
    close();
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedSize("");
    updateParams({
      category: undefined,
      brand: undefined,
      size: undefined,
      page: "1",
    });
    close();
  };

  const availableSizes = useMemo(() => [7, 8, 9, 10, 11, 12], []);

  return (
    <>
      <button
        className="btn bg-base-300 text-base-content text-lg flex items-center gap-2"
        onClick={open}
        aria-label="Open filter options"
      >
        <ListFilterPlus aria-hidden="true" />
        <span>Filter</span>
      </button>

      <dialog
        id={modalId}
        className="modal modal-middle"
        role="dialog"
        aria-labelledby="filter-modal-title"
      >
        <div className="modal-box">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
            aria-label="Close filter modal"
          >
            ✕
          </button>
          <h3 id="filter-modal-title" className="font-bold text-lg mb-4">
            Filter Products
          </h3>
          <div className="flex flex-col gap-6">
            {/* Category Selector */}
            <div>
              <label
                htmlFor="category-select"
                className="block mb-2 font-medium"
              >
                Category
              </label>
              <CategorySelect
                value={selectedCategory}
                error=""
                onChange={(newCategory: string) =>
                  setSelectedCategory(newCategory)
                }
              />
            </div>

            {/* Brand Selector */}
            <div>
              <label htmlFor="brand-select" className="block mb-2 font-medium">
                Brand
              </label>
              <BrandSelect
                value={selectedBrand}
                error=""
                onChange={(newBrand: string) => setSelectedBrand(newBrand)}
              />
            </div>

            {/* Size Selector */}
            <div>
              <label htmlFor="size-select" className="block mb-2 font-medium">
                Size
              </label>
              <select
                id="size-select"
                className="select select-bordered w-full"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">All Sizes</option>
                {availableSizes.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-action flex flex-wrap items-center justify-center sm:flex-row gap-2">
            <button
              className="btn btn-secondary sm:w-auto"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
            <button
              className="btn btn-primary sm:w-auto"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default FilterProducts;
