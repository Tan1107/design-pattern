//xây dụng hàng rào vuông vức nhưng bên tỏng thì lọn xộn
// đợn giản cho người dùng nhưng sự phức tạp trong đó

//code

class  Discount {
    calc(value){
        return value * 0.9
    }
}

class Shipping {
    calc(){
        return 5;
    }
}

class Fees{
    calc(value){
        return value * 1.05;
    }
}

//xây dựng facade pattern
class SHopeeFacadePattern {
    constructor(){
        this.discount = new Discount();
        this.shipping = new Shipping();
        this.fees = new Fees();
    }

    calc(price){
        price = this.discount.calc(price);
        price = this.fees.calc(price);
        price += this.shipping.calc();


        return price
    }
}

function buy(price){
    const shoppee = new SHopeeFacadePattern();
    console.log(`Price::`, shoppee.calc(price))
}


buy(120000)

// lập trình viên cần học pattern 
// để lên lương để qua công ty khác có thể nắm bắt nhanh hệ thống
// lên chức --> giao lại dự án giai đoạn cho người thay thế bạn  --> hệ thống tốt --> mình tập trung công việc của bạn
// để những người mới vô giải thích cho em út