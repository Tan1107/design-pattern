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

---

## 🚀 Kiến thức Senior Level

### 3. Web Audio API - Advanced Topics

#### 3.1. AudioContext Management & State

- **Context State Management**: Quản lý trạng thái và lifecycle
  ```javascript
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Check state
  console.log(audioCtx.state); // 'suspended', 'running', 'closed'
  
  // Resume suspended context (sau user interaction)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      console.log('AudioContext resumed');
    });
  }
  
  // Listen to state changes
  audioCtx.onstatechange = () => {
    console.log('State changed to:', audioCtx.state);
  };
  
  // Close context khi không dùng
  audioCtx.close().then(() => {
    console.log('AudioContext closed');
  });
  ```

- **Sample Rate & Latency**: Tối ưu cho real-time processing
  ```javascript
  const audioCtx = new AudioContext({
    sampleRate: 44100, // hoặc 48000
    latencyHint: 'interactive', // 'balanced', 'playback'
  });
  
  console.log(audioCtx.sampleRate);
  console.log(audioCtx.baseLatency); // seconds
  console.log(audioCtx.outputLatency); // seconds
  ```

#### 3.2. Advanced Audio Routing & Graph Management

- **Complex Routing**: Multiple outputs, parallel processing
  ```javascript
  // Split signal vào nhiều paths
  const source = audioCtx.createBufferSource();
  const splitter = audioCtx.createChannelSplitter(2);
  const merger = audioCtx.createChannelMerger(2);
  
  source.connect(splitter);
  splitter.connect(merger, 0, 0); // Left channel
  splitter.connect(merger, 1, 1); // Right channel
  merger.connect(audioCtx.destination);
  ```

- **Dynamic Graph Modification**: Thêm/xóa nodes trong runtime
  ```javascript
  class AudioGraph {
    constructor(audioCtx) {
      this.ctx = audioCtx;
      this.nodes = new Map();
    }
    
    addNode(name, node) {
      this.nodes.set(name, node);
    }
    
    connect(from, to) {
      const fromNode = this.nodes.get(from);
      const toNode = this.nodes.get(to);
      if (fromNode && toNode) {
        fromNode.connect(toNode);
      }
    }
    
    disconnect(nodeName) {
      const node = this.nodes.get(nodeName);
      if (node) {
        node.disconnect();
      }
    }
    
    insertNode(before, after, newNode) {
      const beforeNode = this.nodes.get(before);
      const afterNode = this.nodes.get(after);
      beforeNode.disconnect();
      beforeNode.connect(newNode);
      newNode.connect(afterNode);
    }
  }
  ```

- **AudioParam Automation**: Scheduled parameter changes
  ```javascript
  const gainNode = audioCtx.createGain();
  const now = audioCtx.currentTime;
  
  // Linear ramp
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + 1);
  gainNode.gain.linearRampToValueAtTime(0, now + 2);
  
  // Exponential ramp (smoother cho volume)
  gainNode.gain.setValueAtTime(0.01, now);
  gainNode.gain.exponentialRampToValueAtTime(1, now + 1);
  
  // Custom curve
  gainNode.gain.setValueCurveAtTime([0, 0.5, 1, 0.5, 0], now, 2);
  
  // Cancel scheduled changes
  gainNode.gain.cancelScheduledValues(now);
  ```

#### 3.3. AudioWorklet & Custom Processors

- **AudioWorklet Setup**: Custom audio processing trong worker thread
  ```javascript
  // worklet-processor.js (file riêng)
  class MyProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        {
          name: 'gain',
          defaultValue: 1.0,
          minValue: 0,
          maxValue: 2,
        },
      ];
    }
    
    constructor() {
      super();
      this.port.onmessage = (e) => {
        // Handle messages from main thread
        console.log('Received:', e.data);
      };
    }
    
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      const gain = parameters.gain;
      
      for (let channel = 0; channel < input.length; channel++) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
        
        for (let i = 0; i < inputChannel.length; i++) {
          // Custom processing
          outputChannel[i] = inputChannel[i] * gain[i];
        }
      }
      
      return true; // Keep processor alive
    }
  }
  
  registerProcessor('my-processor', MyProcessor);
  ```

  ```javascript
  // main.js
  async function setupWorklet() {
    await audioCtx.audioWorklet.addModule('worklet-processor.js');
    const processor = new AudioWorkletNode(audioCtx, 'my-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      parameterData: { gain: 0.5 },
    });
    
    // Connect
    source.connect(processor);
    processor.connect(audioCtx.destination);
    
    // Send messages
    processor.port.postMessage({ command: 'start' });
    processor.port.onmessage = (e) => {
      console.log('From worklet:', e.data);
    };
  }
  ```

