import { OrderCreateRequest } from "@/client";
import CheckoutButton from "@/components/Buttons/CheckOutButton";
import PageLoading from "@/components/Loading/PageLoading";
import { useGetCartQuery } from "@/features/cartApiSlice";
import { useGetProfileQuery } from "@/features/userProfileApiSlice";
import { PhoneCallIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const CheckOut = () => {
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery({
    page: 1,
  });
  const { data: profileData, isLoading: isProfileLoading } =
    useGetProfileQuery();

  const [confirmDetails, setConfirmDetails] = useState<boolean>(false);

  const [orderDetails, setOrderDetails] = useState<OrderCreateRequest>({
    address: profileData?.address || "",
    phone: profileData?.phone || "",
  });

  console.log(profileData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({ ...prev, [name]: value }));
  };

  const toggleConfirm = useCallback(() => {
    setConfirmDetails((prev) => !prev);
  }, []);

  useEffect(() => {
    if (profileData) {
      setOrderDetails({
        address: profileData.address || "",
        phone: profileData.phone || "",
      });
    }
  }, [profileData]);

  console.log(cartData?.items);

  if (isCartLoading || isProfileLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <div>
        <h3>Items</h3>
        {cartData?.items.map((item) => (
          <div key={item.id}>
            <h4>{item.title}</h4>
            <p>Size: {item.size}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>
      <div>
        <p>Total: {cartData?.total_price}</p>
        <p>{cartData?.total_count} pieces of items.</p>
      </div>
      <h3>Delivery Details</h3>
      <p>Provide the address and phone number for the order</p>
      <fieldset
        disabled={confirmDetails}
        className="flex flex-col items-center justify-center max-w-lg mx-auto gap-3"
      >
        <div className="w-full flex flex-col items-start">
          <label htmlFor="address">Address</label>
          <textarea
            value={orderDetails.address}
            placeholder="Delivery Address"
            name="address"
            onChange={handleChange}
            className="textarea textarea-bordered textarea-lg w-full"
          />
        </div>
        <label className="input input-bordered flex items-center w-full gap-2">
          <PhoneCallIcon />
          <input
            type="tel"
            className="grow"
            placeholder="Phone Number"
            disabled={confirmDetails}
            name="phone"
            value={orderDetails.phone}
            onChange={handleChange}
          />
        </label>
      </fieldset>
      <button onClick={toggleConfirm} className="btn">
        {confirmDetails
          ? "Change Address and Phone Number"
          : "Confirm Address and Phone"}
      </button>

      <CheckoutButton orderDetails={orderDetails} />
    </>
  );
};

export default CheckOut;
