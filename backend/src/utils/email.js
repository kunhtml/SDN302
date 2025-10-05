const logger = require("../config/logger");

// Mock email sending function (logs to console instead of sending real emails)
// In production, you can integrate with a real email service if needed
const sendEmail = async (options) => {
  try {
    // Log email details instead of actually sending
    logger.info("=== EMAIL NOTIFICATION ===");
    logger.info(`To: ${options.to}`);
    logger.info(`Subject: ${options.subject}`);
    logger.info(`Content: ${options.text || "HTML email"}`);
    logger.info("=========================");

    // Simulate successful email send
    console.log("\n📧 Email Notification:");
    console.log(`   To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log("   Status: ✅ Logged (not sent)\n");

    return { success: true, messageId: `mock-${Date.now()}` };
  } catch (error) {
    logger.error(`Email log error: ${error.message}`);
    throw new Error("Email notification failed");
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (user, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation</h2>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for your order! Your order has been confirmed.</p>
      <h3>Order Details:</h3>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
      <p>You can track your order status in your account dashboard.</p>
      <p>Best regards,<br>eBay Clone Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html,
  });
};

// Send order status update email
const sendOrderStatusUpdate = async (user, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Status Update</h2>
      <p>Hi ${user.firstName},</p>
      <p>Your order status has been updated.</p>
      <h3>Order Details:</h3>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
      ${
        order.trackingNumber
          ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>`
          : ""
      }
      <p>You can track your order in your account dashboard.</p>
      <p>Best regards,<br>eBay Clone Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Update - ${order.orderNumber}`,
    html,
  });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to eBay Clone!</h2>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for registering with us. We're excited to have you on board!</p>
      <p>Start exploring thousands of products and enjoy a seamless shopping experience.</p>
      <p>Best regards,<br>eBay Clone Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to eBay Clone!",
    html,
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendWelcomeEmail,
};