#### 3.4. Spatial Audio (3D Positioning)

- **PannerNode**: 3D audio positioning
  ```javascript
  const panner = audioCtx.createPanner();
  panner.panningModel = 'HRTF'; // 'equalpower' hoặc 'HRTF'
  panner.distanceModel = 'inverse'; // 'linear', 'inverse', 'exponential'
  panner.refDistance = 1;
  panner.maxDistance = 10000;
  panner.rolloffFactor = 1;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;
  
  // Set position
  panner.positionX.value = 10;
  panner.positionY.value = 0;
  panner.positionZ.value = 0;
  
  // Set orientation (hướng listener đang nghe)
  panner.orientationX.value = 1;
  panner.orientationY.value = 0;
  panner.orientationZ.value = 0;
  
  source.connect(panner);
  panner.connect(audioCtx.destination);
  ```

- **Listener Position**: Điều chỉnh vị trí listener
  ```javascript
  const listener = audioCtx.listener;
  
  // Set listener position
  listener.positionX.value = 0;
  listener.positionY.value = 0;
  listener.positionZ.value = 0;
  
  // Set listener orientation
  listener.forwardX.value = 0;
  listener.forwardY.value = 0;
  listener.forwardZ.value = -1;
  listener.upX.value = 0;
  listener.upY.value = 1;
  listener.upZ.value = 0;
  ```

#### 3.5. Advanced Effects & Processing

- **Convolution Reverb**: Realistic reverb với impulse response
  ```javascript
  async function loadImpulseResponse(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }
  
  const convolver = audioCtx.createConvolver();
  const impulseResponse = await loadImpulseResponse('reverb-impulse.wav');
  convolver.buffer = impulseResponse;
  convolver.normalize = true;
  
  source.connect(convolver);
  convolver.connect(audioCtx.destination);
  ```

- **Dynamics Processing**: Compressor và Limiter
  ```javascript
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -24; // dB
  compressor.knee.value = 30; // dB
  compressor.ratio.value = 12; // 12:1
  compressor.attack.value = 0.003; // seconds
  compressor.release.value = 0.25; // seconds
  
  source.connect(compressor);
  compressor.connect(audioCtx.destination);
  
  // Limiter (compressor với ratio cao)
  const limiter = audioCtx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.01;
  ```

- **BiquadFilter**: Advanced filtering
  ```javascript
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; // 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'allpass', 'peaking', 'notch'
  filter.frequency.value = 1000; // Hz
  filter.Q.value = 1; // Quality factor
  filter.gain.value = 0; // dB (cho shelving và peaking)
  
  // Automation
  filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 1);
  ```

- **Delay & Feedback**: Echo và delay effects
  ```javascript
  const delay = audioCtx.createDelay(5.0); // Max 5 seconds
  const feedbackGain = audioCtx.createGain();
  const outputGain = audioCtx.createGain();
  
  delay.delayTime.value = 0.3; // 300ms delay
  feedbackGain.gain.value = 0.3; // 30% feedback
  outputGain.gain.value = 0.7; // 70% wet signal
  
  // Feedback loop
  source.connect(delay);
  delay.connect(feedbackGain);
  feedbackGain.connect(delay); // Feedback
  delay.connect(outputGain);
  outputGain.connect(audioCtx.destination);
  source.connect(audioCtx.destination); // Dry signal
  ```

#### 3.6. Audio Analysis & Visualization

- **AnalyserNode**: FFT analysis cho visualization
  ```javascript
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048; // Power of 2: 32, 64, 128, 256, 512, 1024, 2048, 4096
  analyser.smoothingTimeConstant = 0.8; // 0-1, higher = smoother
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  
  const bufferLength = analyser.frequencyBinCount; // fftSize / 2
  const dataArray = new Uint8Array(bufferLength);
  
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  
  function visualize() {
    analyser.getByteFrequencyData(dataArray);
    // hoặc
    analyser.getByteTimeDomainData(dataArray);
    // hoặc
    analyser.getFloatFrequencyData(new Float32Array(bufferLength));
    analyser.getFloatTimeDomainData(new Float32Array(bufferLength));
    
    // Draw visualization
    draw(dataArray);
    requestAnimationFrame(visualize);
  }
  visualize();
  ```

