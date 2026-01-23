// CHAT WITH NOTIFICATIONS API
// Use this file with the websockets chat app (the previous section.)
function getRoomNameFromURL() {
  const urlParts = document.URL.split("/");
  if (urlParts.length < 3) {
    console.error("Invalid URL: Room name not found.");
    return null;
  }
  return urlParts.at(-1);
}

// Helper function to create chat message elements
// This function does too much and should probably be split up!
function createMessageElement(msg) {
  const item = document.createElement("li");
  if (msg.type === "note") {
    const text = document.createElement("i");
    text.textContent = msg.text;
    item.appendChild(text);
  } else if (msg.type === "chat") {
    if (msg.name !== username && document.visibilityState !== "visible") {
      showNotification(msg);
    }
    item.innerHTML = `<b>${msg.name}:</b> ${msg.text}`;
  }
  return item;
}

async function showNotification({ name, text }) {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const notification = new Notification(`New Chat message from ${name}`, {
      body: text,
    });
    notification.addEventListener("click", () => {
      notification.close();
      window.focus();
    });
  }
}

// Initialize WebSocket connection
function initializeWebSocket(roomName, username) {
  const socket = new WebSocket(`ws://localhost:3000/chat/${roomName}`);

  socket.onopen = () => {
    console.log("WebSocket Opened");
    socket.send(JSON.stringify({ type: "join", name: username }));
  };

  socket.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    const messageElement = createMessageElement(msg);
    document.querySelector("#messages").appendChild(messageElement);
  };

  socket.onerror = (evt) => {
    console.error("WebSocket Error", evt);
  };

  socket.onclose = () => {
    console.log("WebSocket Closed");
  };

  return socket;
}

const roomName = getRoomNameFromURL();
const username = prompt("Enter your username (no spaces)");
const socket = initializeWebSocket(roomName, username);

document.querySelector("#msg-form").addEventListener("submit", (evt) => {
  evt.preventDefault();
  const input = document.querySelector("#messageInput");
  socket.send(JSON.stringify({ type: "chat", text: input.value }));
  input.value = "";
});
