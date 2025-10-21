import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import stripe from "stripe";

// Place order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, shippingAddress } = req.body;  // ✅ renamed to shippingAddress

    if (!shippingAddress || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items and shipping address are required", success: false });
    }

    // calculate amount using items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add tax charge 2%
    amount += Math.floor((amount * 2) / 100);

    await Order.create({
      userId,
      items,
      shippingAddress,  // ✅ save shippingAddress
      amount,
      paymentType: "COD",
      isPaid: false,
    });

    res
      .status(201)
      .json({ message: "Order placed successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Place order Stripe: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user;
    const { items, shippingAddress } = req.body;  // ✅ renamed
    const { origin } = req.headers;

    if (!shippingAddress || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items and shipping address are required", success: false });
    }

    // calculate amount using items
    let productData = [];
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add tax charge 2%
    amount += Math.floor((amount * 2) / 100);

    const order = await Order.create({
      userId,
      items,
      shippingAddress,   // ✅ save shippingAddress
      amount,
      paymentType: "Online",
      isPaid: false, // will be updated after successful Stripe payment
    });

    // stripe gateway initialization
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    res.status(201).json({
      message: "Order placed successfully",
      success: true,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Order details for individual user : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({ userId })
      .populate("items.product")   // ✅ removed "address"
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all orders for admin/seller : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")   // ✅ removed "address"
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
