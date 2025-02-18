import { CartItemResponse } from "@/client";
import { memo, useCallback } from "react";
import ButtonLoading from "../Loading/ButtonLoading";
import {
  useChangeQuantityMutation,
  useRemoveFromCartMutation,
} from "@/features/cartApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { toast } from "react-toastify";

type Props = {
  item: CartItemResponse;
};

const CartItemCard = memo(({ item }: Props) => {
  const total = item.price * item.quantity;

  const [handleChangeQty] = useChangeQuantityMutation();
  const [handleRemoveFromCart, { isLoading: isRemoveLoading }] =
    useRemoveFromCartMutation();

  const handleQtyDecrease = useCallback(async () => {
    try {
      await handleChangeQty({
        cartId: item.id,
        body: {
          product_id: item.product_id,
          quantity: -1,
          size: item.size,
        },
      }).unwrap();
    } catch (error) {
      console.error(error);
      if (isFieldValidationError(error)) {
        const errors = getValidationErrors(error);
        toast.error(errors[0]?.message);
      }
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage as string);
      } else {
        toast.error("Error changing quantity");
      }
    }
  }, [handleChangeQty, item.id, item.product_id, item.size]);
  const handleQtyIncrease = useCallback(async () => {
    try {
      await handleChangeQty({
        cartId: item.id,
        body: {
          product_id: item.product_id,
          quantity: 1,
          size: item.size,
        },
      }).unwrap();
    } catch (error) {
      if (isFieldValidationError(error)) {
        const errors = getValidationErrors(error);
        toast.error(errors[0]?.message);
      }
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage as string);
      } else {
        toast.error("Error changing quantity");
      }
    }
  }, [handleChangeQty, item.id, item.product_id, item.size]);

  const removeFromCart = useCallback(async () => {
    try {
      await handleRemoveFromCart({
        cartId: item.id,
      }).unwrap();
    } catch (error) {
      console.error(error);
      if (isFieldValidationError(error)) {
        const errors = getValidationErrors(error);
        toast.error(errors[0]?.message);
      }
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage as string);
      } else {
        toast.error("Error removing item from cart");
      }
    }
  }, [handleRemoveFromCart, item.id]);

  return (
    <div className="card shadow-xl bg-base-200 mb-6 md:flex md:flex-row">
      <figure className="w-full md:w-1/3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="object-cover w-full h-48 md:h-full rounded-l-lg"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-l-lg">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </figure>
      <div className="card-body w-full md:w-2/3 p-2 items-center justify-center">
        <h2 className="card-title text-2xl text-primary">{item.title}</h2>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="text-sm">
            <p>
              <span className="font-semibold">Price:</span> $
              {item.price.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Size:</span> {item.size}
            </p>
          </div>
          <div className="text-sm">
            <p>
              <span className="font-semibold">Total:</span> ${total.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          <div className="btn-group">
            <button onClick={handleQtyDecrease} className="btn p-2 btn-active">
              -
            </button>
            <div className="btn ">Quantity {item.quantity}</div>
            <button onClick={handleQtyIncrease} className="btn btn-active p-2">
              +
            </button>
          </div>

          <button
            className="btn btn-error mt-2 sm:mt-0"
            onClick={removeFromCart}
            disabled={isRemoveLoading}
          >
            {isRemoveLoading ? <ButtonLoading text="Removing" /> : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default CartItemCard;
