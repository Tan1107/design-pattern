# README: 16_WebSockets

## Tổng quan kiến thức

Bài học này xây dựng ứng dụng chat nhóm thời gian thực sử dụng **WebSockets thuần** (không Socket.IO), với server Node.js/Express và client JavaScript.

---

## 📚 Mục Lục

1. [WebSockets Cơ bản](#1-websockets-cơ-bản)
2. [WebSocket Protocol Deep Dive (RFC 6455)](#2-websocket-protocol-deep-dive-rfc-6455)
3. [HTTP vs WebSocket - So sánh kỹ thuật](#3-http-vs-websocket---so-sánh-kỹ-thuật)
4. [Server-Side Architecture](#4-server-side-architecture)
5. [Client-Side Implementation](#5-client-side-implementation)
6. [Design Patterns trong dự án](#6-design-patterns-trong-dự-án)
7. [Security Best Practices](#7-security-best-practices)
8. [Scaling Strategies](#8-scaling-strategies)
9. [Performance Optimization](#9-performance-optimization)
10. [Reconnection & Resilience](#10-reconnection--resilience)
11. [Testing Strategies](#11-testing-strategies)
12. [Monitoring & Observability](#12-monitoring--observability)
13. [Production Deployment](#13-production-deployment)
14. [Alternative Technologies](#14-alternative-technologies)
15. [Common Pitfalls & Solutions](#15-common-pitfalls--solutions)
16. [Cấu trúc folder](#cấu-trúc-folder)
17. [Chạy demo](#chạy-demo)

---

## 1. WebSockets Cơ bản

### 1.1 Khái niệm Core
- **Kết nối**: `new WebSocket(url)`, events: `onopen`, `onmessage`, `onclose`, `onerror`
- **Data**: JSON messages (e.g., `{"type": "chat", "text": "hello"}`)
- **Full-duplex**: Server/client gửi/nhận bất cứ lúc nào mà không cần request/response

### 1.2 WebSocket ReadyState
```javascript
WebSocket.CONNECTING = 0  // Connection chưa thiết lập
WebSocket.OPEN = 1        // Connection sẵn sàng communicate
WebSocket.CLOSING = 2     // Connection đang đóng
WebSocket.CLOSED = 3      // Connection đã đóng hoặc không thể mở
```

### 1.3 Chi Tiết WebSocket Events

| Event | Trigger | Parameters | Use Case |
|-------|---------|------------|----------|
| `onopen` | Handshake thành công | Event object | Gửi initial message, setup UI |
| `onmessage` | Nhận data từ server | `event.data`, `event.origin` | Parse JSON, update UI |
| `onclose` | Connection đóng | `event.code`, `event.reason`, `event.wasClean` | Cleanup, retry connect |
| `onerror` | Lỗi connection | Event object | Log error, notify user |

### 1.4 Close Codes (RFC 6455)
```javascript
1000 // Normal closure - connection completed successfully
1001 // Going away - server shutting down or browser navigating
1002 // Protocol error
1003 // Unsupported data type
1006 // Abnormal closure (no close frame received)
1007 // Invalid payload data
1008 // Policy violation
1009 // Message too big
1010 // Missing extension
1011 // Internal server error
1012 // Service restart
1013 // Try again later
1015 // TLS handshake failure
```

---

## 2. WebSocket Protocol Deep Dive (RFC 6455)

### 2.1 Handshake Process

WebSocket bắt đầu với HTTP Upgrade request:

```http
GET /chat/room1 HTTP/1.1
Host: localhost:3000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://localhost:3000
```

Server response:
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

### 2.2 Sec-WebSocket-Accept Calculation
```javascript
const crypto = require('crypto');
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function calculateAccept(key) {
  return crypto
    .createHash('sha1')
    .update(key + GUID)
    .digest('base64');
}
```

### 2.3 Frame Structure

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

### 2.4 Opcodes
  ```javascript
0x0  // Continuation frame
0x1  // Text frame (UTF-8)
0x2  // Binary frame
0x8  // Connection close
0x9  // Ping
0xA  // Pong
```

### 2.5 Message Fragmentation
```javascript
// Large message được chia thành fragments
// Frame 1: FIN=0, opcode=0x1 (text)
// Frame 2: FIN=0, opcode=0x0 (continuation)
// Frame N: FIN=1, opcode=0x0 (final continuation)
```

---

## 3. HTTP vs WebSocket - So sánh kỹ thuật

### 3.1 Overhead Comparison

| Metric | HTTP Request | WebSocket Message |
|--------|--------------|-------------------|
| Headers | ~800 bytes (typical) | 2-14 bytes (frame header) |
| Latency | Full RTT + TCP overhead | Minimal (persistent connection) |
| Connection | New per request (keep-alive helps) | Single persistent |
| State | Stateless | Stateful |

### 3.2 Use Case Matrix

| Scenario | Best Choice | Reason |
|----------|-------------|--------|
| Real-time chat | WebSocket | Bidirectional, low latency |
| Live notifications | WebSocket/SSE | Push from server |
| File upload | HTTP | Request-response model |
| REST API | HTTP | Stateless, cacheable |
| Gaming | WebSocket | High frequency updates |
| Stock ticker | WebSocket | Continuous data stream |
| Form submission | HTTP | One-time operation |

### 3.3 Connection Lifecycle Cost
```
HTTP (per request):
  DNS lookup → TCP handshake → TLS handshake → HTTP request → Response → Close
  Time: ~100-500ms (first request)

WebSocket:
  DNS lookup → TCP handshake → TLS handshake → WS handshake → [Messages...] → Close
  Initial: ~100-500ms, Subsequent: ~1-10ms per message
```

---

## 4. Server-Side Architecture

### 4.1 Components

- **express-ws**: Middleware thêm WebSocket routes (`app.ws("/chat/:roomName")`)
- **Room**: Quản lý phòng chat (join, leave, broadcast), singleton với Map
- **ChatUser**: Xử lý user (handleJoin, handleChat, handlePrivateChat, etc.)
- **jokes.js**: API Integration với axios

### 4.2 Message Router Pattern
```javascript
// ChatUser.js - Message type routing
handleMessage(jsonData) {
  let msg = JSON.parse(jsonData);
  
  const handlers = {
    'join': () => this.handleJoin(msg.name),
    'chat': () => this.handleChat(msg.text),
    'get-joke': () => this.handleGetJoke(),
    'get-members': () => this.handleGetMembers(),
    'change-username': () => this.handleChangeUsername(msg.text),
    'priv-chat': () => this.handlePrivateChat(msg.recipient, msg.text),
  };
  
  const handler = handlers[msg.type];
  if (handler) handler();
  else throw new Error(`bad message: ${msg.type}`);
}
```

### 4.3 Connection Binding Pattern
```javascript
// app.js - Bind ws.send to user instance
const user = new ChatUser(
  ws.send.bind(ws),  // Critical: preserve `this` context
  req.params.roomName
);
```

---

## 5. Client-Side Implementation

### 5.1 Connection Setup
```javascript
const socket = new WebSocket(`ws://localhost:3000/chat/${roomName}`);

socket.onopen = (evt) => {
  socket.send(JSON.stringify({ type: "join", name: username }));
};
```

### 5.2 Message Type Handler Pattern
```javascript
socket.onmessage = (evt) => {
  const msg = JSON.parse(evt.data);
  
  const renderers = {
    'note': () => renderSystemMessage(msg),
    'chat': () => renderChatMessage(msg),
    'priv-chat': () => renderPrivateMessage(msg),
  };
  
  (renderers[msg.type] || (() => console.warn('Unknown type')))();
};
```

### 5.3 Command Parser Pattern
```javascript
function parseCommand(input) {
  const commands = {
    '/joke': () => ({ type: 'get-joke' }),
    '/members': () => ({ type: 'get-members' }),
    '/nick': (args) => ({ type: 'change-username', text: args[0] }),
    '/priv': (args) => ({ type: 'priv-chat', recipient: args[0], text: args.slice(1).join(' ') }),
  };
  
  const [cmd, ...args] = input.split(' ');
  return commands[cmd] ? commands[cmd](args) : { type: 'chat', text: input };
}
```

---

## 6. Design Patterns trong dự án

### 6.1 Registry Pattern (Room.js)
```javascript
// Singleton registry - quản lý instances globally
const rooms = new Map();

class Room {
  static get(roomName) {
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Room(roomName));
    }
    return rooms.get(roomName);
  }
}
```

**Ưu điểm:**
- Encapsulation: Client không cần biết về storage
- Lazy initialization: Room chỉ tạo khi cần
- Singleton per key: Đảm bảo một room name = một instance

### 6.2 Observer Pattern (Broadcast)
```javascript
class Room {
  constructor() {
    this.members = new Set(); // observers
  }
  
  join(member) { this.members.add(member); }    // subscribe
  leave(member) { this.members.delete(member); } // unsubscribe
  
  broadcast(data) {  // notify all
    for (let member of this.members) {
      member.send(JSON.stringify(data));
    }
  }
}
```

### 6.3 Dependency Injection (ChatUser)
```javascript
// Constructor injection - dễ test, loose coupling
class ChatUser {
  constructor(send, roomName) {
    this._send = send;  // Inject send function
    this.room = Room.get(roomName);
  }
}

// Usage in app.js
const user = new ChatUser(ws.send.bind(ws), roomName);

// Testing - inject mock
const mockSend = jest.fn();
const user = new ChatUser(mockSend, 'test-room');
```

### 6.4 Command Pattern (Message Handling)
```javascript
// Các message types là commands
const commands = {
  join: new JoinCommand(),
  chat: new ChatCommand(),
  'get-joke': new JokeCommand(),
};

// Execute
commands[msg.type].execute(this, msg);
```

---

## 7. Security Best Practices

### 7.1 Authentication Strategies

#### JWT Authentication
```javascript
// Server-side validation
const jwt = require('jsonwebtoken');

  app.ws("/chat/:roomName", (ws, req) => {
  const token = req.query.token || req.headers['sec-websocket-protocol'];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = new ChatUser(ws.send.bind(ws), req.params.roomName, decoded.userId);
  } catch (err) {
    ws.close(4001, 'Unauthorized');
  }
  });
  ```

#### Session-based Authentication
  ```javascript
const session = require('express-session');
const sharedsession = require('express-socket.io-session');

// Validate session before WebSocket upgrade
app.use((req, res, next) => {
  if (req.ws && !req.session.userId) {
    return res.status(401).send('Unauthorized');
  }
  next();
});
```

### 7.2 Origin Validation
  ```javascript
app.ws("/chat/:roomName", (ws, req) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://myapp.com', 'https://www.myapp.com'];
  
  if (!allowedOrigins.includes(origin)) {
    ws.close(4003, 'Forbidden origin');
    return;
  }
});
```

### 7.3 Input Validation & Sanitization
```javascript
const sanitizeHtml = require('sanitize-html');
const Joi = require('joi');

const messageSchema = Joi.object({
  type: Joi.string().valid('join', 'chat', 'get-joke', 'get-members').required(),
  name: Joi.string().alphanum().min(1).max(30),
  text: Joi.string().max(1000),
  recipient: Joi.string().alphanum().max(30),
});

handleMessage(jsonData) {
  let msg;
  try {
    msg = JSON.parse(jsonData);
  } catch {
    return this.sendError('Invalid JSON');
  }
  
  const { error, value } = messageSchema.validate(msg);
  if (error) {
    return this.sendError(error.message);
  }
  
  // Sanitize text content
  if (value.text) {
    value.text = sanitizeHtml(value.text, { allowedTags: [], allowedAttributes: {} });
  }
  
  // Process validated message
}
```

### 7.4 Rate Limiting
```javascript
const rateLimit = new Map();

function checkRateLimit(userId, limit = 10, window = 1000) {
  const now = Date.now();
  const userLimits = rateLimit.get(userId) || { count: 0, resetAt: now + window };
  
  if (now > userLimits.resetAt) {
    userLimits.count = 0;
    userLimits.resetAt = now + window;
  }
  
  if (userLimits.count >= limit) {
    return false; // Rate limited
  }
  
  userLimits.count++;
  rateLimit.set(userId, userLimits);
  return true;
}

// Usage
handleMessage(data) {
  if (!checkRateLimit(this.userId)) {
    return this.send(JSON.stringify({ type: 'error', text: 'Rate limited' }));
  }
  // Process message
}
```

### 7.5 DoS Protection
```javascript
// Connection limits per IP
const connectionsPerIP = new Map();
const MAX_CONNECTIONS_PER_IP = 10;

app.ws("/chat/:roomName", (ws, req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const current = connectionsPerIP.get(ip) || 0;
  
  if (current >= MAX_CONNECTIONS_PER_IP) {
    ws.close(4029, 'Too many connections');
    return;
  }
  
  connectionsPerIP.set(ip, current + 1);
  
  ws.on('close', () => {
    connectionsPerIP.set(ip, connectionsPerIP.get(ip) - 1);
  });
});

// Message size limits
const MAX_MESSAGE_SIZE = 64 * 1024; // 64KB

handleMessage(data) {
  if (data.length > MAX_MESSAGE_SIZE) {
    return this.sendError('Message too large');
  }
}
```

### 7.6 XSS Prevention (Client-side)
```javascript
// BAD - vulnerable to XSS
item.innerHTML = `<b>${msg.name}:</b> ${msg.text}`;

// GOOD - use textContent
const item = document.createElement('li');
const nameSpan = document.createElement('b');
nameSpan.textContent = msg.name + ': ';
item.appendChild(nameSpan);
item.appendChild(document.createTextNode(msg.text));
```

---

## 8. Scaling Strategies

### 8.1 Horizontal Scaling Architecture
```
                    ┌─────────────┐
                    │ Load        │
                    │ Balancer    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ WS Server 1 │ │ WS Server 2 │ │ WS Server 3 │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                    ┌─────────────┐
                    │ Redis       │
                    │ Pub/Sub     │
                    └─────────────┘
```

### 8.2 Redis Pub/Sub Implementation
```javascript
const Redis = require('ioredis');
const pub = new Redis();
const sub = new Redis();

// Server 1: Subscribe to room channel
sub.subscribe('room:general');
sub.on('message', (channel, message) => {
  const data = JSON.parse(message);
  // Broadcast to local connections only
  localRoom.broadcastLocal(data);
});

// When user sends message
handleChat(text) {
  const message = { name: this.name, type: 'chat', text };
  // Publish to Redis (all servers receive)
  pub.publish(`room:${this.room.name}`, JSON.stringify(message));
}
```

### 8.3 Sticky Sessions (Load Balancer)
```nginx
# Nginx upstream with sticky sessions
upstream websocket_servers {
    ip_hash;  # Sticky sessions based on client IP
    server ws1.example.com:3000;
    server ws2.example.com:3000;
    server ws3.example.com:3000;
}

server {
    location /chat {
        proxy_pass http://websocket_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 8.4 Room Sharding
```javascript
// Consistent hashing for room distribution
const hashRing = require('hashring');
const ring = new hashRing(['server1:3000', 'server2:3000', 'server3:3000']);

function getServerForRoom(roomName) {
  return ring.get(roomName);
}

// Room chỉ tồn tại trên 1 server → không cần Pub/Sub cho internal room messages
```

### 8.5 Connection Pooling với Redis Adapter
```javascript
const { createAdapter } = require('@socket.io/redis-adapter');

// Socket.IO với Redis adapter (nếu migrate từ WS thuần)
io.adapter(createAdapter(pubClient, subClient));
```

---

## 9. Performance Optimization

### 9.1 Binary Protocols

#### MessagePack (thay JSON)
```javascript
const msgpack = require('msgpack-lite');

// Server
  broadcast(data) {
  const binary = msgpack.encode(data);
  for (let member of this.members) {
    member.sendBinary(binary);
  }
}

// Client
socket.binaryType = 'arraybuffer';
socket.onmessage = (evt) => {
  const data = msgpack.decode(new Uint8Array(evt.data));
};
```

#### Protocol Buffers
```protobuf
// chat.proto
message ChatMessage {
  string type = 1;
  string name = 2;
  string text = 3;
  int64 timestamp = 4;
}
```

### 9.2 Compression

#### Per-message Compression (permessage-deflate)
```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 3000,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024 // Chỉ compress messages > 1KB
  }
});
```

### 9.3 Message Batching
```javascript
class BatchedBroadcaster {
  constructor(room, batchInterval = 50) {
    this.room = room;
    this.queue = [];
    this.batchInterval = batchInterval;
    
    setInterval(() => this.flush(), this.batchInterval);
  }
  
  add(message) {
    this.queue.push(message);
  }
  
  flush() {
    if (this.queue.length === 0) return;
    
    const batch = { type: 'batch', messages: this.queue };
    this.room.broadcast(batch);
    this.queue = [];
  }
}
```

### 9.4 Connection Pooling
```javascript
// Reuse connections for external services
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000
});

const apiClient = axios.create({
  httpsAgent,
  timeout: 5000
});
```

### 9.5 Memory Optimization
```javascript
// Object pooling for frequent allocations
class MessagePool {
  constructor(size = 1000) {
    this.pool = Array(size).fill(null).map(() => ({}));
    this.index = 0;
  }
  
  acquire() {
    const obj = this.pool[this.index];
    this.index = (this.index + 1) % this.pool.length;
    return obj;
  }
  
  release(obj) {
    Object.keys(obj).forEach(key => delete obj[key]);
  }
}
```

---

## 10. Reconnection & Resilience

### 10.1 Exponential Backoff
```javascript
class ReconnectingWebSocket {
  constructor(url) {
    this.url = url;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.baseDelay = 1000;
    this.maxDelay = 30000;
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onopen?.();
    };
    
    this.ws.onclose = (evt) => {
      if (evt.code !== 1000) { // Abnormal closure
        this.scheduleReconnect();
      }
    };
    
    this.ws.onerror = () => this.scheduleReconnect();
  }
  
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000,
      this.maxDelay
    );
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      // Queue message for later
      this.messageQueue = this.messageQueue || [];
      this.messageQueue.push(data);
    }
  }
}
```

### 10.2 Heartbeat / Ping-Pong
```javascript
// Server-side
const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 10000;

app.ws("/chat/:roomName", (ws, req) => {
  ws.isAlive = true;
  
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  const heartbeat = setInterval(() => {
    if (!ws.isAlive) {
      clearInterval(heartbeat);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  }, HEARTBEAT_INTERVAL);
  
  ws.on('close', () => clearInterval(heartbeat));
});

// Client-side
class HeartbeatWebSocket {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.heartbeatInterval = null;
    
    this.ws.onopen = () => {
      this.startHeartbeat();
    };
    
    this.ws.onclose = () => {
      this.stopHeartbeat();
    };
  }
  
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
```

### 10.3 Message Queue với Offline Support
```javascript
class OfflineCapableSocket {
  constructor(url) {
    this.url = url;
    this.messageQueue = [];
    this.connected = false;
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.connected = true;
      this.flushQueue();
    };
    
    this.ws.onclose = () => {
      this.connected = false;
    };
  }
  
  send(message) {
    if (this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Store in IndexedDB for persistence
      this.messageQueue.push({
        message,
        timestamp: Date.now()
      });
      this.persistQueue();
    }
  }
  
  async flushQueue() {
    const queue = await this.loadPersistedQueue();
    for (const item of queue) {
      this.ws.send(JSON.stringify(item.message));
    }
    this.clearPersistedQueue();
  }
  
  async persistQueue() {
    // Use IndexedDB for persistence
    localStorage.setItem('wsQueue', JSON.stringify(this.messageQueue));
  }
}
```

---

## 11. Testing Strategies

### 11.1 Unit Testing
```javascript
// ChatUser.test.js
const ChatUser = require('./ChatUser');

describe('ChatUser', () => {
  let mockSend;
  let user;
  
  beforeEach(() => {
    mockSend = jest.fn();
    user = new ChatUser(mockSend, 'test-room');
  });
  
  test('handleJoin sets name and broadcasts', () => {
    user.handleJoin('alice');
    
    expect(user.name).toBe('alice');
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining('alice joined')
    );
  });
  
  test('handleChat broadcasts message', () => {
    user.handleJoin('alice');
    user.handleChat('hello');
    
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining('"type":"chat"')
    );
  });
});
```

### 11.2 Integration Testing
```javascript
// app.test.js
const WebSocket = require('ws');
const app = require('./app');

describe('WebSocket Chat', () => {
  let server;
  let ws1, ws2;
  
  beforeAll((done) => {
    server = app.listen(3001, done);
  });
  
  afterAll((done) => {
    ws1?.close();
    ws2?.close();
    server.close(done);
  });
  
  test('users can join and receive messages', (done) => {
    ws1 = new WebSocket('ws://localhost:3001/chat/test');
    ws2 = new WebSocket('ws://localhost:3001/chat/test');
    
    let messagesReceived = 0;
    
    ws1.on('open', () => {
      ws1.send(JSON.stringify({ type: 'join', name: 'alice' }));
    });
    
    ws2.on('open', () => {
      ws2.send(JSON.stringify({ type: 'join', name: 'bob' }));
    });
    
    ws2.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.text?.includes('alice joined')) {
        messagesReceived++;
        if (messagesReceived >= 1) done();
      }
    });
  });
});
```

### 11.3 Load Testing với Artillery
```yaml
# artillery-config.yml
config:
  target: "ws://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Chat user"
    engine: "ws"
    flow:
      - send:
          payload: '{"type":"join","name":"user_{{$randomNumber(1,10000)}}"}'
      - think: 1
      - loop:
          - send:
              payload: '{"type":"chat","text":"Hello {{$randomString(20)}}"}'
          - think: 2
        count: 10
```

### 11.4 Chaos Testing
```javascript
// chaos-test.js
class ChaosMonkey {
  constructor(connections) {
    this.connections = connections;
  }
  
  // Randomly disconnect users
  randomDisconnect(probability = 0.1) {
    this.connections.forEach(conn => {
      if (Math.random() < probability) {
        conn.close(1006, 'Chaos monkey strike');
      }
    });
  }
  
  // Inject latency
  injectLatency(minMs = 100, maxMs = 5000) {
    const originalSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
      const delay = minMs + Math.random() * (maxMs - minMs);
      setTimeout(() => originalSend.call(this, data), delay);
    };
  }
  
  // Simulate network partition
  simulatePartition(duration = 5000) {
    const originalSend = WebSocket.prototype.send;
    WebSocket.prototype.send = () => {}; // Drop all messages
    
    setTimeout(() => {
      WebSocket.prototype.send = originalSend;
    }, duration);
  }
}
```

---

## 12. Monitoring & Observability

### 12.1 Metrics Collection
```javascript
const prometheus = require('prom-client');

// Metrics
const wsConnectionsGauge = new prometheus.Gauge({
  name: 'ws_connections_total',
  help: 'Total WebSocket connections',
  labelNames: ['room']
});

const wsMessagesCounter = new prometheus.Counter({
  name: 'ws_messages_total',
  help: 'Total WebSocket messages',
  labelNames: ['type', 'room']
});

const wsMessageLatency = new prometheus.Histogram({
  name: 'ws_message_latency_seconds',
  help: 'Message processing latency',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

// Usage
class Room {
  join(member) {
    this.members.add(member);
    wsConnectionsGauge.inc({ room: this.name });
  }
  
  leave(member) {
    this.members.delete(member);
    wsConnectionsGauge.dec({ room: this.name });
  }
}

handleMessage(data) {
  const start = Date.now();
  // Process message...
  wsMessageLatency.observe((Date.now() - start) / 1000);
  wsMessagesCounter.inc({ type: msg.type, room: this.room.name });
}
```

### 12.2 Structured Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('User joined', {
  event: 'join',
  userId: user.id,
  room: room.name,
  timestamp: new Date().toISOString()
});

logger.error('Message handling failed', {
  event: 'message_error',
  error: err.message,
  stack: err.stack,
  userId: user.id
});
```

### 12.3 Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    connections: getTotalConnections(),
    rooms: getRoomCount(),
    memory: process.memoryUsage(),
  };
  
  res.json(health);
});

app.get('/health/ready', (req, res) => {
  // Check dependencies
  const checks = {
    redis: checkRedisConnection(),
    database: checkDatabaseConnection(),
  };
  
  const allHealthy = Object.values(checks).every(v => v);
  res.status(allHealthy ? 200 : 503).json(checks);
});
```

### 12.4 Distributed Tracing
```javascript
const { trace, context, propagation } = require('@opentelemetry/api');

const tracer = trace.getTracer('websocket-chat');

handleMessage(data) {
  const span = tracer.startSpan('handle_message', {
    attributes: {
      'message.type': data.type,
      'user.id': this.userId,
      'room.name': this.room.name
    }
  });
  
  try {
    // Process message
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    span.recordException(err);
  } finally {
    span.end();
  }
}
```

---

## 13. Production Deployment

### 13.1 PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'websocket-chat',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 13.2 Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

volumes:
  redis_data:
```

### 13.3 Nginx WebSocket Proxy
```nginx
# nginx.conf
upstream websocket {
    least_conn;
    server app:3000;
}

server {
    listen 80;
    server_name example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location /chat {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
    }
    
    location / {
        proxy_pass http://websocket;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 13.4 Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: websocket-chat
spec:
  replicas: 3
  selector:
    matchLabels:
      app: websocket-chat
  template:
    metadata:
      labels:
        app: websocket-chat
    spec:
      containers:
      - name: app
        image: websocket-chat:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: websocket-chat
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: websocket-chat
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: websocket-chat
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/websocket-services: "websocket-chat"
spec:
  rules:
  - host: chat.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: websocket-chat
            port:
              number: 80
```

---

## 14. Alternative Technologies

### 14.1 Comparison Matrix

| Technology | Bidirectional | Browser Support | Use Case |
|------------|---------------|-----------------|----------|
| WebSocket | ✅ Full duplex | ✅ All modern | Real-time chat, gaming |
| SSE | ❌ Server→Client only | ✅ All modern | Notifications, feeds |
| Long Polling | ⚠️ Simulated | ✅ All | Fallback, legacy |
| WebTransport | ✅ Full duplex | ⚠️ Chrome/Edge | Next-gen, UDP support |
| gRPC-Web | ✅ Streaming | ⚠️ Via proxy | Microservices |

### 14.2 Server-Sent Events (SSE)
```javascript
// Server
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Subscribe to events
  eventEmitter.on('message', sendEvent);
  
  req.on('close', () => {
    eventEmitter.off('message', sendEvent);
  });
});

// Client
const eventSource = new EventSource('/events');
eventSource.onmessage = (evt) => {
  console.log(JSON.parse(evt.data));
};
```

### 14.3 WebTransport (HTTP/3)
```javascript
// Client (experimental)
const transport = new WebTransport('https://example.com/chat');
await transport.ready;

const writer = transport.datagrams.writable.getWriter();
const reader = transport.datagrams.readable.getReader();

// Send unreliable datagram
await writer.write(new TextEncoder().encode('hello'));

// Receive
const { value } = await reader.read();
console.log(new TextDecoder().decode(value));
```

### 14.4 Socket.IO vs Raw WebSocket

| Feature | Raw WebSocket | Socket.IO |
|---------|---------------|-----------|
| Fallback | ❌ | ✅ Long polling |
| Auto-reconnect | ❌ Manual | ✅ Built-in |
| Rooms | ❌ Manual | ✅ Built-in |
| Namespaces | ❌ | ✅ |
| Binary | ✅ | ✅ |
| Broadcast | ❌ Manual | ✅ Built-in |
| Acknowledgments | ❌ Manual | ✅ Built-in |
| Bundle size | 0KB | ~40KB |

---

## 15. Common Pitfalls & Solutions

### 15.1 Memory Leaks

**Problem**: Ghost users tồn tại khi connection đứt không clean
```javascript
// BAD: User không được remove nếu close event không fire
ws.on('close', () => user.handleClose());
```

**Solution**: Heartbeat + timeout
```javascript
const TIMEOUT = 60000;

ws.isAlive = true;
ws.lastActivity = Date.now();

ws.on('pong', () => {
  ws.isAlive = true;
  ws.lastActivity = Date.now();
});

// Periodic cleanup
setInterval(() => {
  wss.clients.forEach(ws => {
    if (Date.now() - ws.lastActivity > TIMEOUT) {
      ws.terminate();
    }
  });
}, TIMEOUT / 2);
```

### 15.2 Race Conditions

**Problem**: User gửi message trước khi join hoàn thành
```javascript
// Client
socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'join', name: 'alice' }));
  socket.send(JSON.stringify({ type: 'chat', text: 'hello' })); // Race!
};
```

**Solution**: State machine
```javascript
class ChatUser {
  constructor() {
    this.state = 'CONNECTING'; // CONNECTING → JOINED → DISCONNECTED
  }
  
  handleMessage(data) {
    const msg = JSON.parse(data);
    
    if (this.state === 'CONNECTING' && msg.type !== 'join') {
      return this.sendError('Must join first');
    }
    
    if (msg.type === 'join') {
      this.state = 'JOINED';
      this.handleJoin(msg.name);
    }
  }
}
```

### 15.3 Broadcast Storm

**Problem**: N users × N messages = O(N²) network traffic
```javascript
// Mỗi message broadcast đến tất cả users
room.broadcast(message); // 1000 users = 1000 sends
```

**Solution**: Throttling + batching
```javascript
class ThrottledRoom {
  constructor() {
    this.pendingMessages = [];
    this.flushInterval = setInterval(() => this.flush(), 100);
  }
  
  broadcast(message) {
    this.pendingMessages.push(message);
  }
  
  flush() {
    if (this.pendingMessages.length === 0) return;
    
    const batch = { type: 'batch', messages: this.pendingMessages };
    for (let member of this.members) {
      member.send(JSON.stringify(batch));
    }
    this.pendingMessages = [];
  }
}
```

### 15.4 JSON Parse Errors

**Problem**: Invalid JSON crashes server
```javascript
// BAD
handleMessage(data) {
  const msg = JSON.parse(data); // Throws if invalid
}
```

**Solution**: Safe parsing
```javascript
handleMessage(data) {
  let msg;
  try {
    msg = JSON.parse(data);
  } catch (e) {
    return this.send(JSON.stringify({ type: 'error', text: 'Invalid JSON' }));
  }
  
  // Validate structure
  if (!msg.type) {
    return this.send(JSON.stringify({ type: 'error', text: 'Missing type' }));
  }
}
```

### 15.5 XSS Vulnerability

**Problem**: User input rendered as HTML
```javascript
// BAD - XSS vulnerable
item.innerHTML = `<b>${msg.name}:</b> ${msg.text}`;
// msg.text = "<script>alert('XSS')</script>"
```

**Solution**: Use textContent or sanitize
```javascript
// GOOD - Safe
const nameEl = document.createElement('strong');
nameEl.textContent = msg.name + ': ';

const textEl = document.createTextNode(msg.text);

const item = document.createElement('li');
item.appendChild(nameEl);
item.appendChild(textEl);
```

---

## Cấu trúc folder

```
16_WebSockets/
├── server.js          # Entry point - khởi động Express
├── app.js             # Express config, WebSocket routes
├── ChatUser.js        # User class - message handling
├── Room.js            # Room class - Registry pattern
├── jokes.js           # External API integration
├── chat.html          # Chat UI template
├── package.json       # Dependencies
└── static/
    ├── js/
    │   ├── chat.js      # Client WebSocket logic
    │   └── basicChat.js # Basic version
    └── css/
        └── styles.css   # Styling
```

---

## Chạy demo

```bash
# Install dependencies
npm install

# Start server
node server.js

# Hoặc với PM2 (production)
pm2 start ecosystem.config.js

# Hoặc với nodemon (development)
npx nodemon server.js
```

Truy cập `http://localhost:3000/<roomName>` và mở multiple tabs để chat.

---

## Tính năng Demo

| Command | Description | Example |
|---------|-------------|---------|
| `/joke` | Lấy random joke từ API | `/joke` |
| `/members` | Liệt kê members trong room | `/members` |
| `/nick <name>` | Đổi username | `/nick newname` |
| `/priv <user> <msg>` | Private message | `/priv alice Hello!` |

---

## Flow Hoạt Động

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User truy cập /<roomName>                                    │
│    └─→ Server serve chat.html                                   │
├─────────────────────────────────────────────────────────────────┤
│ 2. Client tạo WebSocket                                         │
│    └─→ new WebSocket(`ws://localhost:3000/chat/${roomName}`)    │
├─────────────────────────────────────────────────────────────────┤
│ 3. Server nhận connection                                       │
│    └─→ Tạo ChatUser instance                                    │
│    └─→ Bind ws.send() và room                                   │
├─────────────────────────────────────────────────────────────────┤
│ 4. Client gửi join                                              │
│    └─→ { type: "join", name: username }                         │
│    └─→ Server: handleJoin() → room.broadcast()                  │
├─────────────────────────────────────────────────────────────────┤
│ 5. Chat messages                                                │
│    └─→ Client: { type: "chat", text: msg }                      │
│    └─→ Server: handleChat() → room.broadcast()                  │
│    └─→ All clients receive message                              │
├─────────────────────────────────────────────────────────────────┤
│ 6. Connection close                                             │
│    └─→ ws.on('close') → handleClose()                           │
│    └─→ room.leave() → broadcast leave note                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dependencies

```json
{
  "express": "^4.x",      // Web framework
  "express-ws": "^5.x",   // WebSocket support for Express
  "axios": "^1.x"         // HTTP client for jokes API
}
```

---

## Tài liệu tham khảo

- [RFC 6455 - The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [express-ws Documentation](https://github.com/HenningM/express-ws)
- [WebSocket vs SSE vs Long Polling](https://ably.com/topic/websockets-vs-sse)
- [Scaling WebSockets](https://blog.logrocket.com/scalable-websockets-with-socket-io-and-redis/)

---

Bài học này là nền tảng cho real-time apps như chat, gaming, collaboration tools, live dashboards, và IoT applications.
