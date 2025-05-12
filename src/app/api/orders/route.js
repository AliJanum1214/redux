// src/app/api/orders/route.js
import mongoose from "mongoose";
import { Orders } from "@/models/Orders";
import { connectToDatabase } from "@/libs/db";

export async function POST(req) {
  await connectToDatabase();

  try {
    const orderData = await req.json();
    // Validate required fields
    if (!orderData.orderId || !orderData.email || !orderData.items) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400 }
      );
    }
    const order = new Orders(orderData);
    await order.save();
    return new Response(JSON.stringify({ success: true, order }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error saving order:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await connectToDatabase();

  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID required" }),
        { status: 400 }
      );
    }
    const orders = await Orders.find({ userId }).sort({ date: -1 });
    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
