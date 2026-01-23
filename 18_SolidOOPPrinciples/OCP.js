// class AreaCalculator {
//   static calculate(shape) {
//     if (shape.type === "circle") {
//       return Math.PI * shape.radius ** 2;
//     } else if (shape.type === "square") {
//       return shape.side * shape.side;
//     } else if (shape.type === "triangle") {
//       console.log("AREA FOR TRIANGLE!");
//     }
//   }
//   static calculateAreas(shapes) {
//     return shapes.reduce(
//       (sum, shape) => sum + AreaCalculator.calculate(shape),
//       0
//     );
//   }
// }

// const circle = { type: "circle", radius: 5 };
// const square = { type: "square", side: 4 };

class Shape {
  area() {
    // OVERRIDE ME!!!!
    console.log("SHAPE DID NOT IMPLEMENT AREA!");
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }
  area() {
    return this.side * this.side;
  }
}

class Rectangle extends Shape {
  constructor(length, width) {
    super();
    this.length = length;
    this.width = width;
  }

  area() {
    return this.length * this.width;
  }
}

class AreaCalculator {
  static calculate(shape) {
    return shape.area();
  }
  static calculateAll(shapes) {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
  }
}

const c = new Circle(5);
const s = new Square(5);
const r = new Rectangle(10, 20);
