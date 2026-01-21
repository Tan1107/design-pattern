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



