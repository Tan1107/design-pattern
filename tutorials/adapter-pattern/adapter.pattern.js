// mẫu thiết kế cho phép các đối tượng có giao dfiện không tương thích với nhau làm việc cùng nhau
// tạo 1 service momo to visa
// defdeffuine the monoipaymentAdapter class
class MonoPaymentAdapter {
    constructor(monoPayment) {
        this.monoPayment = monoPayment;
    }
    //define the payWWithVisa method that í required by thwe youtube rgistration process
    payWithVisa(visaPayment) {
        //convert the MOMO to visa
        const convertedPayment = this.convertToPayment(this.monoPayment);
        //make the payment using the visa
        visaPayment.pay(convertedPayment);
    }

    //define the conevertToPayment method
    convertToPayment(momoPayment) {
        //convert the momo to a visa
        const conversionRate = 26000; // 1USD = 26000VND
        const visaAmount = momoPayment.amount / conversionRate;
        const visaPayment = {
            cardNumber: momoPayment.cardNumber,
            expiryDate: momoPayment.expiryDate,
            cvv: momoPayment.cvv,
            amount: visaAmount
        }
        return visaPayment;
    }
}

//define the visaPayment
class VisaPayment {
    pay(payment) {
        console.log('Paying ' + payment.amount + ' USD using Visa Card ' + payment.cardNumber + '...');
    }
}   
//define the momoPayment
class MomoPayment {
    constructor( cardNumber, expiryDate, cvv, visaAmount) {
        this.cardNumber = cardNumber;
        this.expiryDate = expiryDate;
        this.cvv = cvv;
        this.amount = visaAmount;
    }
}

// create a momo
const momoPayment = new MomoPayment('123456789', '12/2023', '123', 260000);

// create a momo to visa adapter
const momoAdapter = new MonoPaymentAdapter(momoPayment);

// create a visa payment
const visaPayment = new VisaPayment();

// Register for youtube
momoAdapter.payWithVisa(visaPayment);