- **Waveform Visualization**: Real-time waveform
  ```javascript
  function drawWaveform(canvas, dataArray) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 255, 0)';
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }
  ```

- **Frequency Spectrum**: FFT frequency analysis
  ```javascript
  function drawFrequencySpectrum(canvas, dataArray) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
    
    const barWidth = (width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height;
      
      const r = barHeight + 25;
      const g = 250 - barHeight;
      const b = 50;
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }
  ```

#### 3.7. Audio Scheduling & Timing

- **Precise Scheduling**: Schedule audio events với sample accuracy
  ```javascript
  class AudioScheduler {
    constructor(audioCtx) {
      this.ctx = audioCtx;
      this.lookahead = 25.0; // ms
      this.scheduleAheadTime = 0.1; // seconds
      this.nextNoteTime = 0.0;
      this.isRunning = false;
    }
    
    start() {
      this.isRunning = true;
      this.nextNoteTime = this.ctx.currentTime;
      this.scheduler();
    }
    
    scheduler() {
      while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
        this.scheduleNote(this.nextNoteTime);
        this.nextNoteTime += 0.5; // 120 BPM
      }
      
      if (this.isRunning) {
        setTimeout(() => this.scheduler(), this.lookahead);
      }
    }
    
    scheduleNote(time) {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.frequency.value = 440;
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      
      osc.start(time);
      osc.stop(time + 0.5);
    }
  }
  ```

- **Tempo & BPM**: Sync với tempo
  ```javascript
  class TempoSync {
    constructor(audioCtx, bpm = 120) {
      this.ctx = audioCtx;
      this.bpm = bpm;
      this.beatDuration = 60 / bpm;
    }
    
    getBeatTime(beatNumber) {
      return beatNumber * this.beatDuration;
    }
    
    scheduleOnBeat(beatNumber, callback) {
      const time = this.ctx.currentTime + this.getBeatTime(beatNumber);
      callback(time);
    }
  }
  ```

#### 3.8. Audio Buffering & Streaming

- **AudioBuffer Management**: Efficient buffer handling
  ```javascript
  class AudioBufferPool {
    constructor(audioCtx, bufferSize = 4096) {
      this.ctx = audioCtx;
      this.bufferSize = bufferSize;
      this.pool = [];
    }
    
    acquire() {
      return this.pool.pop() || this.ctx.createBuffer(2, this.bufferSize, this.ctx.sampleRate);
    }
    
    release(buffer) {
      if (this.pool.length < 10) { // Limit pool size
        this.pool.push(buffer);
      }
    }
  }
  
  // Streaming audio
  async function streamAudio(url) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new AudioDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const audioBuffer = await decoder.decode(value);
      playBuffer(audioBuffer);
    }
  }
  ```

- **Chunked Loading**: Load và play audio chunks
  ```javascript
  class StreamingAudioPlayer {
    constructor(audioCtx) {
      this.ctx = audioCtx;
      this.buffers = [];
      this.currentBuffer = 0;
      this.source = null;
    }
    
    async loadChunk(url, index) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers[index] = audioBuffer;
    }
    
    play() {
      if (this.source) return;
      this.playNext();
    }
    
    playNext() {
      if (this.currentBuffer >= this.buffers.length) {
        this.source = null;
        return;
      }
      
      this.source = this.ctx.createBufferSource();
      this.source.buffer = this.buffers[this.currentBuffer];
      this.source.connect(this.ctx.destination);
      this.source.onended = () => {
        this.currentBuffer++;
        this.playNext();
      };
      this.source.start();
    }
  }
  ```

#### 3.9. Memory Management & Best Practices

- **Buffer Cleanup**: Proper cleanup để tránh memory leaks
  ```javascript
  class AudioManager {
    constructor() {
      this.audioCtx = new AudioContext();
      this.activeSources = new Set();
      this.bufferCache = new Map();
    }
    
    createSource(buffer) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.onended = () => {
        this.activeSources.delete(source);
      };
      this.activeSources.add(source);
      return source;
    }
    
    cleanup() {
      this.activeSources.forEach(source => {
        try {
          source.stop();
          source.disconnect();
        } catch (e) {
          // Already stopped
        }
      });
      this.activeSources.clear();
      this.bufferCache.clear();
    }
  }
  ```

