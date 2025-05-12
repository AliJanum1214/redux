// src/app/checkout/page.js
"use client";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateQuantity, clearCart } from "@/redux/cartSlice";
import emailjs from "@emailjs/browser";

export default function Checkout() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [pastOrders, setPastOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  // Pre-fill form with session data
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  // Fetch past orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/orders", {
            headers: { "user-id": session.user.id },
          });
          if (!res.ok) {
            throw new Error(`Failed to fetch orders: ${res.statusText}`);
          }
          const orders = await res.json();
          setPastOrders(orders);
        } catch (error) {
          console.error("Error fetching orders:", error.message);
        }
      }
    };
    fetchOrders();
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (index, change) => {
    dispatch(updateQuantity({ index, change }));
  };

  const sendOrderEmail = async (orderDetails) => {
    try {
      // Validate email
      if (
        !orderDetails.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderDetails.email)
      ) {
        throw new Error("Invalid email address");
      }

      // Format items for email
      const itemsHtml = orderDetails.items
        .map(
          (item) =>
            `<li>${item.size} - $${item.price.toFixed(2)} x ${
              item.quantity
            } = $${(item.price * item.quantity).toFixed(2)}</li>`
        )
        .join("");

      // Prepare EmailJS parameters
      const templateParams = {
        to_email: orderDetails.email,
        from_email: "alijawad1109@gmail.com",
        orderId: orderDetails.orderId,
        trackingId: orderDetails.trackingId,
        name: orderDetails.name,
        address: orderDetails.address,
        orderDate: new Date(orderDetails.date).toLocaleDateString(),
        itemsHtml,
        total: orderDetails.total.toFixed(2),
      };

      // Log parameters for debugging
      console.log("EmailJS parameters:", templateParams);

      // Verify environment variables
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const userId = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;
      console.log("EmailJS config:", { serviceId, templateId, userId });
      if (!serviceId || !templateId || !userId) {
        throw new Error(
          `Missing EmailJS configuration: serviceId=${serviceId}, templateId=${templateId}, userId=${userId}`
        );
      }

      // Initialize EmailJS with user ID
      emailjs.init(userId);

      // Send email using EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );
      console.log("Email sent successfully:", response.status, response.text);
      return true;
    } catch (error) {
      console.error("Email sending error:", error);
      console.error("Error details:", error.text || error.message || error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderId = Math.random().toString(36).substr(2, 9);
    const trackingId = `TRK-${Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase()}`;
    const orderDetails = {
      orderId,
      trackingId,
      status: "Processing",
      name: formData.name,
      email: formData.email,
      address: formData.address,
      items: cartItems,
      total,
      date: new Date().toISOString(),
      userId: session?.user?.id || null,
    };

    try {
      // Save order to MongoDB via API
      console.log("Saving order details:", orderDetails);
      const saveResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        console.error("Save order response:", saveData);
        throw new Error(saveData.message || "Failed to save order");
      }

      // Send confirmation email
      const emailSent = await sendOrderEmail(orderDetails);
      if (!emailSent) {
        alert("Order placed, but failed to send confirmation email.");
      } else {
        console.log("Order and email processed successfully");
      }

      // Clear cart
      dispatch(clearCart());

      // Redirect to confirmation
      router.push("/order-confirmation");
    } catch (error) {
      console.error("Order submission error:", error.message);
      alert(`An error occurred while placing the order: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (status === "loading" || !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) {
    return <div className="text-center my-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-gray-200 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Cart Summary */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Order Summary
          </h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {cartItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded border"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-700">
                        {item.size} - ${item.price} x {item.quantity}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleQuantityChange(index, -1)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded disabled:bg-gray-200"
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
                      </div>
                    </div>
                    <span className="text-gray-700 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-lg font-semibold text-gray-800">
                Total: ${total.toFixed(2)}
              </div>
            </>
          )}
        </div>

        {/* Checkout Form */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Shipping Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-gray-700 font-medium mb-1"
              >
                Shipping Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition disabled:bg-gray-400"
              disabled={cartItems.length === 0 || isLoading}
            >
              {isLoading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>

      {/* Past Orders */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Your Past Orders
        </h2>
        {pastOrders.length === 0 ? (
          <p className="text-gray-500">No past orders.</p>
        ) : (
          <ul className="space-y-4">
            {pastOrders.map((order) => (
              <li key={order.orderId} className="bg-gray-50 p-4 rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800 font-medium">
                      Order ID: {order.orderId}
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Total: ${order.total.toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      Tracking ID: {order.trackingId}
                    </p>
                    <p className="text-gray-600">Status: {order.status}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-600">Items:</p>
                  <ul className="ml-4 list-disc">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-gray-600">
                        {item.size} - ${item.price} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
