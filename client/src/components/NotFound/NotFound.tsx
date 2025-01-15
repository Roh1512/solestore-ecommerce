import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex items-center justify-center">
      <div className="bg-base-300 text-base-content p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h1 className="text-4xl font-bold text-red-800">404</h1>
        <p className="sm:text-sm md:text-xl mb-4">
          Oops! The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="btn btn-outline btn-secondary sm:text-md md:text-xl"
          replace
        >
          Go back to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
