"use client";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
  loadCartFromStorage,
  updateQuantity,
} from "../redux/cartSlice";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Item() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  const sizes = [
    { size: "Small", price: 10 },
    { size: "Medium", price: 15 },
    { size: "Large", price: 20 },
  ];

  const handleAdd = (item) => {
    if (!session) {
      alert("Please log in to add items to the cart.");
      return;
    }
    dispatch(addToCart(item));
  };

  const handleQuantityChange = (index, change) => {
    dispatch(updateQuantity({ index, change }));
  };

  const handleCheckout = () => {
    if (!session) {
      alert("Please log in to proceed to checkout.");
      return;
    }
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    // Redirect to a checkout page or process payment (placeholder)
    alert(`Proceeding to checkout. Total: $${total.toFixed(2)}`);
    router.push("/checkout"); // Adjust to your checkout route
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-gray-200 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Sharbat-e-Sandal
      </h1>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <img
          src="https://aftabqarshi.com.pk/cdn/shop/files/sharbat-e-sandal-2_1.jpg?v=1716208770"
          alt="Sharbat-e-Sandal"
          className="w-full md:w-1/2 h-auto rounded-lg object-cover"
        />

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Choose Size
          </h2>
          {sizes.map((item) => (
            <div
              key={item.size}
              className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded mb-2"
            >
              <span className="text-gray-800 font-medium">
                {item.size} - ${item.price}
              </span>
              <button
                onClick={() => handleAdd(item)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded transition"
              >
                Add to Cart
              </button>
            </div>
          ))}

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cart Items
            </h3>
            {cartItems.length === 0 ? (
              <p className="text-gray-500">No items yet.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {cartItems.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded border"
                    >
                      <span className="text-gray-700">
                        {item.size} - ${item.price} x {item.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(index, -1)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(index, 1)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCart(index))}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total: $
                    {cartItems
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                  <button
                    onClick={handleCheckout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
                    disabled={cartItems.length === 0}
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
