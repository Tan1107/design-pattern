"use strict";

/** Fetch jokes from the icanhazdadjoke.com API */

const axios = require("axios");
const JOKES_API = "https://icanhazdadjoke.com/";

/** getRandomJoke
 * - gets a random joke
 * - returns joke or default message if error
 */

async function getRandomJoke() {
  let result;

  try {
    result = await axios.get(
      JOKES_API,
      {
        headers:
        {
          'Accept': 'application/json',
          'User-Agent': 'websocket groupchat exercise',
        }
      }
    );

  } catch (err) {
    return "No jokes right now, try again later!"
  }

  return result.data.joke;
}

module.exports = {
  getRandomJoke,
}