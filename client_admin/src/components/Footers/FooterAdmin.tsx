import LogoLink from "@components/Logo/LogoLink";

const FooterAdmin = () => {
  return (
    <footer className="flex flex-col items-center justify-center">
      <LogoLink to={"/admin"} />
      <p>&copy; 2025 Sole Store. All rights reserved.</p>
    </footer>
  );
};

export default FooterAdmin;
