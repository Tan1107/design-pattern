# Nguyên tắc SOLID trong OOP - Hướng dẫn cấp Senior

Kho lưu trữ này chứa các triển khai và minh họa về các nguyên tắc SOLID trong JavaScript, tập trung vào các mẫu thiết kế hướng đối tượng nâng cao và các thực tiễn tốt nhất dành cho các nhà phát triển cấp senior.

## Tổng quan

SOLID là từ viết tắt của năm nguyên tắc thiết kế nhằm làm cho các thiết kế phần mềm dễ hiểu, linh hoạt và dễ bảo trì hơn. Những nguyên tắc này được giới thiệu bởi Robert C. Martin (Uncle Bob) và là nền tảng của lập trình hướng đối tượng.

- **S** - Nguyên tắc Trách nhiệm Đơn lẻ (Single Responsibility Principle - SRP)
- **O** - Nguyên tắc Mở-Đóng (Open-Closed Principle - OCP)
- **L** - Nguyên tắc Thay thế Liskov (Liskov Substitution Principle - LSP)
- **I** - Nguyên tắc Phân tách Giao diện (Interface Segregation Principle - ISP)
- **D** - Nguyên tắc Đảo ngược Phụ thuộc (Dependency Inversion Principle - DIP)

Lưu ý: Mặc dù DIP không được minh họa rõ ràng trong thư mục này, nhưng các nguyên tắc khác được bao phủ với các ví dụ JavaScript thực tế.

## Nguyên tắc Trách nhiệm Đơn lẻ (SRP)

### Khái niệm
Một lớp nên chỉ có một lý do để thay đổi, nghĩa là nó chỉ nên có một công việc hoặc trách nhiệm.

### Những hiểu biết cấp Senior
- SRP liên quan đến sự gắn kết: các chức năng liên quan nên được nhóm lại với nhau
- Vi phạm khi một lớp xử lý nhiều mối quan tâm (ví dụ: lưu trữ dữ liệu, logic nghiệp vụ, hiển thị UI)
- Lợi ích: Dễ kiểm tra, bảo trì và tái sử dụng hơn
- Cạm bẫy phổ biến: Các đối tượng "thần" làm mọi thứ

### Ví dụ
Xem `OCP.js` để có ví dụ liên quan nơi các hình dạng xử lý tính toán diện tích của riêng chúng, tuân thủ SRP.

## Nguyên tắc Mở-Đóng (OCP)

### Khái niệm
Các thực thể phần mềm (lớp, mô-đun, hàm) nên mở cho việc mở rộng nhưng đóng cho việc sửa đổi.

### Những hiểu biết cấp Senior
- Mở rộng thông qua kế thừa, thành phần hoặc các mẫu chiến lược
- Tránh sửa đổi mã hiện có để thêm chức năng mới
- Cho phép các kiến trúc plug-in và phát triển framework
- Kiểm tra: Các tính năng mới không phá vỡ hành vi hiện có

### Ví dụ Mã
```javascript
// Từ OCP.js - Cách tiếp cận xấu (vi phạm OCP)
class AreaCalculator {
  static calculate(shape) {
    if (shape.type === "circle") {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === "square") {
      return shape.side * shape.side;
    } // Thêm hình tam giác yêu cầu sửa đổi phương thức này
  }
}

// Cách tiếp cận tốt (tuân thủ OCP)
class Shape {
  area() {
    throw new Error("Must implement area()");
  }
}

class Circle extends Shape {
  constructor(radius) { this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

class Square extends Shape {
  constructor(side) { this.side = side; }
  area() { return this.side * this.side; }
}

// Thêm Rectangle không sửa đổi mã hiện có
class Rectangle extends Shape {
  constructor(length, width) { this.length = length; this.width = width; }
  area() { return this.length * this.width; }
}
```

### Những xem xét nâng cao
- Sử dụng các lớp cơ sở trừu tượng hoặc giao diện
- Thành phần thay vì kế thừa cho các mở rộng phức tạp
- Các mẫu thiết kế: Strategy, Template Method, Visitor

## Nguyên tắc Thay thế Liskov (LSP)

### Khái niệm
Các đối tượng của lớp cha nên có thể được thay thế bằng các đối tượng của lớp con mà không ảnh hưởng đến tính đúng đắn của chương trình.

### Những hiểu biết cấp Senior
- Các kiểu con phải tôn trọng hợp đồng của kiểu cha
- Các điều kiện tiên quyết không thể được củng cố, các điều kiện hậu quả không thể được làm yếu
- Các bất biến phải được bảo toàn
- Vi phạm phổ biến: Ném ngoại lệ không mong muốn, thay đổi ngữ nghĩa hành vi

### Ví dụ Mã
```javascript
// Từ LSP.js - Vi phạm
class Bird {
  fly() { console.log("Flying"); }
}

class Penguin extends Bird {
  fly() { throw new Error("Cannot fly"); } // Vi phạm LSP
}

// Cách tiếp cận đúng
class Bird {} // Lớp cơ sở không có giả định

class FlyingBird extends Bird {
  fly() { console.log("Flying"); }
}

class Penguin extends Bird {} // Không có phương thức fly

function makeBirdFly(bird) {
  if (bird instanceof FlyingBird) {
    bird.fly();
  }
}
```

### Những xem xét nâng cao
- Thiết kế theo hợp đồng: Chỉ định các điều kiện tiên/hậu
- Sử dụng thành phần cho các hành vi tùy chọn
- Tránh kế thừa để tái sử dụng mã khi LSP không áp dụng

## Nguyên tắc Phân tách Giao diện (ISP)

