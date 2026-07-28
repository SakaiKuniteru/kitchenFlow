# KitchenFlow

## Giới thiệu

KitchenFlow là hệ thống quản lý suất ăn dành cho doanh nghiệp, hỗ trợ quản lý nhân viên, phân quyền, cơ sở, nhà ăn, ca ăn, bình chọn suất ăn, voucher và các chính sách hỗ trợ.

Dự án được phát triển bằng **Node.js + Express + PostgreSQL** theo mô hình nhiều tầng (Controller → Service → Repository) nhằm dễ bảo trì và mở rộng.

---

# Công nghệ sử dụng

## Backend

- Node.js
- Express.js
- PostgreSQL
- pg
- Joi
- jsonwebtoken
- MD5
- Helmet
- CORS
- Morgan
- Cookie Parser

---

# Yêu cầu môi trường

Cần cài đặt:

- Node.js >= 22
- PostgreSQL >= 17
- Git

Kiểm tra phiên bản:

```bash
node -v
npm -v
psql --version
git --version
```

---

# Clone project

```bash
git clone https://github.com/SakaiKuniteru/ketchenFlow.git
```

```bash
cd ketchenFlow
```

---

# Cài đặt package

```bash
npm install
```

---

# Cấu hình môi trường

Tạo file `.env`

Ví dụ:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kitchenflow
DB_USER=postgres
DB_PASSWORD=123456

JWT_SECRET=your-secret-key
JWT_EXPIRES=1d
```

---

# Khởi tạo Database

Tạo database

```sql
CREATE DATABASE kitchenflow;
```

Import file SQL

```bash
psql -U postgres -d kitchenflow -f database.sql
```

---

# Truy cập Database

## Đăng nhập PostgreSQL

```bash
psql -U postgres
```

Hoặc đăng nhập trực tiếp vào database:

```bash
psql -U <username> -d kitchenflow
```

Ví dụ:

```bash
psql -U quochuy -d kitchenflow
```

---

# Một số lệnh PostgreSQL thường dùng

## Liệt kê Database

```sql
\l
```

Hoặc

```sql
\list
```

---

## Kết nối Database

```sql
\c kitchenflow
```

Hoặc

```sql
\connect kitchenflow
```

---

## Kiểm tra đang kết nối Database nào

```sql
SELECT current_database();
```

---

## Kiểm tra tài khoản đang đăng nhập

```sql
SELECT current_user;
```

---

## Hiển thị danh sách Schema

```sql
\dn
```

---

## Hiển thị danh sách bảng

```sql
\dt
```

Hiển thị bảng của schema cụ thể:

```sql
\dt public.*
```

---

## Hiển thị tất cả đối tượng

```sql
\d
```

Lệnh này sẽ hiển thị:

* Table
* View
* Sequence
* Index
* Materialized View

---

## Hiển thị View

```sql
\dv
```

---

## Hiển thị Sequence

```sql
\ds
```

---

## Xem cấu trúc bảng

```sql
\d dm_nhan_vien
```

Ví dụ

```sql
\d dm_voucher
```

Hiển thị:

* Column
* Data Type
* Nullable
* Default
* Primary Key
* Foreign Key
* Index

---

## Xem Index của bảng

```sql
\di
```

---

## Mô tả đầy đủ bảng

```sql
\d+ dm_nhan_vien
```

---

## Truy vấn dữ liệu

```sql
SELECT * FROM dm_nhan_vien;
```

---

## Giới hạn số bản ghi

```sql
SELECT * FROM dm_nhan_vien
LIMIT 10;
```

---

## Sắp xếp dữ liệu

```sql
SELECT *
FROM dm_nhan_vien
ORDER BY id DESC;
```

---

## Đếm số lượng

```sql
SELECT COUNT(*)
FROM dm_nhan_vien;
```

---

## Tìm kiếm

```sql
SELECT *
FROM dm_nhan_vien
WHERE ho_ten ILIKE '%Nguyễn%';
```

---

## Xóa toàn bộ dữ liệu bảng

> Không xóa cấu trúc bảng

```sql
TRUNCATE TABLE dm_nhan_vien;
```

Hoặc reset luôn ID:

```sql
TRUNCATE TABLE dm_nhan_vien RESTART IDENTITY;
```

---

## Xóa câu truy vấn đang nhập

Nếu nhập sai nhưng chưa thực thi:

```sql
\r
```

Ví dụ

```sql
SELECT *
FROM dm_nhan_vien
WHERE
```

Muốn hủy:

```sql
\r
```

---

## Xóa màn hình

```sql
\! clear
```

Hoặc

```text
Ctrl + L
```

---

## Hiển thị thời gian thực thi câu SQL

```sql
\timing
```

Tắt:

```sql
\timing off
```

---

## Thực thi file SQL

```sql
\i database.sql
```

Ví dụ

```sql
\i migrations/20260723_add_dm_voucher.sql
```

---

## Thoát PostgreSQL

```sql
\q
```

---

# Truy vấn nhanh từ Terminal

Thực hiện trực tiếp câu SQL mà không cần vào `psql`.

Ví dụ xem dữ liệu:

```bash
psql -U quochuy -d kitchenflow -c "SELECT * FROM dm_nhan_vien;"
```

Đếm số lượng:

```bash
psql -U quochuy -d kitchenflow -c "SELECT COUNT(*) FROM dm_nhan_vien;"
```

Xem 10 quốc gia đầu tiên:

```bash
psql -U quochuy -d kitchenflow -c "SELECT * FROM dm_quoc_gia LIMIT 10;"
```

Xem danh sách bảng:

```bash
psql -U quochuy -d kitchenflow -c "\dt"
```

---

# Seed dữ liệu

```bash
node src/seeds/index.js
```

---

# Chạy dự án

```bash
npm start
```

Server mặc định:

```
http://localhost:3000
```

---

# Quy tắc chung

## Kiến trúc

Dự án được tổ chức theo mô hình:

```
Route
    ↓
