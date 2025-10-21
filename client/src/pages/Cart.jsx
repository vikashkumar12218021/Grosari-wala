import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
// import { loadStripe } from "@stripe/stripe-js";

const Cart = () => {
  const {
    products,
    navigate,
    cartCount,
    totalCartAmount,
    cartItems,
    removeFromCart,
    updateCartItem,
    axios,
    user,
    setCartItems,
  } = useContext(AppContext);

  const [cartArray, setCartArray] = useState([]);
  const [address, setAddress] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  // Build cart array
  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const foundProduct = products.find((p) => p._id === key);
      if (foundProduct) {
        tempArray.push({ ...foundProduct, quantity: cartItems[key] });
      }
    }
    setCartArray(tempArray);
  };

  // Fetch addresses
  const getAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddress(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (user) {
      getAddress();
    }
  }, [user]);

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  // Place order
  const placeOrder = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      const orderPayload = {
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipcode: selectedAddress.zipcode,
          country: selectedAddress.country,
        },
      };

      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", orderPayload);
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/order/stripe", orderPayload);
        if (data.success && data.url) {
          // Option 1: direct redirect if backend sends full session URL
          window.location.replace(data.url);

          // Option 2 (if backend sends sessionId):
          // const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
          // await stripe.redirectToCheckout({ sessionId: data.id });
        } else {
          toast.error(data.message || "Stripe order failed");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const subtotal = totalCartAmount(products);
  const tax = (subtotal * 0.02).toFixed(2);
  const total = (subtotal + parseFloat(tax)).toFixed(2);

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto">
      {/* Cart Section */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-indigo-500">{cartCount()} items</span>
        </h1>

        {/* Header Row */}
        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {/* Cart Items */}
        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-700 items-center text-sm md:text-base font-medium pt-3 border-b border-gray-200 pb-3"
          >
            {/* Product Info */}
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(
                    `/product/${product.category.toLowerCase()}/${product._id}`
                  );
                  window.scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={`http://localhost:5000/images/${product.image[0]}`}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>
                    Weight: <span>{product.weight || "N/A"}</span>
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="mr-2">Qty:</p>
                    <select
                      className="outline-none border border-gray-300 rounded px-2 py-1"
                      value={cartItems[product._id]}
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                    >
                      {Array.from(
                        {
                          length:
                            cartItems[product._id] > 9
                              ? cartItems[product._id]
                              : 9,
                        },
                        (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <p className="text-center">
              ${product.offerPrice * product.quantity}
            </p>

            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(product._id)}
              className="cursor-pointer mx-auto"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-red-500 hover:text-red-600"
              >
                <path
                  d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Continue Shopping */}
        <button
          onClick={() => {
            navigate("/products");
            window.scrollTo(0, 0);
          }}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium hover:underline"
        >
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
            <path
              d="M14.09 5.5H1M6.143 10 1 5.5 6.143 1"
              stroke="#615fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Continue Shopping
        </button>
      </div>

      {/* Order Summary */}
      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70 rounded-lg">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        {/* Delivery Address */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500 text-sm">
              {selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                : "No Address Found"}
            </p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-indigo-500 hover:underline cursor-pointer"
            >
              Change
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10 rounded shadow">
                {address.map((addr, i) => (
                  <p
                    key={i}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setShowAddress(false);
                    }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {addr.street}, {addr.city}, {addr.state}, {addr.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate("/add-address")}
                  className="text-indigo-500 text-center cursor-pointer p-2 hover:bg-indigo-500/10"
                >
                  + Add new address
                </p>
              </div>
            )}
          </div>

          {/* Payment */}
          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none rounded"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        {/* Price Details */}
        <div className="text-gray-600 mt-4 space-y-2 text-sm">
          <p className="flex justify-between">
            <span>Price</span>
            <span>${subtotal}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>${tax}</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>${total}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full py-3 mt-6 cursor-pointer bg-indigo-500 text-white font-medium rounded hover:bg-indigo-600 transition"
        >
          {paymentOption === "COD" ? "Place Order" : "Pay Now"}
        </button>
      </div>
    </div>
  ) : null;
};

export default Cart;
