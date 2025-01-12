import { Link, useNavigate } from "react-router-dom";

import FooterStore from "../../components/headersAndFooters/footersStore/FooterStore";
import LogoLink from "@/components/Logo/LogoLink";
import ThemeToggle from "@/components/Theme/ToggleTheme";

const LandingPage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Running Shoes",
      image: "/HomePageImages/runningShoes.jpg",
      description:
        "Boost your performance with lightweight, durable shoes designed for running.",
      link: "/category/running-shoes",
    },
    {
      name: "Casual Shoes",
      image: "/HomePageImages/casualShoes.jpg",
      description: "Comfortable and stylish shoes perfect for everyday wear.",
      link: "/category/casual-shoes",
    },
    {
      name: "Formal Shoes",
      image: "/HomePageImages/formalShoes.jpg",
      description:
        "Step into sophistication with our premium selection of formal shoes.",
      link: "/category/formal-shoes",
    },
    {
      name: "Boots",
      image: "/HomePageImages/boots.jpg",
      description: "Durable and stylish boots for all seasons and terrains.",
      link: "/category/boots",
    },
    {
      name: "Sneakers",
      image: "/HomePageImages/sneakers.jpg",
      description:
        "Comfortable, stylish, and functional sneakers to stand out.",
      link: "/category/sneakers",
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="navbar">
        <div className="flex-1">
          <LogoLink to="/" />
        </div>
        {/* Shop Now Button */}
        <div className="flex-none gap-2">
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary font-bold text-lg"
          >
            Shop Now
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content py-16">
        <div className="hero-content text-center">
          <div>
            <h1 className="text-5xl font-bold">
              Step into Style, Comfort, and Savings!
            </h1>
            <p className="py-4">
              Welcome to Sole Store – where fashion meets comfort. Shop the
              latest trends and exclusive offers!
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="btn btn-primary"
            >
              Explore Collection
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold">Ready to Find Your Perfect Pair?</h2>
        <p className="py-4">
          Join us today and start exploring our latest collection.
        </p>
        <Link to="/sign-up" className="btn btn-primary">
          Join Now
        </Link>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold text-center">
          Explore Our Shoe Categories
        </h2>
        <p className="text-center py-4">
          From running shoes to formal wear, find the perfect pair for any
          occasion.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-xl hover:scale-105 transition-transform duration-200"
            >
              <figure>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{category.name}</h3>
                <p>{category.description}</p>
                <div className="card-actions justify-end">
                  <Link to={category.link} className="btn btn-secondary">
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/shop/categories" className="btn btn-outline">
            All Categories
          </Link>
        </div>
      </section>

      {/* Footer */}
      <FooterStore />
    </>
  );
};

export default LandingPage;
