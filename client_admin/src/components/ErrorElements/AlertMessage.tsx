import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = {
  message: string;
};

const AlertMessage = (props: Props) => {
  const [show, setShow] = useState<boolean>(false);

  const closeMessage = () => {
    setShow(false);
  };

  useEffect(() => {
    if (props.message) {
      setShow(true);
    }
  }, [props.message]);

  if (show) {
    return (
      <div
        role="alert"
        className="alert alert-error flex items-center justify-between border-3 border-red-700 bg-transparent p-2 text-red-700 font-medium"
      >
        <div className="m-auto flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{props.message}</span>
        </div>
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent click event from propagating
              closeMessage();
            }}
            className="btn bg-transparent border-none outline-none p-2 text-red-700"
          >
            <X />
          </button>
        </div>
      </div>
    );
  }

  return null; // Don't render anything if show is false
};

export default AlertMessage;
