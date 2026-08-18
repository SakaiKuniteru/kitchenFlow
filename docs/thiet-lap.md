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

## 11. SO_TUAN_HIEN_THI_THUC_DON

**Mã:** `SO_TUAN_HIEN_THI_THUC_DON`

**Giá trị:** Số nguyên dương.

**Mô tả:**

Quy định số tuần được hiển thị để người dùng lựa chọn khi tạo hoặc cập nhật thực đơn có loại **Thực đơn tuần**.

Danh sách tuần được hệ thống sinh tự động bắt đầu từ **tuần hiện tại** hoặc **tuần gần nhất hợp lệ** theo thiết lập:

`NGAY_BAT_DAU_TUAN_THUC_DON`

Mỗi tuần được hiển thị theo định dạng:

`dd/mm/yyyy - dd/mm/yyyy`

Ví dụ:

`SO_TUAN_HIEN_THI_THUC_DON = 5`

thì hệ thống hiển thị **5 tuần liên tiếp** để người dùng lựa chọn.

Ví dụ:

- `17/08/2026 - 23/08/2026`
- `24/08/2026 - 30/08/2026`
- `31/08/2026 - 06/09/2026`
- `07/09/2026 - 13/09/2026`
- `14/09/2026 - 20/09/2026`

Ngày bắt đầu và ngày kết thúc của từng tuần phụ thuộc vào thiết lập:

`NGAY_BAT_DAU_TUAN_THUC_DON`

Khi người dùng chọn một tuần:

- `tuNgay` tự động bằng ngày đầu tiên của tuần.
- `denNgay` tự động bằng ngày cuối cùng của tuần.
- Người dùng không nhập trực tiếp `tuNgay`.
- Người dùng không nhập trực tiếp `denNgay`.

Thiết lập chỉ được sử dụng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng là số nguyên.
- Giá trị lớn hơn `0`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị không phải số nguyên.
- Giá trị nhỏ hơn hoặc bằng `0`.
- Giá trị không hợp lệ.

thì hệ thống sử dụng giá trị mặc định:

`5`

Thiết lập này chỉ áp dụng cho loại **Thực đơn tuần**.

---

## 12. SO_NAM_HIEN_THI_THUC_DON_THANG

**Mã:** `SO_NAM_HIEN_THI_THUC_DON_THANG`

**Giá trị:** Số nguyên dương.

**Mô tả:**

Quy định số năm được phép lựa chọn khi tạo hoặc cập nhật thực đơn có loại **Thực đơn tháng**.

Danh sách năm được sinh tự động bắt đầu từ **năm hiện tại**.

Ví dụ:

`SO_NAM_HIEN_THI_THUC_DON_THANG = 5`

và năm hiện tại là:

`2026`

thì hệ thống cho phép lựa chọn các năm:

- `2026`
- `2027`
- `2028`
- `2029`
- `2030`

Đối với **năm hiện tại**, hệ thống chỉ cho phép lựa chọn từ **tháng hiện tại trở đi**.

Ví dụ thời điểm hiện tại là:

`08/2026`

thì năm `2026` chỉ hiển thị:

- `08/2026`
- `09/2026`
- `10/2026`
- `11/2026`
- `12/2026`

Đối với các **năm tương lai**, hệ thống hiển thị đầy đủ 12 tháng:

- `01`
- `02`
- `03`
- `04`
- `05`
- `06`
- `07`
- `08`
- `09`
- `10`
- `11`
- `12`

Khi người dùng chọn một tháng:

- `tuNgay` tự động bằng ngày đầu tiên của tháng.
- `denNgay` tự động bằng ngày cuối cùng của tháng.
- Người dùng không nhập trực tiếp `tuNgay`.
- Người dùng không nhập trực tiếp `denNgay`.

Hệ thống phải tự xác định chính xác số ngày của từng tháng.

Ví dụ:

- Tháng 01 → 31 ngày.
- Tháng 04 → 30 ngày.
- Tháng 02 → 28 ngày đối với năm thường.
- Tháng 02 → 29 ngày đối với năm nhuận.

Việc xác định năm nhuận phải tuân theo quy tắc lịch Gregorian:

