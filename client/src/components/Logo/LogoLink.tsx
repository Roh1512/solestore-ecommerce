import { Link } from "react-router-dom";

type Props = {
  to: string | null;
};

const LogoLink = (props: Props) => {
  return (
    <Link
      to={props.to ?? "/"}
      className="flex items-center justify-center gap-2 btn btn-ghost text-xl"
    >
      <img
        src="/soleStoreLogoSmall.svg"
        alt="Sole Store Logo"
        className="h-10 w-10"
      />
      <h1 className="text-3xl font-bold">Sole Store</h1>
    </Link>
  );
};

export default LogoLink;
