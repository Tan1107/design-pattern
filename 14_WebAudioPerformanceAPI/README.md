# README: 14_WebAudioPerformanceAPI

## Tổng quan kiến thức

Bài học này tập trung vào **Web Audio API** và **Performance API** trong JavaScript, hai công cụ mạnh mẽ cho âm thanh và đo lường hiệu suất web.

### 1. Web Audio API
Web Audio API cung cấp khả năng xử lý âm thanh thời gian thực trong trình duyệt, vượt xa thẻ `<audio>` cơ bản.

#### Khái niệm cơ bản:
- **AudioContext**: Trung tâm của Web Audio API, quản lý graph âm thanh.
  - Tạo: `const audioCtx = new AudioContext();`
  - Trạng thái: suspended → running (cần user interaction để start).
- **Audio Nodes**: Các khối xử lý âm thanh kết nối thành graph.
  - **Source Nodes**: Nguồn âm thanh (e.g., `OscillatorNode`, `AudioBufferSourceNode`).
  - **Processing Nodes**: Xử lý (e.g., `GainNode` cho volume, `FilterNode` cho filter).
  - **Destination Node**: Output cuối (thường `audioCtx.destination`).
- **Kết nối**: `source.connect(node).connect(destination);`

#### Ví dụ cơ bản (từ WebAudioAPI/):
- Tạo oscillator (sóng sine) và gain node.
- Kết nối và play: `oscillator.start();`
- Điều khiển: Thay đổi frequency, gain để tạo hiệu ứng.

#### Ứng dụng:
- Tạo nhạc, hiệu ứng âm thanh, mixer.
- Phù hợp cho game, DAW web, visualization âm thanh.

### 2. Performance API
Performance API đo lường hiệu suất ứng dụng web, giúp tối ưu hóa.

#### Khái niệm cơ bản:
- **Performance Object**: `window.performance`.
- **Timing**: Đo thời gian load, render.
  - `performance.timing`: Chi tiết timing (navigationStart, loadEventEnd).
  - `performance.now()`: Timestamp chính xác (ms từ navigation start).
- **Navigation**: `performance.navigation` (type: reload, back_forward, etc.).
- **Memory**: `performance.memory` (usedJSHeapSize, totalJSHeapSize) – Chrome only.

#### Ví dụ (từ PerformanceAPI/):
- Đo thời gian sort array: Sử dụng `performance.now()` trước/sau sort, log difference.
- MeasuringSorts.js: So sánh hiệu suất các thuật toán sort (bubble, quick, etc.) với input lớn.

#### Ứng dụng:
- Debug bottleneck, tối ưu load time.
- Benchmark code, track user experience.

### Cấu trúc folder
- **PerformanceAPI/**: Ví dụ đo lường sort algorithms.
- **WebAudioAPI/**: Demo oscillator và gain control.

### Chạy demo
- Mở index.html trong browser.
- Cho phép microphone/camera nếu cần.
- Kiểm tra console cho logs performance.

Bài học này cung cấp nền tảng cho multimedia và optimization trong web apps.</content>
<parameter name="filePath">c:\Demo\JS\14_WebAudioPerformanceAPI\README.md