# NGHIỆP VỤ THIẾT LẬP HỆ THỐNG

## 1. TEN_HE_THONG

**Mã:** `TEN_HE_THONG`

**Giá trị:** Chuỗi ký tự.

**Mô tả:**

Quy định tên hiển thị của hệ thống.

Giá trị được sử dụng tại các vị trí cần hiển thị tên hệ thống trên giao diện.

Ví dụ:

`KitchenFlow`

---

## 2. LOGO_CO_SO_MAC_DINH

**Mã:** `LOGO_CO_SO_MAC_DINH`

**Giá trị:** Mã cơ sở.

**Mô tả:**

Quy định cơ sở được sử dụng để lấy logo mặc định của hệ thống.

Giá trị của thiết lập là `ma_co_so`, không phải đường dẫn trực tiếp tới ảnh logo.

Hệ thống sử dụng mã cơ sở được cấu hình để tìm cơ sở đang hoạt động và lấy trường `logo` của cơ sở đó.

Ví dụ:

`CS01`

có nghĩa hệ thống sử dụng logo của cơ sở có mã `CS01`.

Nếu không tìm thấy cơ sở tương ứng hoặc cơ sở không hoạt động thì không có logo cơ sở mặc định.

---

## 3. SO_LAN_DANG_NHAP_SAI_TOI_DA

**Mã:** `SO_LAN_DANG_NHAP_SAI_TOI_DA`

**Giá trị:** Số nguyên dương.

**Mô tả:**

Quy định số lần người dùng được phép nhập sai mật khẩu liên tiếp trước khi tài khoản bị khóa.

Ví dụ:

`5`

có nghĩa khi người dùng đăng nhập sai mật khẩu đến lần thứ 5, hệ thống thực hiện khóa tài khoản.

Giá trị chỉ hợp lệ khi:

- Là số nguyên.
- Lớn hơn `0`.
- Thiết lập đang hoạt động (`active = TRUE`).

Nếu thiết lập không tồn tại, bị tắt hoặc giá trị không hợp lệ thì không áp dụng giới hạn đăng nhập sai từ thiết lập này.

---

## 4. THOI_GIAN_KHOA_TAI_KHOAN

**Mã:** `THOI_GIAN_KHOA_TAI_KHOAN`

**Giá trị:** `<số lượng>/<đơn vị>`

**Mô tả:**

Quy định khoảng thời gian tài khoản bị khóa khi số lần đăng nhập sai đạt giới hạn được cấu hình tại `SO_LAN_DANG_NHAP_SAI_TOI_DA`.

Các đơn vị được hỗ trợ:

- `phut`
- `gio`
- `ngay`
- `thang`
- `nam`

Ví dụ:

`30/phut`

có nghĩa tài khoản bị khóa trong 30 phút.

`2/gio`

có nghĩa tài khoản bị khóa trong 2 giờ.

`1/ngay`

có nghĩa tài khoản bị khóa trong 1 ngày.

Số lượng phải là số nguyên lớn hơn `0`.

Nếu thiết lập không tồn tại, bị tắt hoặc giá trị không đúng định dạng thì hệ thống không xác định thời gian tự động mở khóa. Khi tài khoản đạt số lần đăng nhập sai tối đa, tài khoản sẽ bị khóa và cần quản trị viên can thiệp để mở khóa.

---

## 5. THOI_GIAN_ACCESS_TOKEN

**Mã:** `THOI_GIAN_ACCESS_TOKEN`

**Giá trị:** Số phút.

**Mô tả:**

Quy định thời gian hiệu lực của một Access Token.

Ví dụ:

`20`

có nghĩa Access Token có hiệu lực trong 20 phút kể từ thời điểm được tạo.

Khi hết thời gian này, Access Token hiện tại không còn hợp lệ và không thể tiếp tục sử dụng để xác thực API.

Access Token hết hạn **không đồng nghĩa với việc người dùng bị đăng xuất**. Nếu Refresh Token vẫn còn hiệu lực, hệ thống có thể sử dụng Refresh Token để cấp Access Token mới mà không yêu cầu người dùng đăng nhập lại.

Giá trị phải là số nguyên lớn hơn `0`.

Nếu thiết lập không tồn tại, bị tắt hoặc giá trị không hợp lệ thì sử dụng thời gian Access Token mặc định của hệ thống.

---

## 6. THOI_GIAN_REFRESH_TOKEN

**Mã:** `THOI_GIAN_REFRESH_TOKEN`

**Giá trị:** Số phút.

**Mô tả:**

Quy định thời gian hiệu lực của Refresh Token.

Ví dụ:

`30`

có nghĩa Refresh Token có hiệu lực trong 30 phút kể từ thời điểm được tạo.

Refresh Token được sử dụng để cấp lại Access Token khi Access Token hết hạn mà không yêu cầu người dùng nhập lại tài khoản và mật khẩu.

Giá trị phải:

- Là số nguyên.
- Lớn hơn `0`.
- Thiết lập đang hoạt động (`active = TRUE`).

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt.
- Giá trị không phải số.
- Giá trị bằng hoặc nhỏ hơn `0`.

thì hệ thống sử dụng giá trị mặc định là:

`20 phút`