- Năm chia hết cho `400` là năm nhuận.
- Hoặc năm chia hết cho `4` nhưng không chia hết cho `100` là năm nhuận.

Thiết lập chỉ được sử dụng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng là số nguyên.
- Giá trị lớn hơn `0`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị không phải số nguyên.
- Giá trị nhỏ hơn hoặc bằng `0`.
- Giá trị không hợp lệ.

thì hệ thống sử dụng giá trị mặc định:

`5`

Thiết lập này chỉ áp dụng cho loại **Thực đơn tháng**.

---

## Quy tắc hiển thị thời gian áp dụng theo loại thực đơn

Phần **Thời gian áp dụng** thay đổi theo giá trị của `loaiThucDon`.

### Thực đơn ngày

Hiển thị một trường:

`Ngày áp dụng`

Sử dụng:

`{{> forms/date }}`

Người dùng chọn một ngày duy nhất.

Khi chọn ngày:

`tuNgay = ngày áp dụng`

`denNgay = ngày áp dụng`

Ví dụ:

`Ngày áp dụng = 18/08/2026`

thì:

`tuNgay = 18/08/2026`

`denNgay = 18/08/2026`

---

### Thực đơn tuần

Hiển thị một trường:

`Tuần áp dụng`

Sử dụng:

`{{> forms/select }}`

Danh sách tuần được sinh tự động dựa trên:

- `NGAY_BAT_DAU_TUAN_THUC_DON`
- `SO_TUAN_HIEN_THI_THUC_DON`

Option hiển thị theo định dạng:

`dd/mm/yyyy - dd/mm/yyyy`

Ví dụ:

`17/08/2026 - 23/08/2026`

Khi người dùng chọn:

`tuNgay = 17/08/2026`

`denNgay = 23/08/2026`

Người dùng không nhập trực tiếp hai giá trị này.

---

### Thực đơn tháng

Hiển thị lựa chọn:

- `Năm`
- `Tháng`

Danh sách năm được sinh dựa trên:

`SO_NAM_HIEN_THI_THUC_DON_THANG`

Năm bắt đầu luôn là năm hiện tại.

Đối với năm hiện tại:

- Chỉ hiển thị tháng hiện tại và các tháng phía sau.

Đối với năm tương lai:

- Hiển thị từ tháng `01` đến tháng `12`.

Khi người dùng chọn năm và tháng, hệ thống tự động xác định:

`tuNgay = ngày đầu tiên của tháng`

`denNgay = ngày cuối cùng của tháng`

Ví dụ:

`Tháng = 02/2028`

thì:

`tuNgay = 01/02/2028`

`denNgay = 29/02/2028`

---

### Thực đơn từ ngày đến ngày

Hiển thị hai trường:

- `Từ ngày`
- `Đến ngày`

Sử dụng:

`{{> forms/date }}`

Người dùng được phép tự chọn khoảng thời gian.

Điều kiện:

`tuNgay <= denNgay`

Nếu:

`tuNgay > denNgay`

thì không cho phép lưu thực đơn và thông báo:

`Từ ngày không được lớn hơn đến ngày.`

---

## Quy tắc chung

Khi người dùng thay đổi `loaiThucDon`, giao diện **Thời gian áp dụng** phải được cập nhật ngay theo loại thực đơn vừa chọn.

Khi chuyển từ loại thực đơn này sang loại thực đơn khác:

- Xóa giá trị lựa chọn thời gian của loại thực đơn trước.
- Tính lại `tuNgay`.
- Tính lại `denNgay`.
- Không giữ khoảng thời gian không còn phù hợp với loại thực đơn mới.

`tuNgay` và `denNgay` vẫn là hai trường dữ liệu chuẩn được gửi lên Backend.

Các trường như:

- Ngày áp dụng.
- Tuần áp dụng.
- Năm.
- Tháng.

chỉ là các trường hỗ trợ lựa chọn trên giao diện và không cần gửi lên Backend nếu Backend không yêu cầu.

Phần **Thêm ngày** trong nội dung thực đơn tiếp tục sử dụng khoảng:

`tuNgay -> denNgay`

để sinh danh sách ngày có thể lựa chọn.