### Khái niệm
Các client không nên bị buộc phải phụ thuộc vào các giao diện mà chúng không sử dụng.

### Những hiểu biết cấp Senior
- Ưu tiên các giao diện nhỏ, tập trung thay vì các giao diện lớn, đa mục đích
- Giảm sự kết hợp giữa các thành phần
- Cho phép khả năng kiểm tra và bảo trì tốt hơn
- Trong JavaScript: Sử dụng duck typing hoặc đa kế thừa/mixins

### Ví dụ Mã
```javascript
// Từ ISP.js - Vi phạm
class Worker {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
}

// Cách tiếp cận đúng
class Workable {
  work() { /* ... */ }
}

class Eatable {
  eat() { /* ... */ }
}

class Sleepable {
  sleep() { /* ... */ }
}

// Client chỉ phụ thuộc vào những gì nó cần
function manageWork(workable) {
  workable.work();
}
```

### Những xem xét nâng cao
- Trong JS: Sử dụng mixins hoặc thành phần thay vì đa kế thừa
- Ô nhiễm giao diện: Các giao diện lớn buộc các phụ thuộc không cần thiết
- Giao diện vai trò: Định nghĩa giao diện dựa trên các mẫu sử dụng client

## Luật Demeter (LoD)

### Khái niệm
Một phương thức chỉ nên gọi các phương thức trên:
1. Đối tượng chính nó
2. Các tham số được truyền cho phương thức
3. Các đối tượng mà nó tạo hoặc khởi tạo
4. Các thành phần của đối tượng (biến instance)

### Những hiểu biết cấp Senior
- Giảm sự kết hợp bằng cách giới hạn các chuỗi phương thức
- Nguyên tắc "Đừng nói chuyện với người lạ"
- Cải thiện tính đóng gói và khả năng bảo trì
- Vi phạm phổ biến: `obj.getA().getB().getC().doSomething()`

### Ví dụ Mã
```javascript
// Từ LawOfDemeter.js - Vi phạm
class ShoppingMall {
  chargeCustomer(person, amount) {
    let wallet = person.getWallet(); // Truy cập cấu trúc bên trong
    let money = wallet.getMoney();
    wallet.money = money - amount;
  }
}

// Cách tiếp cận đúng
class Person {
  payAmount(amount) {
    this.wallet.debit(amount); // Person xử lý tương tác ví
  }
}

class ShoppingMall {
  chargeCustomer(person, amount) {
    person.payAmount(amount); // Nói, đừng hỏi
  }
}
```

### Những xem xét nâng cao
- Nói, đừng hỏi: Ưu tiên nói với các đối tượng phải làm gì thay vì truy vấn trạng thái
- Các giao diện fluent đôi khi có thể vi phạm LoD
- Cân bằng với các nguyên tắc khác (ví dụ: SRP có thể yêu cầu một số ủy quyền)

## Các Thực tiễn Tốt nhất cho Nhà phát triển cấp Senior

### 1. Tương tác giữa các Nguyên tắc
- OCP và LSP hoạt động cùng nhau: Các mở rộng nên có thể thay thế được
- ISP hỗ trợ SRP: Các giao diện tập trung cho phép các trách nhiệm đơn lẻ
- DIP (không hiển thị) cho phép OCP: Phụ thuộc vào các trừu tượng, không phải các cụ thể

### 2. Kiểm tra Mã SOLID
- Các bài kiểm tra đơn vị nên xác minh từng nguyên tắc
- LSP: Kiểm tra các kiểu con thay thế cho các kiểu cha
- OCP: Thêm tính năng không nên phá vỡ các bài kiểm tra hiện có
- ISP: Mock chỉ các phụ thuộc cần thiết

### 3. Refactoring Mã Legacy
- Bắt đầu với SRP: Trích xuất các lớp có nhiều trách nhiệm
- Áp dụng OCP: Giới thiệu các trừu tượng cho các mở rộng
- Sửa các vi phạm LSP: Cấu trúc lại các hệ thống phân cấp kế thừa
- Phân tách giao diện: Chia các giao diện lớn

### 4. Các Anti-Pattern Phổ biến
- Các lớp thần (vi phạm SRP)
- Các câu lệnh switch trên các kiểu (vi phạm OCP)
- Ném NotImplementedError (vi phạm LSP)
- Các giao diện béo (vi phạm ISP)
- Các tàu hỏa (vi phạm LoD)

### 5. Những xem xét Đặc thù cho JavaScript
- Kế thừa nguyên mẫu so với cú pháp lớp
- Duck typing giảm nhu cầu giao diện rõ ràng
- Mixins và thành phần cho các thiết kế linh hoạt
- Các mô-đun ES6 cho tính đóng gói tốt hơn

## Kết luận

Việc nắm vững các nguyên tắc SOLID đòi hỏi sự hiểu biết không chỉ về các quy tắc, mà còn về khi nào và cách áp dụng chúng. Các nhà phát triển cấp senior nên:

- Nhận ra các tương tác và sự đánh đổi giữa các nguyên tắc
- Sử dụng các mẫu thiết kế hỗ trợ SOLID
- Viết mã có thể kiểm tra và bảo trì
- Liên tục refactor hướng tới thiết kế tốt hơn

Nhớ: SOLID là phương tiện để đạt được mục đích (phần mềm có thể bảo trì), không phải là mục đích tự thân. Áp dụng các nguyên tắc một cách thận trọng dựa trên ngữ cảnh dự án và khả năng của đội ngũ.

## Tài liệu Tham khảo
- "Clean Code" của Robert C. Martin
- "Design Patterns" của Gang of Four
- "Refactoring" của Martin Fowler