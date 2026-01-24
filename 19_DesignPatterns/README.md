# Design Patterns - Hướng Dẫn Triển Khai Cấp Senior

Thư mục này chứa các triển khai nâng cao của các mẫu thiết kế thiết yếu trong JavaScript, tập trung vào khả năng áp dụng thực tế, cân nhắc hiệu suất và các tính năng ES6+ hiện đại. Mỗi mẫu thể hiện sự hiểu biết cấp senior với các ví dụ thực tế, anti-patterns cần tránh và ý nghĩa kiến trúc.

## Mục Lục

1. [Singleton Pattern](#1-singleton-pattern)
2. [Observer Pattern](#2-observer-pattern)
3. [Module Pattern](#3-module-pattern)
4. [Mixin Pattern](#4-mixin-pattern)
5. [Proxy Pattern](#5-proxy-pattern)
6. [Registry Pattern](#6-registry-pattern)

---

## 1. Singleton Pattern

### Khái Niệm Cốt Lõi
Đảm bảo một lớp chỉ có một instance duy nhất và cung cấp điểm truy cập toàn cục đến nó.

### Triển Khai Cấp Senior
```javascript
// singleton.js - Singleton nâng cao với khởi tạo lazy và mô phỏng thread-safety
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    this.connection = null;
    this.isConnected = false;
    DatabaseConnection.instance = this;
    return this;
  }

  static getInstance() {
    return new DatabaseConnection();
  }

  async connect(config) {
    if (this.isConnected) return this.connection;

    // Mô phỏng kết nối async
    await new Promise(resolve => setTimeout(resolve, 100));
    this.connection = { config, timestamp: Date.now() };
    this.isConnected = true;
    return this.connection;
  }

  disconnect() {
    this.connection = null;
    this.isConnected = false;
  }
}

// Sử dụng với xử lý lỗi đúng cách
async function initializeApp() {
  try {
    const db = DatabaseConnection.getInstance();
    const connection = await db.connect({ host: 'localhost', port: 5432 });
    console.log('Database connected:', connection);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

### Những Điểm Cần Lưu Ý Chính
- **Quản Lý Bộ Nhớ**: Instance duy nhất ngăn chặn rò rỉ bộ nhớ từ nhiều kết nối
- **Thách Thức Kiểm Thử**: Khó mock; cân nhắc các lựa chọn dependency injection
- **Đồng Thời**: Trong Node.js, bản chất single-threaded làm cho nó tự nhiên thread-safe
- **Trạng Thái Toàn Cục**: Có thể làm cho việc testing và debugging trở nên khó khăn hơn

### Anti-patterns Cần Tránh
- Lạm dụng singletons cho mọi thứ
- Ẩn dependencies đằng sau truy cập toàn cục
- Làm cho singletons có thể thay đổi sau khi khởi tạo

---

## 2. Observer Pattern

### Khái Niệm Cốt Lõi
Xác định một dependency một-nhiều giữa các objects mà khi một object thay đổi sẽ thông báo cho tất cả dependents.

### Triển Khai Cấp Senior
```javascript
// observer.js - Observer nâng cao với priority và filtering
class EventEmitter {
  constructor() {
    this.events = new Map();
    this.onceEvents = new WeakSet();
  }

  on(event, callback, priority = 0) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    listeners.push({ callback, priority });
    listeners.sort((a, b) => b.priority - a.priority); // Priority cao hơn trước

    return () => this.off(event, callback);
  }

  once(event, callback, priority = 0) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    this.onceEvents.add(onceWrapper);
    return this.on(event, onceWrapper, priority);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;

    const listeners = this.events.get(event);
    const index = listeners.findIndex(listener => listener.callback === callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return;

    const listeners = this.events.get(event);
    for (const { callback } of listeners) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
        // Tiếp tục với các listeners khác
      }
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
}

// Ví dụ sử dụng
const emitter = new EventEmitter();

const unsubscribe = emitter.on('user:login', (user) => {
  console.log(`User ${user.name} logged in`);
}, 10); // Priority cao

emitter.once('app:ready', () => {
  console.log('App initialized once');
});

emitter.emit('user:login', { name: 'John', id: 123 });
emitter.emit('app:ready');
emitter.emit('app:ready'); // Sẽ không trigger lại
```

### Tính Năng Nâng Cao
- **Hệ Thống Priority**: Listeners có priority cao hơn thực thi trước
- **Once Listeners**: Thực thi chỉ một lần rồi tự động xóa
- **Xử Lý Lỗi**: Lỗi cô lập không làm hỏng các listeners khác
- **Quản Lý Bộ Nhớ**: WeakSet cho once listeners để ngăn chặn rò rỉ bộ nhớ

### Ứng Dụng Thực Tế
- Xử lý sự kiện UI
- Đồng bộ hóa dữ liệu thời gian thực
- Hệ thống plugins
- Quản lý trạng thái (Redux-like)

---

## 3. Module Pattern

### Khái Niệm Cốt Lõi
Cung cấp cả encapsulation private và public cho classes, functions và variables.

### Triển Khai Cấp Senior
```javascript
// modulePattern.js - Module nâng cao với dependency injection và lazy loading
const ModuleManager = (function() {
  const modules = new Map();
  const loading = new Set();

  function define(name, dependencies, factory) {
    if (modules.has(name)) {
      throw new Error(`Module ${name} already exists`);
    }

    modules.set(name, {
      dependencies,
      factory,
      instance: null,
      loaded: false
    });
  }

  async function require(name) {
    if (loading.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    const module = modules.get(name);
    if (!module) {
      throw new Error(`Module ${name} not found`);
    }

    if (module.loaded) {
      return module.instance;
    }

    loading.add(name);

    try {
      // Load dependencies asynchronously
      const deps = await Promise.all(
        module.dependencies.map(dep => require(dep))
      );

      // Execute factory function
      module.instance = module.factory(...deps);
      module.loaded = true;

      return module.instance;
    } finally {
      loading.delete(name);
    }
  }

  function reset() {
    modules.clear();
    loading.clear();
  }

  return { define, require, reset };
})();

// Sử dụng
ModuleManager.define('logger', [], function() {
  return {
    log: (message) => console.log(`[LOG] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`)
  };
});

ModuleManager.define('userService', ['logger'], function(logger) {
  return {
    async getUser(id) {
      logger.log(`Fetching user ${id}`);
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 100));
      return { id, name: 'John Doe' };
    }
  };
});

ModuleManager.define('app', ['userService'], async function(userService) {
  const user = await userService.getUser(123);
  console.log('App initialized with user:', user);
  return { user };
});

// Load app
ModuleManager.require('app').then(result => {
  console.log('Application loaded successfully');
}).catch(error => {
  console.error('Failed to load application:', error);
});
```

### Lợi Ích Chính
- **Quản Lý Dependencies**: Khai báo dependencies rõ ràng
- **Loading Bất Đồng Bộ**: Hỗ trợ dynamic imports
- **Phát Hiện Circular Dependencies**: Ngăn chặn vòng lặp vô hạn
- **Caching**: Modules được load một lần và tái sử dụng

### Các Lựa Chọn Hiện Đại
- ES6 modules với tree-shaking
- Bundlers như Webpack/Rollup
- Dependency injection containers

---

## 4. Mixin Pattern

### Khái Niệm Cốt Lõi
Cho phép objects kế thừa functionality từ nhiều nguồn mà không sử dụng classical inheritance.

### Triển Khai Cấp Senior
```javascript
// mixinPattern.js - Mixin nâng cao với composition và conflict resolution
function createMixin(base = {}) {
  const mixins = [];

  function add(mixin) {
    mixins.push(mixin);
    return this;
  }

  function compose(target = {}) {
    const result = { ...base, ...target };

    // Áp dụng mixins theo thứ tự
    mixins.forEach(mixin => {
      Object.keys(mixin).forEach(key => {
        if (typeof mixin[key] === 'function') {
          // Xử lý method conflicts
          if (result[key] && typeof result[key] === 'function') {
            const original = result[key];
            result[key] = function(...args) {
              // Gọi original trước, sau đó mixin
              const originalResult = original.apply(this, args);
              return mixin[key].apply(this, args) || originalResult;
            };
          } else {
            result[key] = mixin[key].bind(result);
          }
        } else {
          // Xử lý property conflicts (mixin takes precedence)
          result[key] = mixin[key];
        }
      });
    });

    return result;
  }

  return { add, compose };
}

// Định nghĩa mixins
const EventEmitterMixin = {
  events: {},

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
};

const ValidationMixin = {
  errors: [],

  validate() {
    this.errors = [];
    // Logic validation tùy chỉnh
    return this.errors.length === 0;
  },

  addError(field, message) {
    this.errors.push({ field, message });
  }
};

const PersistenceMixin = {
  save() {
    console.log('Saving to storage...');
    // Mô phỏng async save
    return new Promise(resolve => setTimeout(() => resolve(true), 100));
  },

  load(id) {
    console.log(`Loading from storage: ${id}`);
    return Promise.resolve({ id, data: 'loaded' });
  }
};

// Tạo User class với mixins
function createUser(name, email) {
  return createMixin({
    name,
    email,
    createdAt: new Date()
  })
  .add(EventEmitterMixin)
  .add(ValidationMixin)
  .add(PersistenceMixin)
  .compose({
    // Custom methods
    getDisplayName() {
      return `${this.name} (${this.email})`;
    },

    validate() {
      // Gọi parent validation
      const isValid = ValidationMixin.validate.call(this);

      if (!this.email.includes('@')) {
        this.addError('email', 'Invalid email format');
      }

      if (this.name.length < 2) {
        this.addError('name', 'Name too short');
      }

      return this.errors.length === 0;
    }
  });
}

// Sử dụng
const user = createUser('John Doe', 'john@example.com');

if (user.validate()) {
  user.emit('validated', user);
  user.save().then(() => {
    console.log('User saved successfully');
  });
} else {
  console.log('Validation errors:', user.errors);
}
```

### Tính Năng Nâng Cao
- **Method Composition**: Xử lý conflicts bằng cách chaining methods
- **Property Merging**: Mixins có thể override base properties
- **Functional Composition**: Chain nhiều mixins
- **Memory Efficient**: Không có prototype chain overhead

### Use Cases
- Cross-cutting concerns (logging, validation, caching)
- Mô phỏng multiple inheritance
- Plugin systems
- Decorator pattern implementation

---

## 5. Proxy Pattern

### Khái Niệm Cốt Lõi
Cung cấp một surrogate hoặc placeholder cho một object khác để kiểm soát truy cập đến nó.

### Ví Dụ Triển Khai

#### Data Binding Proxy
```javascript
// proxyDataBindingDemo.js - Reactive data binding
function createReactiveObject(target, callback) {
  return new Proxy(target, {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;

      if (callback && oldValue !== value) {
        callback(property, value, oldValue);
      }

      return true;
    },

    get(target, property) {
      if (property === '__isProxy') return true;

      const value = target[property];
      if (typeof value === 'object' && value !== null && !value.__isProxy) {
        target[property] = createReactiveObject(value, callback);
      }

      return target[property];
    }
  });
}

// Sử dụng
const user = createReactiveObject({
  name: 'John',
  profile: {
    age: 30,
    email: 'john@example.com'
  }
}, (property, newValue, oldValue) => {
  console.log(`${property} changed from ${oldValue} to ${newValue}`);
  // Trigger UI updates, API calls, etc.
});

user.name = 'Jane'; // Triggers callback
user.profile.age = 31; // Triggers callback cho nested property
```

#### Validation Proxy
```javascript
// proxy1.js - Input validation và sanitization
function createValidatedProxy(target, validators = {}) {
  return new Proxy(target, {
    set(target, property, value) {
      const validator = validators[property];

      if (validator) {
        const error = validator(value);
        if (error) {
          throw new Error(`Validation failed for ${property}: ${error}`);
        }
      }

      // Sanitize nếu cần
      if (typeof value === 'string') {
        value = value.trim();
      }

      target[property] = value;
      return true;
    }
  });
}

// Sử dụng
const validators = {
  email: (value) => {
    if (!value.includes('@')) return 'Invalid email format';
  },
  age: (value) => {
    if (value < 0 || value > 150) return 'Age must be between 0 and 150';
  }
};

const person = createValidatedProxy({}, validators);

try {
  person.email = 'john@example.com';
  person.age = 30;
  person.age = 200; // Throws validation error
} catch (error) {
  console.error(error.message);
}
```

#### Caching Proxy
```javascript
// proxy2.js - Method result caching
function createCachingProxy(target, cache = new Map()) {
  return new Proxy(target, {
    get(target, property) {
      const value = target[property];

      if (typeof value === 'function') {
        return function(...args) {
          const key = `${property}:${JSON.stringify(args)}`;

          if (cache.has(key)) {
            console.log(`Cache hit for ${key}`);
            return cache.get(key);
          }

          console.log(`Cache miss for ${key}`);
          const result = value.apply(target, args);
          cache.set(key, result);
          return result;
        };
      }

      return value;
    }
  });
}

// Sử dụng
class ExpensiveCalculator {
  fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  async fetchUser(id) {
    // Mô phỏng API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id, name: `User ${id}` };
  }
}

const calculator = createCachingProxy(new ExpensiveCalculator());

console.time('First call');
calculator.fibonacci(40); // Chậm lần đầu
console.timeEnd('First call');

console.time('Second call');
calculator.fibonacci(40); // Nhanh từ cache
console.timeEnd('Second call');
```

### Các Loại Proxy và Use Cases
- **Virtual Proxy**: Khởi tạo lazy của expensive objects
- **Protection Proxy**: Kiểm soát truy cập và bảo mật
- **Caching Proxy**: Result memoization
- **Logging Proxy**: Audit trail và debugging
- **Validation Proxy**: Input sanitization và business rules

### Cân Nhắc Hiệu Suất
- **Overhead**: Mỗi truy cập property đi qua proxy traps
- **Sử Dụng Bộ Nhớ**: Cache implementations cần quản lý bộ nhớ
- **Garbage Collection**: WeakMap cho large object caches
- **ES6 Support**: Cần browsers hiện đại cho full Proxy support

---

## 6. Registry Pattern

### Khái Niệm Cốt Lõi
Cung cấp một vị trí trung tâm để đăng ký và truy xuất objects theo key.

### Triển Khai Cấp Senior
```javascript
// registryPattern.js - Registry nâng cao với lifecycle management
class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.factories = new Map();
    this.instances = new WeakMap();
    this.dependencies = new Map();
  }

  register(name, factory, dependencies = []) {
    if (this.components.has(name)) {
      throw new Error(`Component ${name} already registered`);
    }

    this.factories.set(name, factory);
    this.dependencies.set(name, dependencies);
    this.components.set(name, { factory, dependencies, initialized: false });
  }

  async get(name) {
    const component = this.components.get(name);
    if (!component) {
      throw new Error(`Component ${name} not found`);
    }

    if (component.initialized && this.instances.has(component)) {
      return this.instances.get(component);
    }

    // Resolve dependencies
    const deps = await Promise.all(
      component.dependencies.map(dep => this.get(dep))
    );

    // Tạo instance
    const instance = await component.factory(...deps);
    this.instances.set(component, instance);
    component.initialized = true;

    return instance;
  }

  has(name) {
    return this.components.has(name);
  }

  unregister(name) {
    if (this.components.has(name)) {
      const component = this.components.get(name);
      this.instances.delete(component);
      this.components.delete(name);
      this.factories.delete(name);
      this.dependencies.delete(name);
    }
  }

  list() {
    return Array.from(this.components.keys());
  }

  clear() {
    this.components.clear();
    this.factories.clear();
    this.instances = new WeakMap();
    this.dependencies.clear();
  }
}

// Ví dụ sử dụng
const registry = new ComponentRegistry();

// Đăng ký components
registry.register('logger', async () => ({
  log: (message) => console.log(`[LOG] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`)
}));

registry.register('database', async () => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Mô phỏng connection
  return {
    query: (sql) => console.log(`Executing: ${sql}`)
  };
});

