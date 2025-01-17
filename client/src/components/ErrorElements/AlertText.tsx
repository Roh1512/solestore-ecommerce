import { CircleAlert } from "lucide-react";
type Props = { message: string };
const AlertText = (props: Props) => {
  return (
    <div
      role="alert"
      className=" flex items-center  bg-transparent text-red-700 font-small justify-center gap-2"
    >
      <CircleAlert className="alert-icon-2" />
      {props.message}
    </div>
  );
};

export default AlertText;
