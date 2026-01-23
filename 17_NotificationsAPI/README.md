# Notifications API - Hướng Dẫn Cấp Cao

## Tổng Quan

Notifications API là một tiêu chuẩn web mạnh mẽ cho phép các ứng dụng web hiển thị thông báo hệ thống cho người dùng, ngay cả khi ứng dụng không được tập trung hoặc trình duyệt bị thu nhỏ. API này rất quan trọng để nâng cao sự tương tác của người dùng trong các ứng dụng thời gian thực như hệ thống chat, ứng dụng email và công cụ năng suất.

Ở cấp độ cao, việc hiểu Notifications API không chỉ bao gồm việc sử dụng cơ bản mà còn bao gồm các mẫu nâng cao, tác động bảo mật, cân nhắc hiệu suất và tích hợp với các API web khác như Service Workers cho thông báo đẩy.

## Khái Niệm Cốt Lõi

### Mô Hình Quyền

API hoạt động dựa trên hệ thống dựa trên quyền. Trước khi hiển thị thông báo, bạn phải yêu cầu sự đồng ý của người dùng bằng `Notification.requestPermission()`. Điều này trả về một Promise giải quyết thành 'granted', 'denied' hoặc 'default'.

```javascript
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Quyền thông báo đã được cấp');
  } else {
    console.log('Quyền thông báo bị từ chối');
  }
}
```

**Nhận Xét Cấp Cao**: Luôn xử lý trạng thái 'default' một cách duyên dáng. Người dùng có thể bỏ qua lời nhắc, và bạn nên cung cấp giao diện dự phòng hoặc phương pháp thông báo thay thế.

### Tạo Thông Báo

Thông báo được khởi tạo với constructor `Notification`, chấp nhận tiêu đề và đối tượng tùy chọn.

```javascript
const notification = new Notification('Tiêu đề', {
  body: 'Nội dung thông báo',
  icon: '/path/to/icon.png',
  badge: '/path/to/badge.png',
  image: '/path/to/image.jpg',
  tag: 'unique-tag',
  requireInteraction: true,
  silent: false,
  data: { customData: 'value' }
});
```

**Tùy Chọn Chính**:
- `body`: Nội dung chính
- `icon`: Biểu tượng nhỏ (thường là 16x16 hoặc 32x32)
- `badge`: Biểu tượng đơn sắc nhỏ cho di động
- `image`: Hình ảnh lớn hơn cho thông báo phong phú
- `tag`: Nhóm thông báo; thay thế các thông báo hiện có với cùng tag
- `requireInteraction`: Giữ thông báo hiển thị cho đến khi người dùng tương tác
- `silent`: Ngăn âm thanh thông báo
- `data`: Dữ liệu tùy ý cho xử lý sự kiện

### Xử Lý Sự Kiện

Thông báo phát ra các sự kiện có thể được lắng nghe:

```javascript
notification.addEventListener('click', () => {
  // Xử lý click - thường tập trung cửa sổ và điều hướng
  window.focus();
  notification.close();
});

notification.addEventListener('close', () => {
  // Xử lý sự kiện đóng
});

notification.addEventListener('error', () => {
  // Xử lý lỗi hiển thị
});
```

**Nhận Xét Cấp Cao**: Triển khai dọn dẹp đúng cách. Thông báo nên được đóng theo chương trình khi không còn liên quan để tránh làm lộn xộn khu vực thông báo của người dùng.

## Mẫu Nâng Cao

### Tích Hợp Service Worker Cho Thông Báo Đẩy

Đối với thông báo đẩy thực sự (được gửi ngay cả khi trang web bị đóng), tích hợp với Service Workers:

```javascript
// Trong service-worker.js
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.url
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
```

**Nhận Xét Cấp Cao**: Thông báo đẩy yêu cầu HTTPS và sự đồng ý của người dùng. Xử lý quản lý đăng ký cẩn thận, tôn trọng sở thích của người dùng và cung cấp cơ chế hủy đăng ký.

### Nhóm Thông Báo và Quản Lý

Sử dụng thuộc tính `tag` để nhóm các thông báo liên quan:

