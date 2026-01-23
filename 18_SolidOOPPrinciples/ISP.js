// class Worker {
//     work() {
//         console.log("working on work!")
//     }
//     eat() {
//         console.log("eating some food!")
//     }
//     sleep() {
//         console.log("taking a nap!")
//     }
// }

// function manageWork(worker) {
//     worker.work();
// }
class Workable {
  work() {
    console.log("working on work!");
  }
}

class Eatable {
  eat() {
    console.log("eating a snack");
  }
}

class Sleepable {
  sleep() {
    console.log("taking a nap");
  }
}

function manageWork(workable) {
  workable.work();
}
