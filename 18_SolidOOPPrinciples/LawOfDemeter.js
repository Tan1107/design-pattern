// class Wallet {
//   constructor(money) {
//     this.money = money;
//   }

//   getMoney() {
//     return this.money;
//   }
// }

// class Person {
//   constructor(wallet) {
//     this.wallet = wallet;
//   }

//   getWallet() {
//     return this.wallet;
//   }
// }

// class ShoppingMall {
//   chargeCustomer(person, amount) {
//     let wallet = person.getWallet();
//     let money = wallet.getMoney();
//     wallet.money = money - amount; // Violates LoD
//   }
// }

// let wallet = new Wallet(100);
// let person = new Person(wallet);
// let mall = new ShoppingMall();

// mall.chargeCustomer(person, 50);

class Wallet {
  constructor(money) {
    this.money = money;
  }

  debit(amount) {
    this.money -= amount;
  }

  getMoney() {
    return this.money;
  }
}

class Person {
  constructor(wallet) {
    this.wallet = wallet;
  }

  getWallet() {
    return this.wallet;
  }

  payAmount(amount) {
    this.wallet.debit(amount);
  }
}

class ShoppingMall {
  chargeCustomer(person, amount) {
    person.payAmount(amount);
  }
}

let wallet = new Wallet(100);
let person = new Person(wallet);
let mall = new ShoppingMall();

mall.chargeCustomer(person, 50);
