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

---

## 🚀 Kiến thức Senior Level

### 4. Performance Optimization (Tối ưu hiệu năng)

#### 4.1. Rendering Optimization
- **Batch Drawing**: Nhóm nhiều draw calls lại để giảm overhead
  ```javascript
  // ❌ Chậm: Mỗi shape là một draw call
  balls.forEach(ball => ball.draw());
  
  // ✅ Nhanh: Batch cùng loại shapes
  ctx.fillStyle = 'red';
  ctx.beginPath();
  redBalls.forEach(ball => {
    ctx.moveTo(ball.x, ball.y);
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  });
  ctx.fill();
  ```

- **Dirty Rectangle**: Chỉ vẽ lại phần thay đổi, không clear toàn bộ canvas
  ```javascript
  // Chỉ clear và vẽ lại vùng cần thiết
  ctx.clearRect(oldX, oldY, width, height);
  ctx.clearRect(newX, newY, width, height);
  drawObject(newX, newY);
  ```

- **Offscreen Canvas**: Pre-render static content vào offscreen canvas
  ```javascript
  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');
  // Render background một lần
  offCtx.fillStyle = 'blue';
  offCtx.fillRect(0, 0, width, height);
  // Trong loop: chỉ copy, không vẽ lại
  ctx.drawImage(offscreen, 0, 0);
  ```

#### 4.2. Memory Management
- **Path2D Reuse**: Tái sử dụng Path2D objects thay vì tạo mới mỗi frame
  ```javascript
  const circlePath = new Path2D();
  circlePath.arc(0, 0, 50, 0, Math.PI * 2);
  // Reuse trong loop
  ctx.save();
  ctx.translate(x, y);
  ctx.fill(circlePath);
  ctx.restore();
  ```

- **ImageData Caching**: Cache ImageData cho pixel manipulation
  ```javascript
  const imageData = ctx.getImageData(0, 0, width, height);
  // Manipulate pixels
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255; // R
  }
  ctx.putImageData(imageData, 0, 0);
  ```

- **Object Pooling**: Tái sử dụng objects thay vì tạo/xóa liên tục
  ```javascript
  class ObjectPool {
    constructor(createFn, resetFn) {
      this.pool = [];
      this.createFn = createFn;
      this.resetFn = resetFn;
    }
    acquire() {
      return this.pool.pop() || this.createFn();
    }
    release(obj) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  ```

#### 4.3. Frame Rate Control
- **Delta Time**: Sử dụng delta time cho frame-independent animation
  ```javascript
  let lastTime = 0;
  function loop(currentTime) {
    const delta = (currentTime - lastTime) / 1000; // seconds
    lastTime = currentTime;
    update(delta);
    draw();
    requestAnimationFrame(loop);
  }
  ```

- **Throttling**: Giới hạn FPS khi cần
  ```javascript
  const targetFPS = 30;
  const frameInterval = 1000 / targetFPS;
  let lastFrameTime = 0;
  function loop(currentTime) {
    if (currentTime - lastFrameTime >= frameInterval) {
      update();
      draw();
      lastFrameTime = currentTime;
    }
    requestAnimationFrame(loop);
  }
  ```

### 5. Advanced Transformations & Matrices

#### 5.1. Transform Methods
- **Transform Stack**: `save()`, `restore()` để quản lý state
  ```javascript
  ctx.save(); // Push state
  ctx.translate(100, 100);
  ctx.rotate(Math.PI / 4);
  ctx.scale(1.5, 1.5);
  drawShape();
  ctx.restore(); // Pop state
  ```

- **Matrix Manipulation**: Direct matrix operations
  ```javascript
  // Transform matrix: [a, b, c, d, e, f]
  // a, d: scale X, Y
  // b, c: skew
  // e, f: translate X, Y
  ctx.setTransform(1, 0, 0, 1, x, y); // Reset + translate
  ctx.transform(a, b, c, d, e, f); // Multiply current matrix
  ```

- **Custom Transform Origin**: Transform quanh một điểm
  ```javascript
  function rotateAround(ctx, x, y, angle) {
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.translate(-x, -y);
  }
  ```

#### 5.2. Coordinate Systems
- **World to Screen**: Chuyển đổi coordinate systems
  ```javascript
  class Camera {
    constructor(x, y, zoom = 1) {
      this.x = x;
      this.y = y;
      this.zoom = zoom;
    }
    apply(ctx) {
      ctx.save();
      ctx.translate(-this.x, -this.y);
      ctx.scale(this.zoom, this.zoom);
    }
    release(ctx) {
      ctx.restore();
    }
    screenToWorld(screenX, screenY) {
      return {
        x: (screenX / this.zoom) + this.x,
        y: (screenY / this.zoom) + this.y
      };
    }
  }
  ```

