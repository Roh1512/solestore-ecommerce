import PlaceHolderImage from "@/assets/placeholder_image.jpg";

export const default_profile_img =
  "https://res.cloudinary.com/rohithashok/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1737112833/solestore_ecommerce_app/static_files/avatar_b3fhzc.png";

export const profile_page_banner =
  "https://res.cloudinary.com/rohithashok/image/upload/c_fill,g_auto,w_970/b_rgb:000000,e_gradient_fade,y_-0.50/c_scale,co_rgb:ffffff,fl_relative,l_text:montserrat_25_style_light_align_center:Shop%20Now,w_0.5,y_0.18/v1737121069/solestore_ecommerce_app/static_files/pexels-atahandemir-13561528_aj4t8w.jpg";

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  const imgElement = e.currentTarget;
  imgElement.src = PlaceHolderImage;
};
