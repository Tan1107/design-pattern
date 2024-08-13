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
subject.notify(123)

// mô hình pull push
// ưu nhược push strategy
//ưu đuểm:
// chỉ cần truy caoaj vào danh sách new feed cxuar mình là có đât
//nhanh gọn lẹ


//nhược điểm
//tỷ lệ ghi cao lãng phí DB ví chụ cr7 có 1 triệu followers thjif 1 triệu bản gihji
// tốc dộ nhận tin cuat nguoiwef followers có thể chậm hjjown người khác //==> nó check xem bạn có thường xuyên truye cạp k để đánh độ ưu tiên

