# Database Scripts

## Seed Database Script

Script để khởi tạo MongoDB database với dữ liệu mẫu.

### Cách sử dụng:

#### Option 1: Sử dụng Batch File (Windows - Recommended)

```bash
# Từ thư mục root của project
seed-db.bat
```

#### Option 2: Sử dụng npm script

```bash
cd backend
npm run seed
```

#### Option 3: Chạy trực tiếp

```bash
cd backend
node src/scripts/seedDatabase.js
```

### Dữ liệu được tạo:

#### 👥 Users (5 users)

- **Admin Account**

  - Email: admin@ebay.com
  - Password: admin123
  - Role: admin

- **Seller Accounts (2)**

  - seller1@ebay.com / seller123 (Tech Paradise Store)
  - seller2@ebay.com / seller123 (Fashion Hub Store)

- **Buyer Accounts (2)**
  - buyer1@ebay.com / buyer123
  - buyer2@ebay.com / buyer123

#### 📁 Categories (10 categories)

- Electronics
- Fashion
- Home & Garden
- Sports & Outdoors
- Books & Media
- Toys & Games
- Beauty & Health
- Automotive
- Food & Beverages
- Jewelry

#### 🏪 Stores (2 stores)

- Tech Paradise (Seller 1)
- Fashion Hub (Seller 2)

#### 📦 Products (8 products)

- iPhone 15 Pro Max - $1299 (Featured)
- Samsung Galaxy S24 Ultra - $1199 (Featured)
- MacBook Pro 16" M3 - $2499 (Featured)
- Nike Air Max 2024 - $129
- Adidas Ultraboost - $149
- Sony WH-1000XM5 Headphones - $399 (Featured)
- Vintage Camera Canon AE-1 - $450 (Auction - 7 days)
- Rolex Submariner Replica - $200 (Auction - 3 days)

#### 📊 Additional Data

- **Inventory**: Stock tracking cho tất cả products
- **Coupons**: 3 mã giảm giá (WELCOME10, FLASH20, SAVE50)
- **Reviews**: 3 đánh giá sản phẩm
- **Bids**: Đấu giá cho 2 sản phẩm auction
- **Feedback**: Seller reputation data

### Yêu cầu:

1. **MongoDB phải đang chạy**

   ```bash
   # Kiểm tra MongoDB đang chạy
   mongosh

   # Hoặc start MongoDB service
   net start MongoDB
   ```

2. **Environment variables**

   - File `.env` phải tồn tại trong `backend/`
   - Cấu hình `MONGODB_URI` đúng (mặc định: mongodb://localhost:27017/ebay-clone)

3. **Dependencies đã cài đặt**
   ```bash
   cd backend
   npm install
   ```

### Lưu ý:

⚠️ **Script này sẽ XÓA toàn bộ dữ liệu hiện tại trong database trước khi tạo mới!**

- Chỉ sử dụng trong môi trường development
- Không chạy script này trên production database
- Backup dữ liệu quan trọng trước khi chạy

### Troubleshooting:

#### Lỗi: MongoDB Connection Error

```
❌ MongoDB Connection Error: connect ECONNREFUSED
```

**Giải pháp**:

- Kiểm tra MongoDB đã được start chưa: `net start MongoDB`
- Kiểm tra MONGODB_URI trong file .env

#### Lỗi: Cannot find module

```
Error: Cannot find module '../models/User'
```

**Giải pháp**:

- Chạy `npm install` trong thư mục backend
- Kiểm tra các model files đã tồn tại

#### Lỗi: Validation Error

```
User validation failed: email: Path `email` is required
```

**Giải pháp**:

- Script có vấn đề, kiểm tra lại code
- Xóa toàn bộ collections và chạy lại

### Xóa Database thủ công:

Nếu cần xóa database hoàn toàn:

```bash
mongosh ebay-clone
db.dropDatabase()
exit
```

Hoặc xóa từng collection:

```bash
mongosh ebay-clone
db.users.drop()
db.products.drop()
db.categories.drop()
# ... các collections khác
exit
```

### Customization:

Để thêm/sửa dữ liệu mẫu, edit file `seedDatabase.js`:

```javascript
// Thêm users
const users = [
  // ... thêm user mới ở đây
];

// Thêm products
const products = [
  // ... thêm product mới ở đây
];
```

### Database Structure:

Sau khi chạy script, bạn có thể kiểm tra:

```bash
mongosh ebay-clone
show collections
db.users.countDocuments()
db.products.countDocuments()
```

Hoặc dùng MongoDB Compass để xem trực quan.
