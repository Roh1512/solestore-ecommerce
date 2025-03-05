import { memo } from "react";

const PageLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Loading Container */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>

        {/* Loading Text */}
        <p className="text-lg text-primary font-bold">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
};

export default memo(PageLoading);
