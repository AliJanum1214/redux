// pages/api/send-order-email.js
import emailjs from "@emailjs/browser";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { orderId, email, items, total, date } = req.body;

  // Validate request body
  if (!email || !items || !orderId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Format order items for email
  const itemsHtml = items
    .map(
      (item) =>
        `<li>${item.size} - $${item.price.toFixed(2)} x ${item.quantity} = $${(
          item.price * item.quantity
        ).toFixed(2)}</li>`
    )
    .join("");

  // Prepare EmailJS parameters
  const templateParams = {
    to_email: email,
    orderId,
    orderDate: new Date(date).toLocaleDateString(),
    itemsHtml,
    total: total.toFixed(2),
    address: "Shadbagh", // Hardcoded address
  };

  try {
    // Hardcoded EmailJS IDs
    const serviceId = "service_2huyn1k";
    const templateId = "template_cc2gwm9";
    const userId = "UPOaZx461aH81q0sO"; // Use environment variable

    if (!userId) {
      throw new Error("Missing EmailJS user ID");
    }

    // Initialize EmailJS with user ID
    emailjs.init(userId);

    // Send email using EmailJS
    const response = await emailjs.send(serviceId, templateId, templateParams);
    return res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message || error.text || "Unknown error",
    });
  }
}