registry.register('userService', async (logger, database) => ({
  async getUser(id) {
    logger.log(`Fetching user ${id}`);
    database.query(`SELECT * FROM users WHERE id = ${id}`);
    return { id, name: 'John Doe' };
  }
}), ['logger', 'database']);

registry.register('authService', async (logger) => ({
  authenticate(token) {
    logger.log('Authenticating token');
    return token === 'valid-token';
  }
}), ['logger']);

// Sử dụng components
async function initializeApp() {
  const userService = await registry.get('userService');
  const authService = await registry.get('authService');

  const user = await userService.getUser(123);
  const isAuthenticated = authService.authenticate('valid-token');

  console.log('User:', user);
  console.log('Authenticated:', isAuthenticated);
}

initializeApp();
```

### Tính Năng Nâng Cao
- **Dependency Injection**: Tự động resolve component dependencies
- **Khởi Tạo Lazy**: Components được tạo chỉ khi cần
- **Lifecycle Management**: Cleanup và quản lý instance đúng cách
- **Async Support**: Xử lý asynchronous component initialization

### Ứng Dụng
- Plugin systems
- Service locators
- Factory management
- Configuration management
- Dependency injection containers

---

## Best Practices Cho Design Patterns

### Lựa Chọn Pattern
- **Context Matters**: Chọn patterns dựa trên use cases cụ thể
- **Composition over Inheritance**: Ưu tiên composition linh hoạt
- **SOLID Principles**: Đảm bảo patterns align với thiết kế SOLID
- **Performance Impact**: Cân nhắc runtime và memory implications

### Common Pitfalls
- **Over-engineering**: Đừng force patterns nơi solutions đơn giản hoạt động
- **Pattern Misuse**: Hiểu khi nào và tại sao sử dụng mỗi pattern
- **Tight Coupling**: Patterns nên giảm, không tăng coupling
- **Premature Optimization**: Đừng optimize trước khi đo lường

### Testing Considerations
- **Mocking**: Design patterns nên facilitate testing
- **Isolation**: Test components independently
- **Integration**: Test pattern interactions
- **Refactoring**: Patterns nên enable safe refactoring

### Modern JavaScript Context
- **ES6+ Features**: Leverage classes, modules, proxies, và async/await
- **Functional Programming**: Kết hợp với functional patterns
- **TypeScript**: Thêm type safety cho pattern implementations
- **Framework Integration**: Hiểu cách frameworks sử dụng these patterns

Bộ sưu tập này thể hiện sự hiểu biết cấp senior về design patterns, tập trung vào triển khai thực tế, cân nhắc hiệu suất và khả năng áp dụng thực tế trong các ứng dụng JavaScript hiện đại.