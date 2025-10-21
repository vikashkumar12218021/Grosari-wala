import express from "express";
import { updateCart } from "../controllers/cart.controller.js";
import authUser from "../middlewares/authUser.js"; // ❌ you had `{authUser}` → fix

const router = express.Router();

// update cart
router.post("/update", authUser, updateCart);

export default router;
