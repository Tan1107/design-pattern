// Create service Car

class Car {
    constructor({name = 'Ford Ranger 2003', doors = 4, price = '100.000 VND', customerInfo = {}}) {
        this.name = name
        this.doors = doors
        this.price = price
        this.customerInfo = customerInfo
    }

}

// create service Logitics
class ServiceLogitics {
    transportClass = Car
    getTransport = (customerInfo) => {
        return new this.transportClass(customerInfo)
    }
}

// order for customer by car
const carService = new ServiceLogitics()
console.log('CarService:::', carService.getTransport({customerInfo: { name: 'Nguyen Van A', cargoVolume: '100 kg' } }))

// cach 1:
class Truck {
    constructor({name = 'Container 2023', doors = 16, price = '200.000 VND', customerInfo = {}}) {
        this.name = name
        this.doors = doors
        this.price = price
        this.customerInfo = customerInfo
    }
}
carService.transportClass = Truck
console.log('TruckService:::', carService.getTransport({customerInfo: { name: 'Nguyen Van B', cargoVolume: '1000 kg' } }))

// cach 2:
class TruckService extends ServiceLogitics {
    transportClass = Truck
}

const truckService = new TruckService()
console.log('TruckService:::class :: ', truckService.getTransport({customerInfo: { name: 'Nguyen Van C', cargoVolume: '10000 kg' } }))