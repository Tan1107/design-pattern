//note
// Một class nên có 1 lý do để thay đổi mà thôi
class Order {
    constructor(userId) {
        this.userId = userId;
        this.timeOrder = Date.now();
        this.products = [];
    }
}

class OrderManager {
    constructor(){
        this.order = null
    }
    //create Order
    createOrder (useId) {
        this.order = new Order(useId)
        return this.order;
    }

    //add Product
    addProduct (product) {
        this.order.products.push(product);
    }

    // get Order 
    getOrder(){
        return this.order;
    }

    isValid(){
        return !!this.order.products.length
    }

    //send mail order
    sendOrder(){
        if(this.isValid){
            //send mail
            const sendMail = new SendmailOrder()
            return sendMail.sendMail(this.order);
        }
        return false
    }
}

class SendmailOrder{
    sendMail(order){
        console.log(`Sndt Moal to aaaaaaaaaa success::`, order)
        return true
    }
}

const orderManager = new OrderManager();
orderManager.createOrder('userId-0001');
orderManager.addProduct({product: 101, quantity: 2, price: 1000, unit: 'USD'});
orderManager.addProduct({product: 102, quantity: 2, price: 1000, unit: 'USD'});
console.log('Product Info::', orderManager.getOrder());
console.log(`Send Mail:::`, orderManager.sendOrder())


//lý dio duy nhất để sửa

//cghungs ta sẽ tọa ra ứng dụng phân lớp rõ ràng và có thể sử dụng lại logic nghiệp vụ của ứng dụng

//có khả năng bảo trì và phát triển ứng dụng