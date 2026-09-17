# KitchenFlow Build Console contract

Build Console phải chạy trong một checkout Git sạch, có Git history đầy đủ, Node.js 22 và npm.

## Thêm project

| Trường | Giá trị |
| --- | --- |
| Repository | `https://github.com/SakaiKuniteru/ketchenFlow.git` |
| Branch mặc định | `development` |
| Working directory | thư mục gốc repository |
| Runtime | Node.js 22 |
| Install command | `npm ci` |
| Verify command | `npm run verify:build` |
| Release command | `npm run build:release -- <version>` |
| Artifact | `.releases/<stage>/<version>/<commit>` |

Build Console phải giữ workspace hoặc copy artifact sang máy deploy. Các ref `refs/kitchenflow/*` và symlink `.releases/<stage>/current` chỉ tồn tại trong workspace đã build.

## Secret theo môi trường

Build Console có thể truyền secret chung như `DB_HOST` hoặc secret theo stage như `PRODUCT1_DB_HOST`. Tên stage là `TEST`, `STABLE`, `PRODUCT1`, `PRODUCT2`.

Mỗi stage cần:

```text
<STAGE>_DB_HOST
<STAGE>_DB_PORT
<STAGE>_DB_NAME
<STAGE>_DB_USER
<STAGE>_DB_PASSWORD
<STAGE>_ACCESS_TOKEN_SECRET
<STAGE>_REFRESH_TOKEN_SECRET
<STAGE>_QR_PAYMENT_PROVIDER
```

Khi dùng VietQR, thêm:

```text
<STAGE>_VIETQR_CLIENT_ID
<STAGE>_VIETQR_API_KEY
<STAGE>_VIETQR_ACCOUNT_NO
<STAGE>_VIETQR_ACCOUNT_NAME
<STAGE>_VIETQR_ACQ_ID
```

## Chuỗi lệnh release

Build Console chạy các lệnh này theo thứ tự:

```bash
npm ci
npm run env:stage -- test --force
npm run env:stage -- stable --force
npm run env:stage -- product1 --force
npm run env:stage -- product2 --force
npm run check:stage -- test
npm run check:stage -- stable
npm run check:stage -- product1
npm run check:stage -- product2
npm run build:release -- 1.0.11
```

`build:release` tạo DEV marker, sau đó lần lượt build TEST, STABLE, PRODUCT1 và PRODUCT2 cùng một version. Mỗi release chứa `release.json`, asset đã build và `.env.<stage>` với quyền đọc riêng cho owner.

## Chạy sau khi deploy

Build Console không được dùng process build ngắn hạn làm server. Máy deploy phải chạy supervisor lâu dài:

```bash
npm run start:product1
npm run start:product2
```

Sau khi build version mới, supervisor phát hiện `.releases/<stage>/current` đổi và restart server.
