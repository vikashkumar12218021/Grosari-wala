import React, { useContext } from "react";
import toast from "react-hot-toast";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";  
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { AppContext } from "./context/AppContext";
import MyOrders from "./pages/MyOrders";
import Auth from "./models/Auth";
import ProductCategory from "./pages/ProductCategory";
import Footer from "./components/Fotter";
import { Toaster } from "react-hot-toast";
import AddAddress from "./pages/AddAddress";
import SellerLayout from "./pages/seller/SellerLayout";
import SellerLogin from "./components/seller/SellerLogin";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import Loading from "./pages/Loading";

const App = () => {
  const { isSeller, showUserLogin } = useContext(AppContext);
  const isSellerPath = useLocation().pathname.includes("seller");

  return (
    <div className="text-default min-h-screen">
      {/* Show navbar only if not in seller path */}
      {isSellerPath ? null : <Navbar />}

      {/* Show login modal if required */}
      {showUserLogin ? <Auth /> : null}

      <Toaster />

      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        <Routes>
          {/* User routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:category/:id" element={<ProductDetails />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/loader" element={<Loading />} />
          <Route path="/add-address" element={<AddAddress />} />

          {/* Seller routes */}
          {/* Seller routes */}
<Route
  path="/seller"
  element={isSeller ? <SellerLayout /> : <SellerLogin />}
>
  <Route path="add-product" element={isSeller ? <AddProduct /> : null} />
  <Route path="product-list" element={isSeller ? <ProductList /> : null} />
  <Route path="orders" element={isSeller ? <Orders /> : null} />
</Route>

        </Routes>
      </div>

      {/* Show footer only if not in seller path */}
      {isSellerPath ? null : <Footer />}
    </div>
  );
};

export default App;
