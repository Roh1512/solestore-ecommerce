import { TriangleAlert } from "lucide-react";
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
      <div className="mb-4 text-center flex items-center justify-between gap-2 p-4 bg-red-100 border border-red-400 rounded">
        <div className="m-auto flex items-center gap-2">
          <TriangleAlert className="alert-icon text-red-600" />
          <p className="text-red-600">{props.message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent click event from propagating
            closeMessage();
          }}
          className="text-red-600 hover:text-red-800 focus:outline-none"
        >
          <X />
        </button>
      </div>
    );
  }

  return null; // Don't render anything if show is false
};

export default AlertMessage;
