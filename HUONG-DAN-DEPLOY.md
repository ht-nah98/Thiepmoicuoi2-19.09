# Hướng dẫn đưa thiệp lên Vercel

Thiệp đã có sẵn backend riêng. Làm theo 3 bước dưới đây, mất khoảng 15 phút.

---

## Bước 1 — Đưa mã nguồn lên GitHub

Đã xong! Repo ở: https://github.com/ht-nah98/thiepmoicuoi

> Nhớ để repo ở chế độ **Private** (Settings → General → Danger Zone → Change visibility),
> vì nó chứa số tài khoản ngân hàng và địa chỉ nhà.

---

## Bước 2 — Deploy lên Vercel

1. Vào https://vercel.com → **Add New** → **Project**
2. Chọn repo `thiepmoicuoi` → **Import**
3. Bấm **Deploy** (chưa cần thêm gì cả), chờ khoảng 1 phút

Thiệp sẽ chạy được ngay, chỉ phần Lời chúc là chưa lưu được — làm tiếp bước 3.

---

## Bước 3 — Tạo database ngay trong Vercel

Đây là cách nhanh nhất, **không cần vào trang Neon**:

1. Trong dự án vừa deploy → tab **Storage**
2. Bấm **Create Database** → chọn **Postgres**
3. Đặt tên (ví dụ `thiep-cuoi-db`), chọn region **Singapore**
4. Bấm **Create** → Vercel hỏi kết nối với dự án nào → chọn dự án thiệp → **Connect**

Xong! Vercel **tự động** thêm biến `POSTGRES_URL` vào dự án. Code đã viết để tự nhận biến này.

> Vercel Postgres chính là Neon ở phía sau — cùng một dịch vụ, chỉ khác là bạn quản lý
> ngay trong Vercel, không phải mở thêm tài khoản.

### Thêm khoá bảo vệ (khuyến nghị)

Vào **Settings** → **Environment Variables** → thêm:

| Name | Value |
|------|-------|
| `ACCESS_KEY` | tự đặt, ví dụ `tienanh-phuonglinh-2026` |

Khoá này ngăn người lạ gọi thẳng API để spam lời chúc.

### Deploy lại

Sau khi thêm database và biến môi trường, vào tab **Deployments** →
bấm dấu **⋯** ở bản mới nhất → **Redeploy**.

---

## Cách 2 (thay thế) — Tạo database ở Neon.tech

Nếu muốn quản lý database riêng, tách khỏi Vercel:

1. Vào https://neon.tech → tạo project, chọn region **Singapore**
2. Copy **Connection string**
3. Vercel → **Settings** → **Environment Variables** → thêm:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | chuỗi kết nối vừa copy |

Code nhận cả `DATABASE_URL` lẫn `POSTGRES_URL`, dùng cách nào cũng được.

---

## Kiểm tra sau khi deploy

1. Mở link thiệp, bấm **Mở thiệp mời**
2. Cuộn tới album → tab **Lời chúc** hiện ra bên phải
3. Thử gửi một lời chúc
4. Tải lại trang — lời chúc phải vẫn còn đó

Nếu lời chúc không lưu được, vào Vercel → **Deployments** → **Functions** để xem lỗi.

---

## Gắn tên miền riêng (tuỳ chọn)

Nếu muốn địa chỉ đẹp như `tienanh-phuonglinh.com`:

1. Mua tên miền (Namecheap, Porkbun, hoặc Tenten/Mắt Bão ở Việt Nam)
2. Vercel → dự án → **Settings** → **Domains** → **Add**
3. Làm theo hướng dẫn trỏ DNS mà Vercel hiện ra

---

## Ghi chú kỹ thuật

**Các endpoint đã có:**

| Đường dẫn | Việc |
|---|---|
| `GET /api/comment` | lấy danh sách lời chúc |
| `POST /api/comment` | gửi lời chúc mới |
| `PUT /api/comment/:uuid` | sửa lời chúc của mình |
| `DELETE /api/comment/:uuid` | xoá lời chúc của mình |
| `POST /api/comment/:uuid/like` | thả tim |

**Bảng dữ liệu** `loi_chuc` tự tạo lần đầu chạy, gồm: tên khách, xác nhận tham dự, lời chúc, số tim, thời gian gửi.

**Xem lời chúc dưới dạng bảng:** vào Vercel → **Storage** → chọn database → tab **Data**
(hoặc Neon → **SQL Editor** nếu dùng Cách 2) → chạy:

```sql
SELECT name AS "Tên khách",
       CASE WHEN presence THEN 'Có đến' ELSE 'Không đến' END AS "Tham dự",
       comment AS "Lời chúc",
       created_at AS "Thời gian"
FROM loi_chuc
WHERE parent_uuid IS NULL
ORDER BY created_at DESC;
```

**Đếm số khách xác nhận đến dự:**

```sql
SELECT COUNT(*) FROM loi_chuc WHERE presence = TRUE AND parent_uuid IS NULL;
```
