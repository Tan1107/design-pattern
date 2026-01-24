// class Subject {
//   constructor() {
//     this.observers = [];
//   }
//   subscribe(fn) {
//     this.observers.push(fn);
//   }
//   unsubscribe(fn) {
//     this.observers = this.observers.filter((o) => o !== fn);
//   }
//   notify(data) {
//     this.observers.forEach((fn) => fn(data));
//   }
// }

// const observer1 = (data) => console.log(`OBSERVER 1!`, data);
// const observer2 = (data) => console.log(`OBSERVER 2!`, data);
// const observer3 = (data) => console.log(`OBSERVER 3!`, data);

// const subject = new Subject();
// subject.subscribe(observer1);
// subject.subscribe(observer2);
// subject.subscribe(observer3);

class Blog {
  constructor() {
    this.subscribers = [];
  }

  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  publish(post) {
    this.subscribers.forEach((subscriber) => subscriber.notify(post));
  }
}

class Subscriber {
  constructor(name) {
    this.name = name;
  }

  notify(post) {
    console.log(
      `${this.name} received notification: New post published - ${post.title}`
    );
  }
}

const colt = new Subscriber("Colt");
const daniel = new Subscriber("Daniel");

const puppyBlog = new Blog();
puppyBlog.subscribe(colt);
puppyBlog.subscribe(daniel);
