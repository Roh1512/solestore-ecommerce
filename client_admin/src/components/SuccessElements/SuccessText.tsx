import { CircleCheck } from "lucide-react";

type Props = {
  message: string;
};

const SuccessText = (props: Props) => {
  return (
    <p className="text-green-700 flex items-center justify-center gap-2">
      <CircleCheck className="w-6 h-6" /> <span>{props.message}</span>
    </p>
  );
};

export default SuccessText;
