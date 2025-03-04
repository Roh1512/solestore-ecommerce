import { closeModal, openModal } from "@/utils/modal_utils";
import { Search } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertText from "../ErrorElements/AlertText";

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

const SearchOrderById = () => {
  const modalId = "searchOrderByIdModal";
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const close = useCallback(() => {
    closeModal(modalId);
  }, []);
  const open = useCallback(() => {
    openModal(modalId);
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setOrderId(e.target.value),
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidObjectId(orderId)) {
        setErrorMessage("Invalid Order Id");
        return;
      }
      const id = orderId;
      setErrorMessage(null);
      setOrderId("");
      navigate(`/admin/orders/${id}`);
      close();
    },
    [close, navigate, orderId]
  );

  return (
    <>
      <button
        className="btn bg-base-300 text-base-content text-lg flex items-center gap-2"
        onClick={open}
        aria-label="Open filter options"
      >
        <Search aria-hidden="true" />
        <span>Search Order</span>
      </button>

      <dialog
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
        role="dialog"
        aria-labelledby="search order"
      >
        <div className="modal-box">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
            aria-label="search-order-modal-title"
          >
            ✕
          </button>
          <h3 id="search-order-modal-title" className="font-bold text-lg mb-4">
            Search Order
          </h3>

          <form onSubmit={handleSubmit} className="mb-2">
            <fieldset className="flex w-full gap-1">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter order Id"
                value={orderId}
                onChange={handleInput}
              />
              <button
                className="btn btn-neutral"
                aria-label="Search Order button"
              >
                <Search aria-hidden />
              </button>
            </fieldset>
          </form>
          {errorMessage && <AlertText message={errorMessage} />}
        </div>
      </dialog>
    </>
  );
};

export default SearchOrderById;
