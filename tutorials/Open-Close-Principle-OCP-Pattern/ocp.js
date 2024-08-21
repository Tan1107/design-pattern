class Socket {
    constructor() {
        this.devices = [];
    }

    // add device
    addDevice(device) {
        this.devices.push(device);
    }

    // connect to device
    activate(){
        console.log('Socket is connected');
        this.devices.forEach(device => device.connect());
    }
}

class Tivi {
    connect() {
        console.log('Tivi is connected');
    }
}

class Fridge {
    connect() {
        console.log('Fridge is connected');
    }
}

//1 action
class Fan {
    connect() {
        console.log('Fan is connected');
    }
}

// test
const socket = new Socket();
socket.addDevice(new Tivi());
socket.addDevice(new Fridge());
socket.addDevice(new Fan());
socket.activate();

// nếu k được thiết kế tốt thì khó mở rộng
// lỗi hạn chế
// để hạn chế lỗi thì phải tuân theo nguyên tắc mở rộng đóng mở này