//tính nguyên mẫu
//trong phần mềm  tạo nhiều phiên bản của những compponent đơn giản họp thoại
//sau đó có thể sap chép nếu càn
//define a prototype object fỏ fifa onlien

class FifaOnlinePlayer {
    constructor(name, team, position, goals){
        this.name = name;
        this.team = team;
        this.position = position;
        this.goals = goals;
    }
    score(){
        this.goals++;
    }
    clone(){
        return new FifaOnlinePlayer(this.name, this.team, this.position, this.goals);
    }
}

FifaOnlinePlayer.prototype.start = {
    minutesPalyer : 0
}

// Create a new fifaOnlinePlayer prototype object
const prototypePattern = new FifaOnlinePlayer('CR7', 'AL Nassr', 'FW', 0)

// Create  multiple instante of the fgifaonlien player
const cr7 = prototypePattern.clone()
cr7.start.minutesPalyer = 10000;
const m10 = prototypePattern.clone()

m10.name = 'Messi',
m10.team = 'Miamy'

// test the instance
cr7.score()
console.log(`${cr7.name} has recored ${cr7.goals} this season ${JSON.stringify(cr7.start)}`)

m10.score()
console.log(`${m10.name} has recored ${m10.goals} this season ${JSON.stringify(m10.start)}`)

// node v18 sử dụng struck để deep copy để copy prototype object
