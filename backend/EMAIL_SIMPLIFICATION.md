# Simplified Configuration - Email System

## Thay đổi quan trọng

Project đã được đơn giản hóa bằng cách **bỏ hệ thống email Nodemailer**.

### ❌ Đã xóa:

- Nodemailer dependency
- Email configuration (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD)
- SMTP server setup

### ✅ Hiện tại:

- Email/Password được lưu trực tiếp trong MongoDB (User model)
- Email notifications được log ra console thay vì gửi thật
- Không cần cấu hình SMTP server

## Lợi ích:

1. **Đơn giản hơn cho Development**

   - Không cần setup SMTP server
   - Không cần App Password của Gmail
   - Không lo bị Gmail block

2. **Dễ dàng test**

   - Email notifications hiện trong console log
   - Không phải check email thật
   - Faster development cycle

3. **Ít dependencies**
   - Giảm package size
   - Ít lỗi tiềm ẩn
   - Deploy nhanh hơn

## Cách hoạt động hiện tại:

### 1. User Registration/Login

```javascript
// User email/password lưu trong MongoDB
const user = {
  email: "user@example.com",
  password: "hashed_password", // bcrypt
};
```

### 2. Email Notifications

```javascript
// Thay vì gửi email thật, system sẽ log:
console.log("📧 Email Notification:");
console.log("   To: user@example.com");
console.log("   Subject: Order Confirmation");
console.log("   Status: ✅ Logged (not sent)");
```

### 3. Xem Notifications

- Check console/terminal output
- Check logs trong `backend/logs/combined.log`

## File đã thay đổi:

### 1. `backend/.env.example`

```env
# Đã xóa:
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
# EMAIL_FROM=noreply@ebay-clone.com
```

### 2. `backend/src/utils/email.js`

```javascript
// Trước: Dùng nodemailer gửi email thật
// Sau: Log email ra console

const sendEmail = async (options) => {
  logger.info("=== EMAIL NOTIFICATION ===");
  logger.info(`To: ${options.to}`);
  logger.info(`Subject: ${options.subject}`);
  console.log("📧 Email Notification: Logged");
};
```

### 3. `backend/package.json`

```json
// Đã xóa dependency:
// "nodemailer": "^6.9.7"
```

## Nếu cần Email thật trong Production:

Có thể tích hợp các service sau:

1. **SendGrid** - Free tier 100 emails/day
2. **Mailgun** - Free tier
3. **AWS SES** - Very cheap
4. **Resend** - Modern API

Example với SendGrid:

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: "user@example.com",
  from: "noreply@yourapp.com",
  subject: "Order Confirmation",
  html: "<strong>Thank you for your order!</strong>",
};

await sgMail.send(msg);
```

## Setup Instructions:

### Development (Current):

```bash
# Không cần setup gì cả!
# Chỉ cần MongoDB và JWT_SECRET
```

### Production (If needed):

```bash
# 1. Choose email service (SendGrid/Mailgun/etc)
# 2. npm install service-package
# 3. Add API key to .env
# 4. Update email.js to use service
```

## Environment Variables cần thiết:

```env
# Database
MONGO_URI=mongodb://localhost:27017/ebay-clone

# JWT (Authentication)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Không cần email config nữa!** 🎉
