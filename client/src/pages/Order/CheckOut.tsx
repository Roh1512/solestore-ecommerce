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

  if (isCartLoading || isProfileLoading) {
    return <PageLoading />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cart Items Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Your Cart Items</h2>
          <div className="divider"></div>
          {cartData?.items.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 mb-3">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">Size: {item.size}</p>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4">
            <p className="text-lg font-medium">
              Total Price:{" "}
              <span className="text-primary">{cartData?.total_price}</span>
            </p>
            <p className="text-lg font-medium">{cartData?.total_count} Items</p>
          </div>
        </div>
      </div>

      {/* Delivery Details Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Delivery Details</h2>
          <p className="text-gray-600 mb-4">
            Provide the address and phone number for your order.
          </p>
          <fieldset disabled={confirmDetails} className="space-y-4">
            <div className="form-control">
              <label htmlFor="address" className="label">
                <span className="label-text">Address</span>
              </label>
              <textarea
                value={orderDetails.address}
                placeholder="Delivery Address"
                name="address"
                onChange={handleChange}
                className="textarea textarea-bordered"
              />
            </div>
            <div className="form-control">
              <label htmlFor="phone" className="label">
                <span className="label-text flex items-center gap-2">
                  <PhoneCallIcon className="w-5 h-5" />
                  Phone Number
                </span>
              </label>
              <input
                type="tel"
                placeholder="Phone Number"
                disabled={confirmDetails}
                name="phone"
                value={orderDetails.phone}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>
          </fieldset>
          <div className="card-actions justify-end mt-4">
            <button onClick={toggleConfirm} className="btn btn-outline">
              {confirmDetails
                ? "Edit Delivery Details"
                : "Confirm Delivery Details"}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {confirmDetails ? (
        <div className="flex justify-center">
          <CheckoutButton orderDetails={orderDetails} />
        </div>
      ) : (
        <br />
      )}
    </div>
  );
};

export default CheckOut;
