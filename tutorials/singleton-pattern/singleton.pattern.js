// mẫu singleton là nó có nhiệm vụ tạo ra 1 phiên bản duy nhất và cung cấp 1 cách để truy cập đến nó từ bất kỳ nơi nào trong ứng dụng của bạn.
// Mootyj singleton cung cấp 1 module instance duy nhất và cung cấp 1 cách để truy cập đến nó từ bất kỳ nơi nào trong ứng dụng của bạn. 
//mà không cần phải tạo ra 1 lại 1 lần nữa.
// Singleton Pattern dễ dàng triển khai và có thể được sử dụng trong nhiều trường hợp, chẳng hạn như:
// 1. Logger
// 2. Cache
// 3. Session
// 4. Configuration
// Nó có thể tối ưu hóa bộ nhớ và tăng hiệu suất ứng dụng của bạn.
// quản lý tài nguyên, dữ liệu cấu hình
// round robin
'use strict';
class RoundRobin {
    constructor() {
        if (RoundRobin.instance) {
            return RoundRobin.instance;
        }
        RoundRobin.instance = this;
        this.servers = [];
        this.index = 0;
    }
    // add server
    addServer (server) {
        this.servers.push(server);
    }
    // get next server
    getNextServer() {
        if (!this.servers.length === 0) {
            throw new Error('No server available');
        }
        const server = this.servers[this.index];
        //Modulus
        this.index = (this.index + 1) % this.servers.length;
        return server;
    }
}

const loadBalancer = new RoundRobin();
const loadBalancer1 = new RoundRobin();

console.log('compare::',loadBalancer === loadBalancer1); // false

loadBalancer.addServer();
// loadBalancer.addServer('server2');
// loadBalancer.addServer('server3');

console.log(loadBalancer.getNextServer()); // server1
console.log(loadBalancer.getNextServer()); // server2
console.log(loadBalancer.getNextServer()); // server3
console.log(loadBalancer.getNextServer()); // server1
console.log(loadBalancer.getNextServer()); // server2
console.log(loadBalancer.getNextServer()); // server3

// const numServer = 3
// const userId = 100076

// console.log(userId % numServer) // lấy số dư chính là server

//quản lý được global application