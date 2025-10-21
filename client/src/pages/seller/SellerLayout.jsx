import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import assets from "../../assets/assets";
import { NavLink, Outlet } from "react-router-dom";

const SellerLayout = () => {
  const { isSeller, setIsSeller, navigate } = useContext(AppContext);

  const sidebarLinks = [
    { name: "Add Product", path: "/seller/add-product", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
  ];

  return (
    <>
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
        <h1 className="text-2xl font-semibold text-orange-600">Grocery App</h1>
        <div className="flex items-center gap-5 text-gray-600">
          <p>Hi! Admin</p>
          <button
            onClick={() => {
              setIsSeller(false);
              navigate("/");
            }}
            className="border rounded-full text-sm px-4 py-1 hover:bg-gray-100 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex">
        <div className="md:w-64 w-16 border-r h-screen text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
        {sidebarLinks.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === "/seller"}
            className={({ isActive }) =>
              `flex items-center py-3 px-4 gap-3 transition-all duration-200 
               ${
                 isActive
                   ? "border-r-4 md:border-r-[6px] bg-indigo-500 border-indigo-500 text-white"
                   : "hover:bg-gray-100/90 border-white text-gray-700"
               }`
            }
          >
            <img src={item.icon} alt="" className="w-7 h-7" />
            <p className="md:block hidden">{item.name}</p>
          </NavLink>
        ))}
      </div>
      <Outlet/>
      </div>
    </>
  );
};

export default SellerLayout;
