import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  orderId: String,
  trackingId: String,
  status: String,
  name: String,
  email: String,
  address: String,
  items: [{ size: String, price: Number, quantity: Number }],
  total: Number,
  date: Date,
  userId: String,
});
export const Orders =
  mongoose.models.Orders || mongoose.model("Orders", orderSchema);
