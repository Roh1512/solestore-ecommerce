import { ArrowLeftFromLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-ghost p-2"
      onClick={() => navigate(-1)}
      aria-label="Back to previos page"
    >
      <ArrowLeftFromLine className="w-5 h-5" />
    </button>
  );
};

export default BackButton;