```javascript
// Nhiều thông báo với cùng tag sẽ thay thế lẫn nhau
new Notification('Tin nhắn 1', { tag: 'chat', body: 'Tin nhắn đầu tiên' });
new Notification('Tin nhắn 2', { tag: 'chat', body: 'Tin nhắn thứ hai' }); // Thay thế cái đầu
```

Đối với nhóm nâng cao hơn, cân nhắc sử dụng thuộc tính `actions` (hỗ trợ trình duyệt hạn chế):

```javascript
new Notification('Cuộc gọi đến', {
  body: 'John Doe đang gọi',
  actions: [
    { action: 'accept', title: 'Chấp nhận' },
    { action: 'decline', title: 'Từ chối' }
  ]
});
```

### Cân Nhắc Hiệu Suất

- Thông báo tiêu tốn nhiều tài nguyên; tránh tạo chúng không cần thiết
- Sử dụng `requireInteraction` tiết kiệm để ngăn mệt mỏi thông báo
- Triển khai giới hạn tốc độ cho việc tạo thông báo
- Dọn dẹp thông báo khi chúng không còn liên quan

### Bảo Mật và Quyền Riêng Tư

- Luôn yêu cầu quyền tại cử chỉ của người dùng (sự kiện click)
- Tôn trọng sở thích của người dùng; cung cấp cơ chế từ chối rõ ràng
- Cẩn thận với thông tin nhạy cảm trong nội dung thông báo
- Triển khai xử lý lỗi đúng cách để tránh rò rỉ thông tin

## Hỗ Trợ Trình Duyệt và Dự Phòng

Notifications API được hỗ trợ rộng rãi trong các trình duyệt hiện đại, nhưng với các bộ tính năng khác nhau:

- Chrome/Edge: Hỗ trợ đầy đủ bao gồm actions
- Firefox: Hỗ trợ tốt, actions hạn chế
- Safari: Hỗ trợ cơ bản, yêu cầu cử chỉ người dùng cho quyền
- Trình duyệt di động: Mức độ hỗ trợ khác nhau

**Chiến Lược Dự Phòng**:
```javascript
if ('Notification' in window) {
  // Sử dụng Notifications API
} else {
  // Dự phòng cho thông báo trong trang hoặc cảnh báo
}
```

## Ví Dụ Trong Kho Lưu Trữ Này

### Thông Báo Cơ Bản (`NotificationsBasics/`)

Minh họa việc sử dụng cơ bản: yêu cầu quyền, tạo thông báo với dữ liệu tùy chỉnh và xử lý sự kiện click/close.

Điểm chính rút ra:
- Luồng yêu cầu quyền
- Tạo thông báo cơ bản
- Mẫu xử lý sự kiện

### Ứng Dụng Chat Với Thông Báo (`ChatAppWithNotifications/`)

Tích hợp thông báo vào ứng dụng chat dựa trên WebSocket. Thông báo được hiển thị chỉ khi trang không hiển thị, nâng cao trải nghiệm người dùng mà không gây xâm phạm.

Điểm chính rút ra:
- Hiển thị thông báo có điều kiện dựa trên khả năng hiển thị trang
- Tích hợp với ứng dụng thời gian thực
- Xử lý sự kiện đúng cách cho quản lý tập trung

## Thực Tiễn Tốt Nhất

1. **Trải Nghiệm Người Dùng Trước Tiên**: Chỉ thông báo cho các sự kiện thực sự quan trọng
2. **Nâng Cao Tiến Bộ**: Đảm bảo ứng dụng hoạt động mà không có thông báo
3. **Khả Năng Truy Cập**: Cân nhắc trình đọc màn hình và sở thích chuyển động giảm
4. **Kiểm Tra**: Kiểm tra trên các trình duyệt và trạng thái quyền khác nhau
5. **Phân Tích**: Theo dõi tương tác thông báo để tối ưu hóa việc sử dụng

## Đọc Thêm

- [Tài Liệu MDN Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Thông Số Giao Thức Web Push](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

Hướng dẫn này giả định quen thuộc với các nguyên tắc cơ bản của JavaScript, thao tác DOM và lập trình bất đồng bộ. Đối với giới thiệu cấp độ cơ bản, tham khảo các hướng dẫn cơ bản tập trung vào việc tạo thông báo đơn giản.