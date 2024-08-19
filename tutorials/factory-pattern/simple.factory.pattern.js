// được sử dụng phổ biến nhất trong lập trình hướng đối tượng,
// gôm có 3 loại: Simple Factory, Factory Method và Abstract Factory.
// SIMPLE FACTORY
// Ứng dụng logitics
// without simple factory pattern
const serviceLogistics = (cargoVolume) => {
    switch (cargoVolume) {
        case '10':
            return {
                name: 'Truck 10',
                doors: 6,
                price: '100.000 VND'
            }
        case '20':
            return {
                name: 'Truck 20',
                doors: 16,
                price: '1.000.000 VND'
            }
    }
}

console.log('level0:::', serviceLogistics('20'))

// with simple Factory Pattern
class ServiceLogitics {
    constructor(doors = 6, price = '100.000 VND', name = 'Truck 10') {
        this.doors = doors
        this.price = price
        this.name = name
    }
    static getTransport = (cargoVolume) => {
        switch (cargoVolume) {
            case '10':
                return new ServiceLogitics()
            case '20':
                return new ServiceLogitics(16, '1.000.000 VND', 'Truck 20')
        }
    }
}

console.log('level xxx :::', ServiceLogitics.getTransport('20'))