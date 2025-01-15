import { Link } from "react-router-dom";
import { Package, Box, ShoppingCart, Users, ClipboardList } from "lucide-react"; // Importing icons from Lucide React
import HeaderAdmin from "@/components/Headers/HeaderAdmin";
import FooterAdmin from "@/components/Footers/FooterAdmin";
import LogoutAdmin from "@/components/Logout/LogoutAdmin";

const Dashboard = () => {
  return (
    <>
      <HeaderAdmin />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-base-content mt-2">
            Manage your store effortlessly
          </p>
          <LogoutAdmin />
        </div>

        {/* Navigation Links */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {/* Categories */}
          <Link
            to="/admin/categories"
            aria-label="Manage Categories"
            className="bg-primary text-primary-content rounded-lg shadow-md p-6 flex flex-col items-center hover:bg-primary-focus focus:ring-4 focus:ring-primary-focus focus:outline-none transition"
          >
            <Box className="h-10 w-10" />
            <span className="font-medium mt-2">Categories</span>
          </Link>

          {/* Products */}
          <Link
            to="/admin/products"
            aria-label="Manage Products"
            className="bg-secondary text-secondary-content rounded-lg shadow-md p-6 flex flex-col items-center hover:bg-secondary-focus focus:ring-4 focus:ring-secondary-focus focus:outline-none transition"
          >
            <Package className="h-10 w-10" />
            <span className="font-medium mt-2">Products</span>
          </Link>

          {/* Brands */}
          <Link
            to="/admin/brands"
            aria-label="Manage Brands"
            className="bg-accent text-accent-content rounded-lg shadow-md p-6 flex flex-col items-center hover:bg-accent-focus focus:ring-4 focus:ring-accent-focus focus:outline-none transition"
          >
            <ClipboardList className="h-10 w-10" />
            <span className="font-medium mt-2">Brands</span>
          </Link>

          {/* Admins */}
          <Link
            to="/admin/admins"
            aria-label="Manage Admins"
            className="bg-neutral text-neutral-content rounded-lg shadow-md p-6 flex flex-col items-center hover:bg-neutral-focus focus:ring-4 focus:ring-neutral-focus focus:outline-none transition"
          >
            <Users className="h-10 w-10" />
            <span className="font-medium mt-2">Admins</span>
          </Link>

          {/* Orders */}
          <Link
            to="/admin/orders"
            aria-label="Manage Orders"
            className="bg-warning text-warning-content rounded-lg shadow-md p-6 flex flex-col items-center hover:bg-warning-focus focus:ring-4 focus:ring-warning-focus focus:outline-none transition"
          >
            <ShoppingCart className="h-10 w-10" />
            <span className="font-medium mt-2">Orders</span>
          </Link>
        </div>
      </main>
      <FooterAdmin />
    </>
  );
};

export default Dashboard;
