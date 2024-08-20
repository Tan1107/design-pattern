// Proxy pattern dùng để tạo ra một đối tượng thay thế cho một đối tượng khác.
// Proxy pattern cho phép bạn tạo ra một đối tượng giả để kiểm soát việc truy cập đến đối tượng thật.
// Proxy pattern giúp bạn kiểm soát việc truy cập đến đối tượng thật, chẳng hạn như:
// 1. Truy cập đến đối tượng thật từ xa (remote proxy).
// 2. Truy cập đến đối tượng thật mà không tải nó vào bộ nhớ (virtual proxy).
// 3. Truy cập đến đối tượng thật mà không thay đổi nó (protection proxy).

class Leader{
    receiveRequest(offer) {
        console.log(`Leadr said !OK::: ${offer}`)
    }
}

class Secretary {
    constructor() {
        this.leader = new Leader();
    }
    receiveRequest(offer) {
        //date...
        this.leader.receiveRequest(offer);
    }
}

class Develop {
    constructor(offer) {
        this.offer = offer;
    }
    applyFor(target) {
        target.receiveRequest(this.offer);
    }
}

//how to use
const devs = new Develop('Tan1107 upto 2k USD');
devs.applyFor(new Secretary());




