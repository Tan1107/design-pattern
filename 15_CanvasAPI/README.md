# README: 15_CanvasAPI

## Tổng quan kiến thức

Bài học này giới thiệu **Canvas API** trong JavaScript, một API 2D rendering cho vẽ đồ họa trực tiếp trên `<canvas>` element.

### 1. Cơ bản Canvas
- **Thiết lập**: `<canvas id="canvas" width="300" height="300"></canvas>`, `const ctx = canvas.getContext("2d");`
- **Vẽ hình dạng**:
  - **Hình chữ nhật**: `fillRect(x, y, w, h)`, `strokeRect()`, `clearRect()`.
  - **Đường tròn**: `beginPath()`, `arc(x, y, r, start, end)`, `fill()`/`stroke()`.
  - **Đường dẫn**: `moveTo()`, `lineTo()`, `bezierCurveTo()`, `fill()`.
- **Thuộc tính**: `fillStyle`, `strokeStyle`, `lineWidth`, `globalAlpha`.

### 2. Animation với Canvas
- **Vòng lặp**: `requestAnimationFrame(loop)` cho smooth animation.
- **Cập nhật**: Thay đổi vị trí, clear và vẽ lại mỗi frame.
- **Sự kiện**: `addEventListener("click")` để tương tác (e.g., tạo bóng).

### 3. OOP và Logic
- **Class Ball**: Properties (x, y, vel, size, color), methods (draw, update).
- **Gravity & Collision**: Va chạm biên, trọng lực (`yVel += 0.3`).

### Cấu trúc folder
- **CanvasBasics/**: Vẽ shapes cơ bản, paths, curves.
- **BouncingBalls/**: Animation với nhiều bóng nảy, click để tạo.

### Chạy demo
- Mở index.html/balls.html trong browser.
- Click để tạo bóng trong BouncingBalls.

Bài học này dạy vẽ và animate 2D, nền tảng cho game/graphics web.</content>
<parameter name="filePath">c:\Demo\JS\15_CanvasAPI\README.md