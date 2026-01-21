"use strict";

/** Chat rooms that can be joined/left/broadcast to. */

// in-memory storage of roomNames -> room

const rooms = new Map();

/** Room is a collection of listening members; this becomes a "chat room"
 *   where individual users can join/leave/broadcast to.
 */

class Room {
  /** Get room by that name, creating if nonexistent.
   * <p>
   * This uses a programming pattern often called a "registry" ---
   * users of this class only need to .get to find a room; they don't
   * need to know about the `rooms` variable that holds the rooms. To
   * them, the Room class manages all of this stuff for them.
   *
   * @param roomName {string} room to get
   **/

  static get(roomName) {
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Room(roomName));
    }

    return rooms.get(roomName);
  }

  /** Make a new room, starting with empty set of listeners.
   *
   * @param roomName {string} room name for new room
   * */

  constructor(roomName) {
    this.name = roomName;
    this.members = new Set();
  }

  /** Handle member joining a room.
   *
   * @param member {ChatUser} joining member
   * */

  join(member) {
    this.members.add(member);
  }

  /** Handle member leaving a room.
   *
   * @param member {ChatUser} leaving member
   * */

  leave(member) {
    this.members.delete(member);
  }

  /** Send message to all members in a room.
   *
   * @param data {string} message to send
   * */

  broadcast(data) {
    for (let member of this.members) {
      member.send(JSON.stringify(data));
    }
  }

  /** Return a Set containing all room members */

  getMembers() {
    return this.members;
  }

  /** Get a room member: returns member or undefined if not found.
   *
   * @param name {string} name of member to get
   * */

  getMember(name) {
    for (let member of this.members) {
      if (member.name === name) return member;
    }
  }
}

module.exports = Room;
