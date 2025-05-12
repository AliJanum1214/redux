// pages/api/send-order-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { orderId, trackingId, name, email, address, items, total, date } =
    req.body;

  // Validate request body
  if (!email || !items || !orderId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shampi.goli@gmail.com",
      pass: "@Admin1122", // Use App Password from Gmail
    },
  });

  // Format order items for email
  const itemsHtml = items
    .map(
      (item) =>
        `<li>${item.size} - $${item.price.toFixed(2)} x ${item.quantity} = $${(
          item.price * item.quantity
        ).toFixed(2)}</li>`
    )
    .join("");

  // Email content
  const mailOptions = {
    from: '"Your Store Name" <@gmail.com>',
    to: email,
    subject: `Order Confirmation - Order #${orderId}`,
    html: `
      <h2>Thank You for Your Order!</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Tracking ID:</strong> ${trackingId}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Shipping Address:</strong> ${address}</p>
      <p><strong>Order Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <h3>Order Items:</h3>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <p>We will notify you when your order ships.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
}
