import { TriangleAlert } from "lucide-react";

type Props = {
  message: string;
};

const AlertMessage = (props: Props) => {
  return (
    <div className="mb-4 text-center flex items-center justify-center gap-2">
      <TriangleAlert className="alert-icon" />
      <p className="text-red-600">{props.message}</p>
    </div>
  );
};

export default AlertMessage;
