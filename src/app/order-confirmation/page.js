export default function OrderConfirmation() {
  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-gray-200 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed</h1>
      <p className="text-gray-700">
        Thank you for your order! You'll receive a confirmation email with a PDF
        and tracking details soon.
      </p>
    </div>
  );
}
