// src/components/CategorySelect.tsx
import { useState, ChangeEvent, memo } from "react";

import { BrandResponse } from "@/client";
import AlertText from "../ErrorElements/AlertText";
import { useGetBrandsQuery } from "@/features/brandApiSlice";

interface BrandSelectProps {
  value: string;
  onChange: (newBrand: string) => void;
  error?: string;
}

const BrandSelect: React.FC<BrandSelectProps> = memo(
  ({ value, onChange, error }) => {
    const [search, setSearch] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // Always fetch page 1 and pass the search term; update as the user types
    const { data: brands, isLoading } = useGetBrandsQuery({
      search,
      skip: 0,
      limit: 15,
    });

    // When the dropdown is opened, we want to fetch with the current search term
    const toggleDropdown = () => setIsOpen((prev) => !prev);

    // When a category is selected, update the value and close the dropdown
    const handleSelect = (categoryId: string) => {
      onChange(categoryId);
      setIsOpen(false);
    };

    return (
      <div className="relative">
        <div
          className="border p-2 rounded cursor-pointer"
          onClick={toggleDropdown}
        >
          {value
            ? brands?.find((brand: BrandResponse) => brand.id === value)
                ?.title || "Select Brand"
            : "Select Brand"}
        </div>

        {isOpen && (
          <div className="absolute z-10 bg-white border mt-1 rounded w-full">
            <input
              type="text"
              placeholder="Search brand..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="w-full p-2 border-b"
            />
            <ul className="max-h-60 overflow-auto">
              <li
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect("")}
              >
                --None--
              </li>
              {isLoading ? (
                <li className="p-2">Loading...</li>
              ) : brands && brands.length > 0 ? (
                brands.map((brand: BrandResponse) => (
                  <li
                    key={brand.id}
                    onClick={() => handleSelect(brand.id)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {brand.title}
                  </li>
                ))
              ) : (
                <li className="p-2">No Brands found</li>
              )}
            </ul>
          </div>
        )}
        {error && <AlertText message={error} />}
      </div>
    );
  }
);

export default BrandSelect;
