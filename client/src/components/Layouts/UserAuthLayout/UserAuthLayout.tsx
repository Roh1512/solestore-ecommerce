import FooterStore from "@/components/headersAndFooters/footersStore/FooterStore";
import HeaderStore from "@/components/headersAndFooters/headers/headersStore/HeaderStore";
import { Outlet } from "react-router";

const UserAuthLayout = () => {
  return (
    <>
      <HeaderStore />
      <main className="flex-1 flex flex-col items-center justify-center">
        <Outlet />
      </main>
      <FooterStore />
    </>
  );
};

export default UserAuthLayout;
