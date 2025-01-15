import { Link } from "react-router-dom";

const AdminLandingPage = () => {
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            Welcome to Admin Dashboard
          </h1>
          <p className="text-base-content mt-2">
            Please log in to access the admin features.
          </p>
        </div>

        {/* Login Link */}
        <Link
          to="/admin/login"
          className="btn btn-lg btn-primary text-3xl font-semibold"
        >
          Sign in
        </Link>
      </main>
    </>
  );
};

export default AdminLandingPage;