### 6. Advanced Rendering Techniques

#### 6.1. Compositing & Blending
- **Global Composite Operation**: Blend modes
  ```javascript
  ctx.globalCompositeOperation = 'multiply'; // darken
  ctx.globalCompositeOperation = 'screen'; // lighten
  ctx.globalCompositeOperation = 'overlay'; // contrast
  ctx.globalCompositeOperation = 'destination-over'; // behind
  ctx.globalCompositeOperation = 'source-atop'; // clip
  ```

- **Alpha Compositing**: Control transparency blending
  ```javascript
  ctx.globalAlpha = 0.5; // 50% opacity
  ctx.globalCompositeOperation = 'source-over'; // default
  ```

#### 6.2. Clipping & Masking
- **Clipping Path**: Giới hạn vùng vẽ
  ```javascript
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.clip(); // Tất cả vẽ sau chỉ hiện trong circle
  // Draw content
  ctx.restore(); // Remove clip
  ```

- **Image Masking**: Sử dụng image làm mask
  ```javascript
  const mask = new Image();
  mask.onload = () => {
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  };
  ```

#### 6.3. Shadows & Filters
- **Shadow Effects**: Drop shadows
  ```javascript
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ```

- **Custom Filters**: Sử dụng CSS filters hoặc manual pixel manipulation
  ```javascript
  canvas.style.filter = 'blur(5px) brightness(1.2)';
  // Hoặc manual với ImageData
  ```

### 7. Pixel Manipulation & Image Processing

#### 7.1. ImageData API
- **Get/Put ImageData**: Direct pixel access
  ```javascript
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data; // Uint8ClampedArray [R, G, B, A, ...]
  
  // Manipulate pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    // Process...
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  
  ctx.putImageData(imageData, 0, 0);
  ```

- **Convolution Filters**: Blur, sharpen, edge detection
  ```javascript
  function applyConvolution(imageData, kernel) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);
    const kSize = Math.sqrt(kernel.length);
    const offset = Math.floor(kSize / 2);
    
    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = 0; ky < kSize; ky++) {
          for (let kx = 0; kx < kSize; kx++) {
            const idx = ((y + ky - offset) * width + (x + kx - offset)) * 4;
            const weight = kernel[ky * kSize + kx];
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
          }
        }
        const idx = (y * width + x) * 4;
        newData[idx] = Math.max(0, Math.min(255, r));
        newData[idx + 1] = Math.max(0, Math.min(255, g));
        newData[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }
    return new ImageData(newData, width, height);
  }
  ```

#### 7.2. Image Loading & Drawing
- **Async Image Loading**: Proper image loading pattern
  ```javascript
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  
  // Usage
  const img = await loadImage('sprite.png');
  ctx.drawImage(img, x, y);
  ```

- **Sprite Sheets**: Draw từ sprite sheet
  ```javascript
  function drawSprite(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh) {
    ctx.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  ```

### 8. OffscreenCanvas & Web Workers

#### 8.1. OffscreenCanvas
- **Main Thread**: Render offscreen để giảm main thread blocking
  ```javascript
  const offscreen = new OffscreenCanvas(width, height);
  const offCtx = offscreen.getContext('2d');
  // Heavy rendering
  offCtx.fillRect(0, 0, width, height);
  // Transfer back
  const bitmap = offscreen.transferToImageBitmap();
  ctx.drawImage(bitmap, 0, 0);
  ```

- **Web Worker**: Render trong worker thread
  ```javascript
  // main.js
  const offscreen = canvas.transferControlToOffscreen();
  worker.postMessage({ canvas: offscreen }, [offscreen]);
  
  // worker.js
  self.onmessage = (e) => {
    const canvas = e.data.canvas;
    const ctx = canvas.getContext('2d');
    // Render in worker
    ctx.fillRect(0, 0, 100, 100);
  };
  ```

### 9. Advanced Text Rendering

#### 9.1. Text API
- **Text Metrics**: Measure text dimensions
  ```javascript
  ctx.font = '48px Arial';
  const metrics = ctx.measureText('Hello');
  console.log(metrics.width); // Text width
  console.log(metrics.actualBoundingBoxAscent); // Height above baseline
  ```

- **Text Alignment**: Control text positioning
  ```javascript
  ctx.textAlign = 'center'; // left, right, center, start, end
  ctx.textBaseline = 'middle'; // top, hanging, middle, alphabetic, ideographic, bottom
  ctx.fillText('Hello', x, y);
  ```

- **Text Path**: Text along a path
  ```javascript
  ctx.font = '30px Arial';
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.stroke();
  // Text along path (requires manual calculation)
  ```

