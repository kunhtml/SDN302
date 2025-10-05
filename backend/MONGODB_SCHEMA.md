# MongoDB Schema Documentation

## Chuyển đổi từ MySQL sang MongoDB

Dự án đã được chuyển đổi từ MySQL sang MongoDB với các thay đổi sau:

### Các Models đã tạo/cập nhật:

1. **User** - Quản lý người dùng

   - Thêm field `username` và `avatarURL` từ schema MySQL
   - Giữ nguyên tất cả tính năng authentication và authorization
   - Embedded addresses array

2. **Category** - Danh mục sản phẩm (MỚI)

   - Hỗ trợ phân cấp danh mục (parentCategory)
   - Auto-generate slug từ name
   - Full-text search

3. **Product** - Sản phẩm

   - Cập nhật theo schema MySQL: `title`, `images`, `categoryId`, `sellerId`
   - Thêm hỗ trợ đấu giá: `isAuction`, `auctionEndTime`
   - Giữ các tính năng nâng cao: rating, reviews, views, sold

4. **Inventory** - Quản lý tồn kho (MỚI)

   - Theo dõi số lượng sản phẩm
   - Low stock warning
   - Tự động cập nhật lastUpdated

5. **Order** - Đơn hàng

   - Cập nhật: `buyerId`, `addressId`, `orderDate`, `status`
   - Tích hợp Payment và Shipping info
   - Chi tiết OrderItems

6. **Payment** - Thanh toán (MỚI)

   - Độc lập với Order
   - Hỗ trợ nhiều phương thức: paypal, stripe, cod, bank_transfer
   - Transaction tracking
   - Refund management

7. **ShippingInfo** - Thông tin vận chuyển (MỚI)

   - Carrier và tracking number
   - Trạng thái vận chuyển chi tiết
   - Lịch sử tracking
   - Estimated vs actual delivery

8. **ReturnRequest** - Yêu cầu hoàn trả (MỚI)

   - Link với Order
   - Upload ảnh chứng minh
   - Admin approval workflow
   - Refund tracking

9. **Bid** - Đấu giá (MỚI)

   - Hỗ trợ đấu giá sản phẩm
   - Track highest bid
   - Auto-update bid status
   - Winner determination

10. **Review** - Đánh giá

    - Giữ nguyên tính năng
    - Link với Product và User

11. **Message** - Tin nhắn (từ Chat model)

    - Real-time messaging
    - Sender và Receiver

12. **Coupon** - Mã giảm giá

    - Cập nhật: `discountPercent`, `startDate`, `endDate`, `maxUsage`
    - Hỗ trợ áp dụng cho Product cụ thể
    - Usage tracking

13. **Feedback** - Đánh giá người bán (MỚI)

    - Seller reputation system
    - Average rating và positive rate
    - Detailed metrics: response rate, delivery rate
    - Rating distribution

14. **Dispute** - Khiếu nại

    - Cập nhật: `orderId`, `raisedBy`, `description`
    - Admin resolution workflow
    - Evidence upload

15. **Store** - Cửa hàng
    - Cập nhật: `sellerId`, `bannerImageURL`
    - Store profile với description
    - Business info

## Mapping MySQL -> MongoDB

| MySQL Table   | MongoDB Model  | Thay đổi chính                     |
| ------------- | -------------- | ---------------------------------- |
| User          | User           | + username, avatarURL              |
| Address       | User.addresses | Embedded document                  |
| Category      | Category       | Model mới với hierarchy            |
| Product       | Product        | + title, isAuction, auctionEndTime |
| OrderTable    | Order          | Đổi tên fields                     |
| OrderItem     | Order.items    | Embedded document                  |
| Payment       | Payment        | Model độc lập                      |
| ShippingInfo  | ShippingInfo   | Model độc lập mở rộng              |
| ReturnRequest | ReturnRequest  | Model mới mở rộng                  |
| Bid           | Bid            | Model mới                          |
| Review        | Review         | Giữ nguyên                         |
| Message       | Message/Chat   | Giữ nguyên                         |
| Coupon        | Coupon         | Thêm fields                        |
| Inventory     | Inventory      | Model mới                          |
| Feedback      | Feedback       | Model mới mở rộng                  |
| Dispute       | Dispute        | Thêm fields                        |
| Store         | Store          | Đổi tên fields                     |

## Lợi ích của MongoDB

1. **Embedded Documents**: Address được nhúng vào User, giảm số lượng queries
2. **Flexible Schema**: Dễ dàng thêm fields mới
3. **Scalability**: Horizontal scaling với sharding
4. **Performance**: Indexing tốt hơn cho queries phức tạp
5. **JSON Native**: Dễ tích hợp với Node.js/Express

## Indexes đã tạo

- User: email, username
- Product: title, description, categoryId, sellerId, rating
- Category: name, slug
- Order: buyerId, orderNumber, status
- Payment: orderId, userId, transactionId, status
- Bid: productId + bidTime, bidderId
- Review: productId + userId
- Inventory: productId
- Feedback: sellerId, averageRating

## Notes

- Tất cả models đều có `timestamps: true` (createdAt, updatedAt)
- Foreign keys được thay bằng ObjectId references
- Enum values được validate ở model level
- Các virtual fields và methods đã được thêm vào
- Pre/post middleware để auto-update related data
