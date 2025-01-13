import FooterStore from "@/components/headersAndFooters/footersStore/FooterStore";
import HeaderStore from "@/components/headersAndFooters/headers/headersStore/HeaderStore";
import { Outlet } from "react-router";

const UserAuthLayout = () => {
  return (
    <>
      <HeaderStore />
      <main className="flex flex-col items-center justify-center pt-6 pb-6">
        <Outlet />
      </main>
      <FooterStore />
    </>
  );
};

export default UserAuthLayout;
