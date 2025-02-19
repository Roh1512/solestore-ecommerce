import { useCurrentAuthState } from "@/app/useCurrentState";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutButton = ({ amount }: { amount: number }) => {
  const { accessToken } = useCurrentAuthState();
  const openRazorpayCheckout = async () => {
    try {
      // Step 1: Create an order on the backend using Fetch.
      const orderRes = await fetch("/api/order/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount, // rupees
          receipt: "order_rcptid_11",
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderRes.json();
      const { id: order_id, amount: orderAmount, currency } = orderData;

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
          console.log("Payment Successful", response);
          // Optionally, verify the payment on the backend using Fetch.
          const verifyRes = await fetch("/api/order/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) {
            console.error("Payment verification failed");
          } else {
            console.log("Payment verified successfully");
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

  return <button onClick={openRazorpayCheckout}>Pay Now</button>;
};

export default CheckoutButton;