### 10. Retina Display & High DPI

#### 10.1. Device Pixel Ratio
- **High DPI Support**: Support retina displays
  ```javascript
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return ctx;
  }
  ```

### 11. Event Handling & Interaction

#### 11.1. Advanced Event Handling
- **Coordinate Transformation**: Convert screen to canvas coordinates
  ```javascript
  function getCanvasCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }
  ```

- **Hit Testing**: Check if point is inside shape
  ```javascript
  function isPointInPath(ctx, x, y, path) {
    ctx.beginPath();
    // Define path
    return ctx.isPointInPath(x, y);
  }
  
  // For complex shapes
  function isPointInCircle(x, y, centerX, centerY, radius) {
    const dx = x - centerX;
    const dy = y - centerY;
    return dx * dx + dy * dy <= radius * radius;
  }
  ```

- **Drag & Drop**: Implement dragging
  ```javascript
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  
  canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoordinates(canvas, e);
    if (isPointInShape(coords.x, coords.y)) {
      isDragging = true;
      dragStart = coords;
    }
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const coords = getCanvasCoordinates(canvas, e);
      const dx = coords.x - dragStart.x;
      const dy = coords.y - dragStart.y;
      // Update position
    }
  });
  ```

### 12. Export & Serialization

#### 12.1. Export Canvas Content
- **To Data URL**: Export as image
  ```javascript
  const dataURL = canvas.toDataURL('image/png');
  const dataURL = canvas.toDataURL('image/jpeg', 0.9); // quality 0-1
  
  // Download
  const link = document.createElement('a');
  link.download = 'canvas.png';
  link.href = dataURL;
  link.click();
  ```

- **To Blob**: For uploads
  ```javascript
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('image', blob);
    fetch('/upload', { method: 'POST', body: formData });
  }, 'image/png', 1.0);
  ```

### 13. Best Practices & Patterns

#### 13.1. Architecture Patterns
- **Scene Graph**: Hierarchical rendering
  ```javascript
  class SceneNode {
    constructor() {
      this.children = [];
      this.transform = { x: 0, y: 0, rotation: 0, scale: 1 };
    }
    addChild(node) {
      this.children.push(node);
    }
    render(ctx) {
      ctx.save();
      ctx.translate(this.transform.x, this.transform.y);
      ctx.rotate(this.transform.rotation);
      ctx.scale(this.transform.scale, this.transform.scale);
      this.draw(ctx);
      this.children.forEach(child => child.render(ctx));
      ctx.restore();
    }
    draw(ctx) {
      // Override in subclasses
    }
  }
  ```

- **Entity Component System (ECS)**: Game development pattern
  ```javascript
  class Entity {
    constructor() {
      this.components = new Map();
    }
    addComponent(component) {
      this.components.set(component.constructor.name, component);
    }
    getComponent(type) {
      return this.components.get(type);
    }
  }
  
  class RenderComponent {
    render(ctx) { /* ... */ }
  }
  
  class PhysicsComponent {
    update(delta) { /* ... */ }
  }
  ```

#### 13.2. Code Organization
- **Separation of Concerns**: Separate rendering, logic, and data
- **State Management**: Centralized state với observer pattern
- **Resource Management**: Preload và cache resources
- **Error Handling**: Graceful degradation cho unsupported features

### 14. WebGL Integration

#### 14.1. Hybrid 2D/3D
- **WebGL Context**: Sử dụng WebGL cho performance cao
  ```javascript
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  // Hoặc hybrid: 2D cho UI, WebGL cho game objects
  ```

### 15. Testing & Debugging

#### 15.1. Debugging Tools
- **Performance Monitoring**: Measure FPS và frame time
  ```javascript
  let frameCount = 0;
  let lastFPSUpdate = 0;
  function updateFPS(currentTime) {
    frameCount++;
    if (currentTime - lastFPSUpdate >= 1000) {
      console.log('FPS:', frameCount);
      frameCount = 0;
      lastFPSUpdate = currentTime;
    }
  }
  ```

- **Visual Debugging**: Overlay debug info
  ```javascript
  function drawDebugInfo(ctx, x, y, info) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 200, 100);
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`FPS: ${info.fps}`, x + 10, y + 20);
    ctx.restore();
  }
  ```

---

## 📚 Tài liệu tham khảo

- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [HTML5 Canvas Deep Dive](https://joshondesign.com/p/books/canvasdeepdive/toc.html)
- [Canvas Performance Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

---

Bài học này dạy vẽ và animate 2D, nền tảng cho game/graphics web. Với kiến thức senior level, bạn có thể xây dựng các ứng dụng canvas phức tạp, tối ưu hiệu năng và maintainable.