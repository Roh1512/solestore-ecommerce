import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import PlaceHolderImage from "@/assets/placeholder_image.jpg";

import FooterStore from "../../components/headersAndFooters/footersStore/FooterStore";
import LogoLink from "@/components/Logo/LogoLink";
import { handleImageError } from "@/utils/default_images";

const heroVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Running Shoes",
      image:
        "https://res.cloudinary.com/rohithashok/image/upload/c_thumb,w_200,g_face/v1741077945/ajkajakjkaajksolestore_ecommerce_app/static_files/pexels-jeshoots-com-147458-7432_pzyvvk.jpg",
      description:
        "Boost your performance with lightweight, durable shoes designed for running.",
      link: "/shop",
    },
    {
      name: "Casual Shoes",
      image:
        "https://res.cloudinary.com/rohithashok/image/upload/c_thumb,w_200,g_face/v1741077949/solestore_ecommerce_app/static_files/pexels-mnzoutfits-1598508_xlus0z.jpg",
      description: "Comfortable and stylish shoes perfect for everyday wear.",
      link: "/shop",
    },
    {
      name: "Formal Shoes",
      image:
        "https://res.cloudinary.com/rohithashok/image/upload/c_thumb,w_200,g_face/v1741077947/solestore_ecommerce_app/static_files/pexels-solliefoto-298864_ewvbnq.jpg",
      description:
        "Step into sophistication with our premium selection of formal shoes.",
      link: "/shop",
    },
    {
      name: "Boots",
      image:
        "https://res.cloudinary.com/rohithashok/image/upload/c_thumb,w_200,g_face/v1741075264/solestore_ecommerce_app/static_files/pexels-clemlep-29090887_uqshpo.jpg",
      description: "Durable and stylish boots for all seasons and terrains.",
      link: "/shop",
    },
    {
      name: "Sneakers",
      image:
        "https://res.cloudinary.com/rohithashok/image/upload/c_thumb,w_200,g_face/v1741077335/solestore_ecommerce_app/static_files/pexels-avneet-kaur-669191817-19294576_c0hcoe.jpg",
      description:
        "Comfortable, stylish, and functional sneakers to stand out.",
      link: "/shop",
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="navbar bg-base-100 shadow-md px-4">
        <div className="flex-1">
          <LogoLink to="/" />
        </div>
        <div className="flex-none gap-2">
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary btn-md font-bold text-base"
          >
            Shop Now
          </button>
        </div>
      </header>

      {/* Hero Section with Fixed Background Image */}
      <motion.main
        className="hero bg-fixed bg-cover bg-center text-primary-content py-16"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/rohithashok/image/upload/c_fill,w_1920,h_1080,q_auto,f_auto/v1741077335/solestore_ecommerce_app/static_files/pexels-avneet-kaur-669191817-19294576_c0hcoe.jpg')",
        }}
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="hero-overlay bg-opacity-25"></div>
        <div className="hero-content text-center text-slate-300">
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
      </motion.main>

      {/* CTA Section */}
      <section className="text-center py-16 bg-base-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
        >
          <h2 className="text-4xl font-bold">
            Ready to Find Your Perfect Pair?
          </h2>
          <p className="py-4">
            Join us today and start exploring our latest collection.
          </p>
          <Link to="/register" className="btn btn-primary">
            Join Now
          </Link>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold">Explore Our Shoe Categories</h2>
          <p className="text-center py-4">
            From running shoes to formal wear, find the perfect pair for any
            occasion.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className="card bg-base-100 shadow-xl hover:scale-105 transition-transform duration-200"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <figure>
                <img
                  src={category.image || PlaceHolderImage}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                  onError={handleImageError}
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{category.name}</h3>
                <p>{category.description}</p>
                <div className="card-actions justify-end">
                  <Link to={category.link} className="btn btn-primary">
                    Explore
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <FooterStore />
    </>
  );
};

export default LandingPage;
