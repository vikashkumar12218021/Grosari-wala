import jwt from "jsonwebtoken";

export const authSeller = (req, res, next) => {
  try {
    const { sellerToken } = req.cookies;

    if (!sellerToken) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);

    if (decoded.email === process.env.SELLER_EMAIL) {
      return next();
    }

    // If email doesn't match, explicitly block
    return res.status(403).json({ message: "Forbidden: Not a seller", success: false });
    
  } catch (error) {
    console.log("Authentication error:", error.message);
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};
