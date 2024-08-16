//chia nhỏ các hàm ra để đơn giản
//nó cho phepstaoj các biến thee4rr khác nhau cuart cùng biến thể
//builder cho phép bạn từng bước xây dựng các đối tượng phức tapk, builder không chop phép các đối tượng khác truye caoaj vào product trong khi nó đang được xây dụng
//vô nahf hàng 5 sao, muốn triền khia 1 đơn đặt hàng --> tạo lớp đại diện  _.. món a b c
//chi nhỏ các hnagf đơn giản
class FifaOnlinePlayer {
    constructor(builder){
        this.name = builder.name
        this.age = builder.age
        this.nationality = builder.nationality
        this.position = builder.position
        this.stats = builder.stats
    }
    toString(){
        let player = `Player:\n`;
        player += `- Name: ${this.name}\n`;
        player += `- Age: ${this.age}\n`;
        player += `- Nationality: ${this.nationality}\n`;
        player += `- Position: ${this.position}\n`
        player += `- Team: ${this.team}\n`;
        player += `- Stats: ${JSON.stringify(this.stats)}\n`;
        return player;
    }
}
class FifaOnlinePlayerBuilder {
    constructor(){
        this.name = "";
        this.age = 0
        this.nationality = ""
        this.position = "";
        this.team = "";
        this.stats = {}
    }
    withName(name){
        this.name = name
        return this
    }
    withAge(age){
        this.age = age
        return this
    }
    withNationality(nationality){
        this.nationality = nationality
        return this
    }
    withPosition(position){
        this.position = position
        return this
    }
    withTeam(team){
        this.team = team
        return this
    }
    withStats(stats){
        this.stats = stats
        return this
    }
    build(){
        return new FifaOnlinePlayer(this)
    }
}

//how to uyse

const buildPattern = new FifaOnlinePlayerBuilder()
const cr7 = buildPattern
                .withName('cr7')
                .withAge(30)
                .withNationality('Portugal')
                .withTeam('AL nassr')
                .withPosition('FW')
                .withStats({goals: 10000, assists: 500})
                .build()
console.log(cr7.toString())

const m10 = buildPattern
                .withName('m10')
                .withAge(30)
                .withNationality('Angerntina')
                .withTeam('Miamy')
                .withPosition('FW')
                .withStats({goals: 134000, assists: 45555})
                .build()
console.log(m10.toString())