Khi Refresh Token hết hạn và không còn Refresh Token hợp lệ khác, người dùng phải đăng nhập lại.

---

## 7. THOI_GIAN_TIMEOUT

**Mã:** `THOI_GIAN_TIMEOUT`

**Giá trị:** Số phút.

**Mô tả:**

Quy định khoảng thời gian tối đa người dùng không thực hiện bất kỳ thao tác nào trên hệ thống trước khi tự động đăng xuất.

Ví dụ:

`60`

có nghĩa nếu người dùng không có thao tác trong 60 phút liên tục thì hệ thống tự động đăng xuất.

Mỗi khi người dùng có thao tác hợp lệ, thời gian chờ được tính lại từ đầu.

Thiết lập chỉ được áp dụng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị là số nguyên.
- Giá trị lớn hơn `10`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt.
- Giá trị không phải số.
- Giá trị nhỏ hơn hoặc bằng `10`.

thì chức năng tự động đăng xuất do không hoạt động sẽ không được áp dụng.

Thiết lập này độc lập với thời gian hết hạn của Access Token và Refresh Token.

---

## 8. SIDEBAR_DONG_MAC_DINH

**Mã:** `SIDEBAR_DONG_MAC_DINH`

**Giá trị:** `true` hoặc `false`.

**Mô tả:**

Quy định trạng thái mặc định của Sidebar khi người dùng tải hoặc tải lại trang.

Nếu giá trị là:

`true`

thì Sidebar mặc định được **đóng** sau mỗi lần tải hoặc tải lại trang.

Nếu giá trị là:

`false`

thì Sidebar mặc định được **mở** sau mỗi lần tải hoặc tải lại trang.

Giá trị `true` và `false` không phân biệt chữ hoa, chữ thường.

Ví dụ các giá trị sau đều được hiểu là `true`:

- `true`
- `TRUE`
- `True`
- `tRuE`

Thiết lập chỉ làm Sidebar mặc định đóng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng và chuyển về chữ thường là `true`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị là `false`.
- Giá trị không hợp lệ.

thì Sidebar mặc định được **mở**.

Thiết lập này chỉ quy định trạng thái Sidebar khi tải hoặc tải lại trang, không làm thay đổi chức năng đóng/mở Sidebar của người dùng trong quá trình sử dụng.

---

## 9. NGAY_BAT_DAU_TUAN_THUC_DON

**Mã:** `NGAY_BAT_DAU_TUAN_THUC_DON`

**Giá trị:** `0` hoặc `1`.

**Mô tả:**

Quy định ngày bắt đầu và kết thúc tuần khi người dùng tạo hoặc cập nhật thực đơn có loại **Thực đơn tuần**.

Nếu giá trị là:

`0`

thì một tuần thực đơn được tính từ **Thứ 2 đến Chủ nhật** theo thứ tự:

- Thứ 2
- Thứ 3
- Thứ 4
- Thứ 5
- Thứ 6
- Thứ 7
- Chủ nhật

Nếu giá trị là:

`1`

thì một tuần thực đơn được tính từ **Thứ 7 đến Thứ 6** theo thứ tự:

- Thứ 7
- Chủ nhật
- Thứ 2
- Thứ 3
- Thứ 4
- Thứ 5
- Thứ 6

Thiết lập chỉ áp dụng chế độ **Thứ 7 đến Thứ 6** khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng là `1`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị là `0`.
- Giá trị khác `1`.
- Giá trị không hợp lệ.

thì mặc định một tuần thực đơn được tính từ **Thứ 2 đến Chủ nhật**.

Thiết lập này chỉ dùng để quy định cách xác định tuần trên giao diện tạo và cập nhật thực đơn, không làm thay đổi dữ liệu thực đơn đã được lưu trước đó.

---

## 10. THUC_DON_BAT_BUOC_DU_SO_NGAY

**Mã:** `THUC_DON_BAT_BUOC_DU_SO_NGAY`

**Giá trị:** `true` hoặc `false`.

**Mô tả:**

Quy định việc người dùng có bắt buộc phải nhập đầy đủ số ngày của thực đơn theo khoảng thời gian đã chọn hay không.

Nếu giá trị là:

`true`

thì người dùng **bắt buộc phải nhập đầy đủ các ngày** thuộc khoảng thời gian của thực đơn trước khi có thể lưu thực đơn.

Nếu giá trị là:

`false`

thì người dùng **không bắt buộc phải nhập đầy đủ các ngày** thuộc khoảng thời gian của thực đơn.

Giá trị `true` và `false` không phân biệt chữ hoa, chữ thường.

Ví dụ các giá trị sau đều được hiểu là `true`:

- `true`
- `TRUE`
- `True`
- `tRuE`

Thiết lập chỉ bật chế độ bắt buộc nhập đầy đủ số ngày khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng và chuyển về chữ thường là `true`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị là `false`.
- Giá trị không hợp lệ.

thì mặc định **không bắt buộc** người dùng phải nhập đầy đủ số ngày.

Thiết lập này chỉ dùng để ràng buộc và kiểm tra dữ liệu trên giao diện tạo và cập nhật thực đơn, không làm thay đổi dữ liệu thực đơn đã được lưu trước đó.

---