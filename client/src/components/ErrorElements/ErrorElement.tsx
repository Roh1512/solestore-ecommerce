import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";

const ErrorElement = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Handle route errors (404, unauthorized, etc)
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-base-200 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error.status} Error
          </h1>
          <p className="text-base-content mb-4">
            {error.statusText || error.data?.message || "Something went wrong"}
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Go Back
            </button>
            <button onClick={() => navigate("/")} className="btn btn-primary">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle thrown errors
  const errorMessage =
    error instanceof Error ? error.message : "Unknown error occurred";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-base-200 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-base-content mb-4">{errorMessage}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            Retry
          </button>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorElement;