Validation
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

---

## Quy tắc đặt tên

### Bảng

- `dm_` : Danh mục
- `nv_` : Nghiệp vụ
- `ct_` : Chi tiết

Ví dụ:

```
dm_nhan_vien

nv_dot_binh_chon

ct_binh_chon_suat_an
```

---

### Cột

Database sử dụng:

```
snake_case
```

Ví dụ

```
ten_nhan_vien
```

Javascript sử dụng:

```
camelCase
```

Ví dụ

```
tenNhanVien
```

---

## Soft Delete

Không xóa dữ liệu khỏi hệ thống.

Sử dụng trường:

```
active
```

- `true`: Đang sử dụng
- `false`: Đã khóa

---

## Quy tắc phát triển

- Không viết SQL trong Controller.
- Repository chỉ thao tác Database.
- Service xử lý nghiệp vụ.
- Validation sử dụng Joi.
- Mỗi module gồm:
  - route
  - validation
  - controller
  - service
  - repository

---

## Cấu trúc thư mục

```
src
├── config
├── constants
├── middlewares
├── modules
├── routes
├── seeds
├── utils
├── views
└── public
```


---

---

# Quy tắc Git

Dự án sử dụng 2 nhánh chính:

| Nhánh | Mục đích |
|-------|----------|
| `development` | Phát triển hằng ngày |
| `production` | Phiên bản ổn định, dùng để phát hành |

> **Lưu ý:** Không commit trực tiếp lên `production`. Mọi thay đổi đều được phát triển trên `development` và chỉ merge sang `production` khi kiểm thử hoàn tất.

---

# Quy tắc Commit

Định dạng:

```text
<type>: <mô tả ngắn>
```

Các loại commit:

| Type | Ý nghĩa |
|------|----------|
| feat | Thêm chức năng mới |
| fix | Sửa lỗi |
| docs | Cập nhật tài liệu |
| style | Chỉnh sửa định dạng code |
| refactor | Tái cấu trúc code |
| test | Thêm hoặc sửa test |
| chore | Công việc bảo trì (config, package...) |
| db | Thay đổi cấu trúc Database |
| seed | Cập nhật dữ liệu seed |

Ví dụ:

```bash
git commit -m "feat: thêm quản lý voucher"

git commit -m "fix: sửa validate chức vụ"

git commit -m "docs: cập nhật README"

git commit -m "db: cập nhật bảng dm_voucher"

git commit -m "seed: cập nhật dữ liệu quốc gia"
```

---

# Quy trình làm việc

## 1. Chuyển sang nhánh phát triển

```bash
git checkout development
```

Cập nhật code mới nhất:

```bash
git pull origin development
```

---

## 2. Sau khi hoàn thành chức năng

Kiểm tra thay đổi:

```bash
git status
```

Thêm file:

```bash
git add .
```

Hoặc:

```bash
git add <tên_file>
```

Commit:

```bash
git commit -m "feat: thêm API quản lý voucher"
```

Đẩy lên GitHub:

```bash
git push
```

> Nếu là lần đầu đẩy nhánh `development`:

```bash
git push -u origin development
```

---

## 3. Phát hành phiên bản

Chuyển sang nhánh production:

```bash
git checkout production
```

Lấy code mới nhất:

```bash
git pull origin production
```

Merge từ development:

```bash
git merge development
```

Đẩy lên GitHub:

```bash
git push origin production
```

---

# Một số lệnh Git thường dùng

## Kiểm tra trạng thái

```bash
git status
```

## Xem lịch sử commit

```bash
git log --oneline
```

## Kiểm tra nhánh hiện có

```bash
git branch
```

## Kiểm tra tất cả nhánh

```bash
git branch -a
```

## Kiểm tra nhánh trên GitHub

```bash
git branch -r
```

## Kiểm tra nhánh đang theo dõi

```bash
git branch -vv
```

## Chuyển nhánh

```bash
git checkout development
```

```bash
git checkout production
```

## Tạo nhánh mới

```bash
git checkout -b ten_nhanh
```

## Lấy code mới nhất

```bash
git pull
```

## Đẩy code lên GitHub

```bash
git push
```

---

# Quy trình phát triển

```text
Code
    ↓
git status
    ↓
git add .
    ↓
git commit -m "feat: ..."
    ↓
git push
    ↓
Pull Request (nếu làm việc nhóm)
    ↓
Merge vào development
    ↓
Kiểm thử
    ↓
Merge sang production
```


---

## Tác giả

Phạm Quốc Huy