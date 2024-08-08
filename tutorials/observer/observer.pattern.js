class Observer {
    constructor(name){
        this.namePick = name
    }

    updateStatus(location){
        this.gotoHellp(location)
    }

    gotoHellp(location){
        console.log(`${this.namePick}:::PING :::::${JSON.stringify(location)}`)
    }
}

class Subject{
    constructor(){
        this.observerList = [];
    }

    addObserver(observer){
        this.observerList.push(observer)
    }

    notify(location){
        this.observerList.forEach(observer => observer.updateStatus(location))
    }
}

const subject = new Subject()

//your pick

const gnar = new Observer('Gnar');
const braum = new Observer('Braum');

//add gnar and braum to team

subject.addObserver(gnar)
subject.addObserver(braum)

// subject.addObserver(123)

subject.notify({lat: 123, lon: 3333})