- **Error Handling**: Robust error handling
  ```javascript
  async function safeDecodeAudioData(audioCtx, arrayBuffer) {
    try {
      return await audioCtx.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error decoding audio:', error);
      // Fallback hoặc retry
      return null;
    }
  }
  
  // Handle AudioContext errors
  audioCtx.onstatechange = () => {
    if (audioCtx.state === 'interrupted') {
      // Handle interruption (e.g., phone call)
      audioCtx.resume();
    }
  };
  ```

### 4. Performance API - Advanced Topics

#### 4.1. Performance Observer API

- **PerformanceObserver**: Observe performance metrics
  ```javascript
  // Observe navigation timing
  const navObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Navigation:', entry.name, entry.duration);
    }
  });
  navObserver.observe({ entryTypes: ['navigation'] });
  
  // Observe resource timing
  const resourceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 1000) {
        console.warn('Slow resource:', entry.name, entry.duration);
      }
    }
  });
  resourceObserver.observe({ entryTypes: ['resource'] });
  
  // Observe paint timing
  const paintObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${entry.name}:`, entry.startTime);
    }
  });
  paintObserver.observe({ entryTypes: ['paint'] });
  
  // Observe measure/mark
  const measureObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Measure:', entry.name, entry.duration);
    }
  });
  measureObserver.observe({ entryTypes: ['measure', 'mark'] });
  ```

#### 4.2. Web Vitals & Core Metrics

- **Largest Contentful Paint (LCP)**: Measure loading performance
  ```javascript
  function observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      
      // Good: < 2.5s, Needs improvement: 2.5-4s, Poor: > 4s
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
  ```

- **First Input Delay (FID)**: Measure interactivity
  ```javascript
  function observeFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime;
        console.log('FID:', fid);
        
        // Good: < 100ms, Needs improvement: 100-300ms, Poor: > 300ms
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  }
  ```

- **Cumulative Layout Shift (CLS)**: Measure visual stability
  ```javascript
  function observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log('CLS:', clsValue);
      
      // Good: < 0.1, Needs improvement: 0.1-0.25, Poor: > 0.25
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  }
  ```

- **First Contentful Paint (FCP)**: First paint timing
  ```javascript
  function getFCP() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      console.log('FCP:', fcpEntry.startTime);
      // Good: < 1.8s, Needs improvement: 1.8-3s, Poor: > 3s
    }
  }
  ```

#### 4.3. Long Tasks API

- **Long Task Detection**: Identify blocking tasks
  ```javascript
  function observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
            attribution: entry.attribution,
          });
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  }
  ```

#### 4.4. Resource Timing API

- **Detailed Resource Analysis**: Analyze resource loading
  ```javascript
  function analyzeResources() {
    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(resource => {
      const timing = {
        name: resource.name,
        duration: resource.duration,
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        tcp: resource.connectEnd - resource.connectStart,
        request: resource.responseStart - resource.requestStart,
        response: resource.responseEnd - resource.responseStart,
        transfer: resource.transferSize,
        size: resource.decodedBodySize,
      };
      
      console.log('Resource timing:', timing);
    });
  }
  
  // Calculate resource timing phases
  function getResourceTimingPhases(entry) {
    return {
      redirect: entry.redirectEnd - entry.redirectStart,
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      domProcessing: entry.domContentLoadedEventEnd - entry.responseEnd,
      load: entry.loadEventEnd - entry.domContentLoadedEventEnd,
    };
  }
  ```

#### 4.5. User Timing API

- **Custom Performance Marks**: Mark important points
  ```javascript
  // Mark start
  performance.mark('app-start');
  
  // Do work
  await initializeApp();
  performance.mark('app-initialized');
  
  // Measure
  performance.measure('app-init-time', 'app-start', 'app-initialized');
  
  // Get measurements
  const measures = performance.getEntriesByType('measure');
  measures.forEach(measure => {
    console.log(`${measure.name}: ${measure.duration}ms`);
  });
  
  // Clear marks
  performance.clearMarks();
  performance.clearMeasures();
  ```

- **Performance Budget**: Set và monitor budgets
  ```javascript
  class PerformanceBudget {
    constructor(budgets) {
      this.budgets = budgets;
      this.metrics = {};
    }
    
    checkBudget(metric, value) {
      const budget = this.budgets[metric];
      if (!budget) return;
      
      this.metrics[metric] = value;
      
      if (value > budget) {
        console.warn(`Budget exceeded: ${metric}`, {
          actual: value,
          budget: budget,
          overage: value - budget,
        });
      }
    }
    
    report() {
      return Object.entries(this.metrics).map(([metric, value]) => ({
        metric,
        value,
        budget: this.budgets[metric],
        status: value <= this.budgets[metric] ? 'pass' : 'fail',
      }));
    }
  }
  
  const budget = new PerformanceBudget({
    fcp: 1800,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    tti: 3800,
  });
  ```

#### 4.6. Real User Monitoring (RUM)

- **RUM Implementation**: Collect và send metrics
  ```javascript
  class RUMCollector {
    constructor(endpoint) {
      this.endpoint = endpoint;
      this.metrics = {};
      this.setupObservers();
    }
    
    setupObservers() {
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // FID
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = entry.processingStart - entry.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });
      
      // CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }
    
    collect() {
      // Navigation timing
      const navTiming = performance.timing;
      this.metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
      this.metrics.domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.navigationStart;
      this.metrics.loadComplete = navTiming.loadEventEnd - navTiming.navigationStart;
      
      // Resource timing
      const resources = performance.getEntriesByType('resource');
      this.metrics.resourceCount = resources.length;
      this.metrics.totalResourceSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
      return this.metrics;
    }
    
    send() {
      const data = this.collect();
      // Send to analytics endpoint
      navigator.sendBeacon(this.endpoint, JSON.stringify(data));
    }
  }
  ```

#### 4.7. Performance Profiling

- **Memory Profiling**: Monitor memory usage
  ```javascript
  function getMemoryInfo() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }
  
  // Monitor memory over time
  setInterval(() => {
    const mem = getMemoryInfo();
    if (mem && mem.percentage > 80) {
      console.warn('High memory usage:', mem);
    }
  }, 5000);
  ```

- **Frame Rate Monitoring**: Monitor rendering performance
  ```javascript
  class FrameRateMonitor {
    constructor() {
      this.frames = [];
      this.lastTime = performance.now();
      this.monitoring = false;
    }
    
    start() {
      this.monitoring = true;
      this.monitor();
    }
    
    monitor() {
      if (!this.monitoring) return;
      
      const currentTime = performance.now();
      const delta = currentTime - this.lastTime;
      const fps = 1000 / delta;
      
      this.frames.push(fps);
      if (this.frames.length > 60) {
        this.frames.shift();
      }
      
      this.lastTime = currentTime;
      requestAnimationFrame(() => this.monitor());
    }
    
    getAverageFPS() {
      return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    }
    
    getMinFPS() {
      return Math.min(...this.frames);
    }
  }
  ```

#### 4.8. Performance Best Practices

- **Lazy Loading Monitoring**: Track lazy loaded resources
  ```javascript
  function trackLazyLoad(element) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          performance.mark(`${element.id}-lazy-load-start`);
          // Load resource
          loadResource(element).then(() => {
            performance.mark(`${element.id}-lazy-load-end`);
            performance.measure(
              `${element.id}-lazy-load`,
              `${element.id}-lazy-load-start`,
              `${element.id}-lazy-load-end`
            );
          });
          observer.unobserve(element);
        }
      });
    });
    observer.observe(element);
  }
  ```

- **Performance Budget Enforcement**: Enforce budgets
  ```javascript
  class PerformanceEnforcer {
    constructor(budgets) {
      this.budgets = budgets;
      this.setupMonitoring();
    }
    
    setupMonitoring() {
      // Monitor LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1].renderTime || entries[entries.length - 1].loadTime;
        if (lcp > this.budgets.lcp) {
          this.onBudgetExceeded('lcp', lcp);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    onBudgetExceeded(metric, value) {
      console.error(`Performance budget exceeded: ${metric} = ${value}ms`);
      // Trigger alerts, reduce quality, etc.
    }
  }
  ```

---

## 📚 Tài liệu tham khảo

- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [Web Audio API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)

---

Bài học này cung cấp nền tảng cho multimedia và optimization trong web apps. Với kiến thức senior level, bạn có thể xây dựng các ứng dụng audio phức tạp, monitor và optimize performance một cách chuyên nghiệp.