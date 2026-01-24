const fly = {
  fly() {
    return `${this.name} flies!!!`;
  },
  land() {
    return `${this.name}, the ${this.species}, returns to earth`;
  },
};

const swim = {
  swim() {
    return `${this.name} swims underwater! Wow!`;
  },
};
class Animal {
  constructor(name, species) {
    this.name = name;
    this.species = species;
  }
  greet() {
    return `${this.name} says hi`;
  }
}

const bernie = new Animal("Bernie", "Pelican");
Object.assign(bernie, fly);
Object.assign(bernie, swim);
