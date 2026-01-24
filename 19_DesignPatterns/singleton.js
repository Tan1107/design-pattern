const ChickenFarm = (() => {
  let instance;
  const createInstance = () => ({ totalChickens: 100 });
  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

class DatabaseConnection {
  constructor() {
    if (!DatabaseConnection.instance) {
      this.connection = this.createConnection(); // assume createConnection establishes a database connection
      DatabaseConnection.instance = this;
    }
    return DatabaseConnection.instance;
  }

  createConnection() {
    // logic to connect to the database
    console.log("CREATING CONNECTION TO DATABASE!!!!");
    return { connection: "I am the database connection object" };
  }

  // Other database-related methods...
}
