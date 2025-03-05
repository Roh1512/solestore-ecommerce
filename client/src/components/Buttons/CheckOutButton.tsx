import { OrderCreateRequest } from "@/client";
import {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} from "@/features/orderApiSlice";
import { toast } from "react-toastify";
import ButtonLoading from "../Loading/ButtonLoading";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutButton = ({
  orderDetails,
}: {
  orderDetails: OrderCreateRequest;
}) => {
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const openRazorpayCheckout = async () => {
    try {
      if (!orderDetails.address || !orderDetails.phone) {
        toast.error("Please provide address and phone number.");
        return;
      }

      const orderData = await createOrder({
        address: orderDetails.address,
        phone: orderDetails.phone,
      }).unwrap();
      const { id: order_id, amount: orderAmount, currency } = orderData;

      //console.log("OrderData: ", orderData);

      // Step 2: Configure options for Razorpay Checkout.
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ Use Vite env variable
        amount: orderAmount, // in paise
        currency,
        name: "Your Ecommerce App",
        description: "Test Transaction",
        order_id: order_id,
        handler: async (response: any) => {
          // Handle the payment success response from Razorpay
          //console.log("Payment Successful", response);
          // Optionally, verify the payment on the backend using Fetch.

          try {
            const verificationResponse = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();

            console.log("Payment verified successfully", verificationResponse);
          } catch (error) {
            console.error(error);
          }
          // Update UI or notify the user as needed.
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Some Address",
        },
        theme: {
          color: "#3399cc",
        },
      };

      // Open the Razorpay Checkout window.
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error in payment", error);
    }
  };

  return (
    <button
      className="btn btn-success"
      onClick={openRazorpayCheckout}
      disabled={isCreatingOrder}
    >
      {isCreatingOrder ? (
        <ButtonLoading text="Payment Processing" />
      ) : (
        "Continue Payment"
      )}
    </button>
  );
};

export default CheckoutButton;
