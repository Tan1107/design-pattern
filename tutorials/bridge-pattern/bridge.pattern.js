//mẫu bridge là mẫu thiết kế tách rời các phần tuyef tượng để triển khai chúng độc lập với nhau
//ví dụ: chúng ta có 1 class shape và 1 class color, chúng ta muốn tạo ra các hình vẽ với các màu sắc khác nhau
//nó tách giao diện khỏi phần exceute của nó để chúng có thể thay đổi độc lập với nhau mà không ảnh hưởng đến nhau
//nó tách rời phần trừu tượng và phần implement của nó để chúng có thể thay đổi độc lập với nhau
// nó ngược với mẫu adapter, adapter làm cho 2 interface không tương thích với nhau trở nên tương thích
// define PaymentProcess
class PaymentProcess {
    payment(amount){

    }
}
// define VisaPaymentProcess class
class VisaPaymentProcess extends PaymentProcess{
    constructor(cardNumber, expiryDate, cvv){
        super();
        this.cardNumber = cardNumber;
        this.expiryDate = expiryDate;
        this.cvv = cvv;
    }
    //implement the pay method
    pay(amount){
        console.log(`Paying ${amount} USD using Visa card ${this.cardNumber} ...`);
        // TODO: Implement logic ....
    }
}
// define MomoPaymentProcess class
class MomoPaymentProcess extends PaymentProcess{
    constructor(phoneNumber, pin){
        super();
        this.phoneNumber = phoneNumber;
        this.pin = pin;
    }
    //implement the pay method
    pay(amount){
        console.log(`Paying ${amount} VND using Momo card ${this.phoneNumber} ...`);
        // TODO: Implement logic ....
    }
}
// define MemverRegistrator
class MemberRegistrator {
    constructor(paymentProcess){
        this.paymentProcess = paymentProcess;
    }
    register(){
        const amount = 100; // the registration fee in USD
        this.paymentProcess.pay(amount);
        console.log('Registered for Youtube membership! ...');
    }
}

// create visa payment
const visaPaymentProcess = new VisaPaymentProcess('123456789', '12/2023', '123');
const memeberShip = new MemberRegistrator(visaPaymentProcess);
memeberShip.register();

// create visa payment
const momoPaymentProcess = new MomoPaymentProcess('097873223', '123');
const memeberShipMomo = new MemberRegistrator(momoPaymentProcess);
memeberShipMomo.register();