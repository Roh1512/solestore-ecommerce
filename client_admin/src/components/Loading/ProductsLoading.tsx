const ProductsLoading = () => {
  return (
    <div className="p-6 bg-base-100 flex flex-col items-center justify-between gap-4">
      <div className="overflow-x-auto grid sm:grid-cols-1 md:grid-cols-2 gap-7 xl:grid-cols-3 flex-1">
        <div className="flex w-96 flex-col gap-4">
          <div className="skeleton h-80 w-full"></div>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
        <div className="flex w-96 flex-col gap-4">
          <div className="skeleton h-80 w-full"></div>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
        <div className="flex w-96 flex-col gap-4">
          <div className="skeleton h-80 w-full"></div>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
        <div className="flex w-96 flex-col gap-4">
          <div className="skeleton h-80 w-full"></div>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductsLoading;
