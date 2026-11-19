# 🛍️ BÁO CÁO BÀI TẬP THỰC HÀNH: DỰ ÁN SHOPMINI
> **Sinh viên thực hiện**: Lê Hùng Hậu - MSV: B25DCCC106  
> **Môn học**: Phát triển ứng dụng Web / Chuyên đề React  
> **Nền tảng**: React 18, TypeScript, Vite, Redux Toolkit, Context API  
> **Tông màu chủ đạo**: Xanh dương (Ocean & Royal Blue) - Thiết kế thanh lịch, trực quan, đúng chuẩn bài thực hành sinh viên khá giỏi  

---

## 📌 MỤC LỤC
1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Chiến lược phân chia State (Trọng tâm ăn điểm)](#2-chiến-lược-phân-chia-state-trọng-tâm-ăn-điểm)
   - [Ma trận quyết định State (Decision Matrix)](#ma-trận-quyết-định-state-decision-matrix)
   - [Phân tích chi tiết Redux Toolkit & Lý do lựa chọn](#a-redux-toolkit-global-business-state)
   - [Phân tích chi tiết Context API & Lý do lựa chọn](#b-context-api-cross-cutting-concerns)
   - [Phân tích chi tiết useState & useMemo](#c-usestate--usememo-local--derived-state)
3. [Các tính năng nâng cấp thêm để sản phẩm hoàn thiện hơn](#3-các-tính-năng-nâng-cấp-thêm-để-sản-phẩm-hoàn-thiện-hơn)
4. [Cấu trúc thư mục chuẩn mực](#4-cấu-trúc-thư-mục-chuẩn-mực)
5. [Danh sách tính năng & Yêu cầu kỹ thuật đạt được](#5-danh-sách-tính-năng--yêu-cầu-kỹ-thuật-đạt-được)
6. [Hướng dẫn cài đặt & Chạy ứng dụng](#6-hướng-dẫn-cài-đặt--chạy-ứng-dụng)

---

## 1. GIỚI THIỆU TỔNG QUAN

**ShopMini** là ứng dụng thương mại điện tử mini mô phỏng quy trình mua sắm trực tuyến hoàn chỉnh: duyệt sản phẩm, lọc danh mục, tìm kiếm, sắp xếp, xem chi tiết, quản lý giỏ hàng, áp dụng mã giảm giá, xác thực tài khoản và tiến hành đặt hàng.

Ứng dụng đáp ứng các tiêu chuẩn kỹ thuật hiện đại:
- **100% Type-Safe**: Sử dụng TypeScript nghiêm ngặt, tuyệt đối **không sử dụng `any`**.
- **Quản lý trạng thái đa tầng**: Kết hợp nhuần nhuyễn giữa **Local State (`useState`, `useMemo`)**, **Context API** và **Redux Toolkit** đúng mục đích kiến trúc.
- **Giao diện Responsive**: Thích ứng hoàn hảo trên mọi thiết bị: Mobile (1 cột), Tablet (2 cột), Desktop (4 cột).
- **Hỗ trợ Dark / Light Theme**: Tông màu xanh dương hài hòa, chuyển đổi tức thì.

---

## 2. CHIẾN LƯỢC PHÂN CHIA STATE (TRỌNG TÂM ĂN ĐIỂM)

Một lỗi phổ biến trong các dự án React là **"lạm dụng Redux cho tất cả mọi thứ"** hoặc **"đẩy hết vào Context gây re-render toàn bộ app"**. Trong dự án ShopMini, việc phân chia trạng thái tuân thủ nguyên tắc chuẩn mực của React Architecture:

### 📊 Ma trận quyết định State (Decision Matrix)

| Loại dữ liệu | Nơi lưu trữ | Phạm vi | Lý do kỹ thuật chọn giải pháp |
| :--- | :---: | :---: | :--- |
| **Danh sách sản phẩm (Products)** | **Redux Toolkit** | Toàn cục | Dữ liệu nghiệp vụ lấy từ Server API; cần quản lý các pha bất đồng bộ (`idle`, `loading`, `succeeded`, `failed`) và cache tái sử dụng ở nhiều trang. |
| **Giỏ hàng (Cart Items)** | **Redux Toolkit** | Toàn cục | Trạng thái nghiệp vụ cốt lõi, thay đổi liên tục bởi nhiều component ở các tầng khác nhau (Header, ProductCard, Detail, Cart, Checkout); cần selectors tính toán memoized. |
| **Giao diện Sáng/Tối (Theme)** | **Context API** | Toàn cục | Dữ liệu môi trường hiển thị toàn app, tần suất thay đổi rất thấp, không có logic async phức tạp -> Context là giải pháp nhẹ nhàng nhất, tránh cồng kềnh. |
| **Phiên người dùng (Auth/User)** | **Context API** | Toàn cục | Dữ liệu phiên đăng nhập/đăng xuất độc lập với nghiệp vụ hàng hóa, cần truy xuất ở Header và Protected Route. |
| **Tìm kiếm, Lọc danh mục, Sắp xếp** | **useState & useMemo** | Cục bộ | Dữ liệu điều khiển hiển thị nội bộ tại trang chủ. Sử dụng `useMemo` tính toán danh sách đã lọc (derived state) tránh lưu duplicate state. |
| **Form nhập liệu, Mã giảm giá, Feedback** | **useState** | Cục bộ | Dữ liệu tạm thời (ephemeral) chỉ phục vụ thao tác của người dùng trên màn hình hiện tại, không gây ảnh hưởng ra component ngoài. |

---

### A. REDUX TOOLKIT (Global Business State)

#### 1. `productsSlice`
- **Dữ liệu quản lý**:
  - `items: Product[]`: Danh sách sản phẩm từ FakeStoreAPI.
  - `status: 'idle' | 'loading' | 'succeeded' | 'failed'`: Vòng đời trạng thái gọi API.
  - `error: string | null`: Thông báo lỗi nếu gọi API thất bại.
- **Tại sao để ở Redux?**
  - **Xử lý bất đồng bộ chuẩn mực**: Sử dụng `createAsyncThunk` của Redux Toolkit để quản lý luồng dữ liệu async sạch sẽ, tách biệt hoàn toàn side-effects ra khỏi UI component.
  - **Tối ưu Network & Caching**: Danh sách sản phẩm được tải một lần khi ứng dụng khởi động hoặc khi người dùng truy cập trang chủ, sau đó được lưu trong Redux store. Trang Chi tiết sản phẩm có thể tra cứu trực tiếp từ cache này mà không cần tốn tài nguyên gọi lại API.
  - **Dễ dàng mở rộng**: Nếu sau này phát triển thêm tính năng phân trang, đánh giá sản phẩm hay quản lý kho, Redux Toolkit sẽ mở rộng reducer cực kỳ dễ dàng.

#### 2. `cartSlice`
- **Dữ liệu quản lý**:
  - `items: CartItem[]`: Mảng sản phẩm trong giỏ kèm số lượng (`quantity`).
- **Các Actions**:
  - `addToCart`: Thêm mới hoặc tự động cộng dồn số lượng nếu sản phẩm đã tồn tại.
  - `removeFromCart`: Xóa sản phẩm theo ID.
  - `updateQuantity`: Cập nhật số lượng trực tiếp (nếu `<= 0` thì tự động xóa).
  - `clearCart`: Làm rỗng giỏ hàng sau khi đặt hàng thành công.
- **Các Selectors**:
  - `selectTotalQuantity`: Tính tổng số lượng món đồ để hiện badge trên Header.
  - `selectTotalPrice`: Tính tổng giá trị đơn hàng.
- **Tại sao để ở Redux?**
  - **State chia sẻ đa điểm (Multi-consumer State)**:
    - Component thêm vào giỏ: `ProductCard` (Trang chủ), `ProductDetailPage`.
    - Component hiển thị số lượng: `Header` (Navbar hiển thị ở mọi trang).
    - Component chỉnh sửa: `CartPage`.
    - Component hoàn tất & dọn dẹp: `CheckoutPage`.
  - **Tránh hiện tượng Prop-Drilling**: Nếu dùng `useState`, ta phải truyền props qua 4-5 cấp trung gian.
  - **Tránh Re-render thừa (hiệu năng cao hơn Context)**: Nếu đưa giỏ hàng vào Context, mỗi khi tăng/giảm số lượng sản phẩm thì **mọi component dùng context đó đều bị re-render**. Với Redux Toolkit + `useAppSelector`, component chỉ re-render khi giá trị selector mà nó lắng nghe thực sự thay đổi.

---

### B. CONTEXT API (Cross-Cutting Concerns)

Context API được React thiết kế riêng cho các dữ liệu mang tính **thiết lập môi trường** (ambient data) hoặc ít biến động:

#### 1. `ThemeContext`
- **Dữ liệu quản lý**:
  - `theme`: `'light' | 'dark'`
  - `toggleTheme`: Hàm chuyển đổi qua lại giữa sáng và tối.
- **Tại sao dùng Context API mà không dùng Redux?**
  - Theme là cấu hình hiển thị toàn cục, không liên quan đến dữ liệu hàng hoá hay nghiệp vụ kinh doanh.
  - Tần suất thay đổi rất thấp (chỉ khi người dùng chủ động bấm đổi giao diện).
  - Dùng Context giúp code gọn gàng, giảm bớt sự phụ thuộc cồng kềnh vào Redux store, dễ tách module độc lập.

#### 2. `AuthContext`
- **Dữ liệu quản lý**:
  - `user: User | null`: Thông tin tài khoản người dùng hiện tại.
  - `login(username, password)`: Hàm xác thực tài khoản giả lập (mật khẩu đúng: `123456`).
  - `logout()`: Đăng xuất người dùng.
- **Tại sao dùng Context API mà không dùng Redux?**
  - Phân tách ranh giới rõ ràng: Tách riêng **State xác thực (Authentication)** ra khỏi **State nghiệp vụ hàng hóa (Redux Store)**.
  - Được tiêu thụ trực tiếp bởi `ProtectedRoute` để kiểm soát quyền điều hướng (route guarding) và `Header` để hiển thị lời chào.
  - Logic xác thực giả lập diễn ra nhanh gọn, đồng bộ, không cần xử lý chuỗi middleware phức tạp của Redux.

---

### C. `useState` & `useMemo` (Local & Derived State)

Những dữ liệu chỉ có ý nghĩa trong một màn hình duy nhất và biến mất khi người dùng rời đi được giữ ở `useState`:

| Component | Biến State | Mục đích & Lý do kỹ thuật |
| :--- | :--- | :--- |
| **`HomePage`** | `searchTerm`, `selectedCategory`, `sortBy` | - Phục vụ lọc và sắp xếp sản phẩm ngay tại Trang chủ.<br>- Danh sách hiển thị `processedProducts` được tính toán thông qua hook `useMemo` (Derived State) dựa trên 3 state này và mảng `items` từ Redux, **không cần tạo thêm state trùng lặp**. |
| **`ProductCard`** | `justAdded` | Cờ boolean hiển thị hiệu ứng đổi nút thành `✓ Đã thêm` trong 1.2 giây để người dùng nhận diện phản hồi tức thì. |
| **`ProductDetailPage`** | `product`, `loading`, `error`, `added` | - `added`: Thông báo đã thêm giỏ hàng.<br>- `product`, `loading`, `error`: Dự phòng khi người dùng gõ trực tiếp URL sản phẩm trên trình duyệt. |
| **`CartPage`** | `couponCode`, `appliedCoupon`, `couponMsg` | Quản lý việc áp dụng mã giảm giá (`GIAM10`, `SHOPMINI`) và tính toán lại tiền tạm tính/giảm giá/tổng cộng. |
| **`LoginPage`** | `username`, `password`, `errorMessage` | Quản lý giá trị nhập liệu (Controlled Inputs) và thông báo lỗi validation tại form đăng nhập. |
| **`CheckoutPage`** | `fullName`, `phone`, `address`, `isOrdered` | Thông tin người nhận và cờ xác nhận đơn hàng thành công trong phiên thanh toán. |

---

## 3. CÁC TÍNH NĂNG NÂNG CẤP THÊM ĐỂ SẢN PHẨM HOÀN THIỆN HƠN

Để ứng dụng trở nên sinh động, thực tế và ghi điểm tuyệt đối trong mắt người chấm bài, dự án đã bổ sung thêm các tính năng bổ trợ thiết thực nhưng giữ giao diện mộc mạc, chuẩn chỉ:

1. **Bộ lọc danh mục sản phẩm (Category Filter Chips)**:
   - Tự động trích xuất các danh mục từ FakeStoreAPI (`Thời trang nam`, `Thời trang nữ`, `Trang sức`, `Đồ điện tử`).
   - Người dùng có thể click chọn danh mục để xem nhanh nhóm sản phẩm mong muốn.
2. **Sắp xếp sản phẩm đa tiêu chí (Sort Dropdown)**:
   - Cho phép người dùng sắp xếp danh sách theo: *Giá Thấp đến Cao*, *Giá Cao đến Thấp*, *Tên A - Z*, *Tên Z - A*.
   - Hoạt động kết hợp đồng thời cùng ô tìm kiếm và bộ lọc danh mục.
3. **Nút "⚡ Mua ngay" (Buy Now) tại trang Chi tiết sản phẩm**:
   - Cho phép người dùng mua thẳng sản phẩm mong muốn mà không cần vào giỏ hàng nhấn nhiều bước. Tự động chuyển hướng đến `/checkout` (và kích hoạt `ProtectedRoute` nếu chưa đăng nhập).
4. **Phản hồi tương tác vi mô (Micro-interaction Feedback)**:
   - Tại `ProductCard`, khi bấm "+ Thêm giỏ", nút lập tức đổi sang màu xanh lá `✓ Đã thêm` trong 1.2 giây giúp người dùng cảm nhận rõ ràng hành vi đã được hệ thống ghi nhận.
5. **Hệ thống Mã giảm giá (Promo / Coupon Code)**:
   - Tại `CartPage`, người dùng có thể nhập mã khuyến mãi:
     - Nhập `GIAM10`: Giảm 10% tổng hóa đơn.
     - Nhập `SHOPMINI`: Giảm 15% tổng hóa đơn.
   - Hiển thị trực quan: Tạm tính, Tiền giảm giá, và Tổng thanh toán cuối cùng.
   - Dữ liệu giảm giá được truyền mượt mà sang `CheckoutPage` để người dùng xác nhận trước khi bấm "Đặt hàng".

---

## 4. CẤU TRÚC THƯ MỤC CHUẨN MỰC

```text
src/
├── app/                        # Cấu hình Redux Store & Typed Hooks
│   ├── store.ts                # configureStore kết hợp productsReducer & cartReducer
│   └── hooks.ts                # useAppDispatch & useAppSelector chuẩn TypeScript
├── features/                   # Các lát cắt nghiệp vụ (Redux Slices)
│   ├── products/
│   │   └── productSlice.ts     # Thunk gọi API FakeStore, quản lý loading/succeeded/failed
│   └── cart/
│       └── cartSlice.ts        # Quản lý giỏ hàng: thêm, xóa, sửa số lượng, tính tổng
├── contexts/                   # Quản lý trạng thái toàn cục bằng Context API
│   ├── ThemeContext.tsx        # Cung cấp theme sáng/tối & custom hook useTheme()
│   └── AuthContext.tsx         # Cung cấp user, login('123456'), logout & custom hook useAuth()
├── components/                 # Các UI Components tái sử dụng
│   ├── Header.tsx              # Thanh điều hướng: Logo, theme toggle, giỏ hàng, thông tin user
│   ├── ProductCard.tsx         # Thẻ hiển thị sản phẩm, nút thêm giỏ có phản hồi visual
│   └── ProtectedRoute.tsx      # Bảo vệ route /checkout, lưu state redirect về trang trước
├── layouts/
│   └── MainLayout.tsx          # Bố cục chuẩn mực gồm Header, Main Content và Footer
├── pages/                      # Các trang theo Routes
│   ├── HomePage.tsx            # Lưới responsive, tìm kiếm, lọc danh mục, sắp xếp
│   ├── ProductDetailPage.tsx   # Chi tiết sản phẩm, nút thêm giỏ & nút "Mua ngay"
│   ├── CartPage.tsx            # Danh sách giỏ hàng, tăng/giảm số lượng, mã giảm giá
│   ├── LoginPage.tsx           # Form đăng nhập trống, tự động quay lại trang trước đó
│   ├── CheckoutPage.tsx        # Form giao hàng, tính giảm giá, nút Đặt hàng xoá giỏ
│   └── NotFoundPage.tsx        # Trang 404 thân thiện
├── types/
│   └── index.ts                # Định nghĩa toàn bộ Interface (Product, CartItem, User, Theme)
├── App.tsx                     # Khai báo React Router DOM v6
├── main.tsx                    # Điểm khởi động: Bọc Provider, ThemeProvider, AuthProvider, BrowserRouter
└── index.css                   # Định nghĩa biến CSS màu xanh dương, hệ thống responsive và dark mode
```

---

## 5. DANH SÁCH TÍNH NĂNG & YÊU CẦU KỸ THUẬT ĐẠT ĐƯỢC

- [x] **Trang chủ (`/`)**:
  - Danh sách sản phẩm API `https://fakestoreapi.com/products`.
  - Lưới responsive: **1 cột Mobile**, **2 cột Tablet**, **4 cột Desktop**.
  - Ô tìm kiếm thời gian thực theo tên sản phẩm.
  - **Bộ lọc danh mục (Tabs) & Dropdown sắp xếp giá/tên**.
  - Quản lý mượt mà cả 3 trạng thái: `loading`, `succeeded`, `failed`.
- [x] **Chi tiết sản phẩm (`/products/:id`)**:
  - Xem ảnh, tên, danh mục, mô tả chi tiết, giá tiền.
  - Cung cấp 2 lựa chọn: **"Thêm vào giỏ hàng"** và **"⚡ Mua ngay"**.
- [x] **Giỏ hàng (`/cart`)**:
  - Bảng sản phẩm: ảnh, tên, đơn giá, cụm tăng/giảm số lượng, thành tiền, xoá từng món, xoá toàn bộ giỏ.
  - Tính toán tổng số lượng và tổng tiền tự động qua Redux Selectors.
  - **Nhập mã giảm giá khuyến mãi (`GIAM10`, `SHOPMINI`) có thông báo tức thì**.
- [x] **Đăng nhập (`/login`)**:
  - Form nhập liệu sạch sẽ, để trống cho người dùng tự gõ.
  - Mật khẩu giả lập chính xác: `123456`.
  - Lưu phiên đăng nhập vào `localStorage`.
- [x] **Thanh toán (`/checkout`) - Protected Route**:
  - Chưa đăng nhập chuyển sang `/login`. Đăng nhập xong quay lại đúng trang `/checkout`.
  - Tóm tắt đơn hàng (tính cả mã giảm giá nếu có từ giỏ hàng).
  - Nút **"Đặt hàng"**: Xóa trắng giỏ hàng trong Redux Store và hiện thông báo thành công.
- [x] **Header dùng chung**:
  - Số lượng giỏ hàng tức thời.
  - Tên người dùng và nút Đăng xuất (hoặc nút Đăng nhập nếu chưa login).
  - Nút chuyển đổi giao diện Sáng / Tối toàn trang.
- [x] **Trang 404 (`*`)**:
  - Bắt các URL không tồn tại, có nút quay về trang chủ.
- [x] **Chuẩn TypeScript**:
  - Tuyệt đối không dùng `any`, dự án biên dịch sạch sẽ (`tsc && vite build`).

---

## 6. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
> Truy cập liên kết hiển thị trên terminal (mặc định: `http://localhost:5173/`).

### Bước 3: Kiểm tra Build & Type Check
```bash
npm run build
```
> Kiểm tra toàn bộ mã nguồn TypeScript và đóng gói Vite production.

### Tài khoản & Mã khuyến mãi thử nghiệm:
- **Tài khoản đăng nhập**: Tên đăng nhập bất kỳ, Mật khẩu: `123456`.
- **Mã giảm giá tại giỏ hàng**: `GIAM10` (giảm 10%) hoặc `SHOPMINI` (giảm 15%).
