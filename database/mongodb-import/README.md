# MongoDB Import Guide

Thư mục này chứa **11 file JSON** để import toàn bộ dữ liệu vào MongoDB bằng tay.

## 📦 Danh sách Collections

1. **categories.json** - 7 danh mục sản phẩm
2. **users.json** - 5 users (1 admin, 2 sellers, 2 buyers)
3. **stores.json** - 2 stores của sellers
4. **products.json** - 30 sản phẩm
5. **inventory.json** - Inventory cho các sản phẩm
6. **coupons.json** - 5 mã giảm giá
7. **orders.json** - 3 đơn hàng mẫu
8. **carts.json** - 2 giỏ hàng
9. **reviews.json** - 6 đánh giá sản phẩm
10. **notifications.json** - 4 thông báo
11. **feedbacks.json** - Feedback cho 2 sellers

## ⚠️ YÊU CẦU QUAN TRỌNG

### 1. Hash Passwords Trước Khi Import Users
File `users.json` có passwords là **placeholder** `$2a$10$YourHashedPasswordHere1`.

**Bạn PHẢI hash passwords trước:**

```javascript
// Trong Node.js
const bcrypt = require('bcryptjs');

// Hash cho từng user
const adminPass = await bcrypt.hash('admin123', 10);
const sellerPass = await bcrypt.hash('seller123', 10);
const buyerPass = await bcrypt.hash('buyer123', 10);

// Sau đó thay thế trong users.json
```

## 🚀 Cách Import (ĐÚNG THỨ TỰ)

### Bước 1: Import các collection độc lập (không có foreign key)
```bash
cd database/mongodb-import

# 1. Categories
mongoimport --db ebay-clone --collection categories --file categories.json --jsonArray

# 2. Users (sau khi đã hash passwords)
mongoimport --db ebay-clone --collection users --file users.json --jsonArray

# 3. Coupons
mongoimport --db ebay-clone --collection coupons --file coupons.json --jsonArray
```

### Bước 2: Lấy ObjectId để update foreign keys
```javascript
// Trong mongosh
use ebay-clone

// Lưu IDs
const categories = db.categories.find().toArray();
const users = db.users.find().toArray();

// Copy các IDs này
categories.forEach(c => print(c.name + ": " + c._id));
users.forEach(u => print(u.email + ": " + u._id));
```

### Bước 3: Update foreign keys trong các file JSON

**Sửa stores.json** - Thêm `sellerId`:
```json
{
  "sellerId": "673d9f8a1234567890abcdef",
  "storeName": "John's Store",
  ...
}
```

**Sửa products.json** - Thêm `categoryId` và `sellerId`:
```json
{
  "title": "Essence Mascara Lash Princess",
  "categoryId": "673d9f8a1234567890abcd01",
  "sellerId": "673d9f8a1234567890abcdef",
  ...
}
```

**Tương tự cho:**
- `inventory.json` - Thêm `productId`
- `orders.json` - Thêm `buyerId`, `items[].product`, `items[].seller`
- `carts.json` - Thêm `userId`, `items[].product`
- `reviews.json` - Thêm `user`, `product`, `order`
- `notifications.json` - Thêm `userId`
- `feedbacks.json` - Thêm `sellerId`

### Bước 4: Import các collection có foreign keys
```bash
# 4. Stores (cần userId của sellers)
mongoimport --db ebay-clone --collection stores --file stores.json --jsonArray

# 5. Products (cần categoryId và sellerId)
mongoimport --db ebay-clone --collection products --file products.json --jsonArray

# 6. Inventory (cần productId)
mongoimport --db ebay-clone --collection inventories --file inventory.json --jsonArray

# 7. Orders (cần buyerId, productId, sellerId)
mongoimport --db ebay-clone --collection orders --file orders.json --jsonArray

# 8. Carts (cần userId, productId)
mongoimport --db ebay-clone --collection carts --file carts.json --jsonArray

# 9. Reviews (cần userId, productId, orderId)
mongoimport --db ebay-clone --collection reviews --file reviews.json --jsonArray

# 10. Notifications (cần userId)
mongoimport --db ebay-clone --collection notifications --file notifications.json --jsonArray

# 11. Feedbacks (cần sellerId)
mongoimport --db ebay-clone --collection feedbacks --file feedbacks.json --jsonArray
```

## ⚡ Quick Start - Script Tự Động (KHUYÊN DÙNG)

**Thay vì làm thủ công**, dùng script tự động:

```bash
npm run seed:db
```

Script này sẽ:
- ✅ Hash passwords tự động
- ✅ Import đúng thứ tự
- ✅ Tự động map foreign keys (categoryId, sellerId, productId...)
- ✅ Tạo đầy đủ 100 products từ DummyJSON API

## 📊 Test Accounts (sau khi import)

| Email | Password | Role |
|-------|----------|------|
| admin@ebay.com | admin123 | Admin |
| seller1@ebay.com | seller123 | Seller |
| seller2@ebay.com | seller123 | Seller |
| buyer1@ebay.com | buyer123 | Buyer |
| buyer2@ebay.com | buyer123 | Buyer |

## 🗑️ Xóa Dữ Liệu Cũ

```bash
# Trong mongosh
use ebay-clone

db.categories.deleteMany({})
db.users.deleteMany({})
db.stores.deleteMany({})
db.products.deleteMany({})
db.inventories.deleteMany({})
db.coupons.deleteMany({})
db.orders.deleteMany({})
db.carts.deleteMany({})
db.reviews.deleteMany({})
db.notifications.deleteMany({})
db.feedbacks.deleteMany({})
```

## 📝 Lưu Ý Khi Import Thủ Công

1. **Foreign Keys**: Tất cả các ObjectId references phải được update thủ công sau khi import users, categories, products
2. **Passwords**: PHẢI hash trước khi import users, nếu không sẽ không login được
3. **Thứ tự import**: Phải import đúng thứ tự (categories → users → stores → products → inventory → orders → reviews...)
4. **Inventory**: Mỗi product phải có 1 inventory entry tương ứng
5. **Store**: Mỗi seller phải có 1 store

## 🎯 Khuyến Nghị

- ✅ **Dùng `npm run seed:db`** - Nhanh, tự động, không lỗi
- ⚠️ **Import thủ công** - Chậm, dễ sai, phải update foreign keys bằng tay
