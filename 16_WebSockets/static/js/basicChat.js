// CLIENT SIDE JS CODE!!!

// Open websocket connection from the browser to the server
const urlParts = document.URL.split("/");
const roomName = urlParts.at(-1);
const socket = new WebSocket(`ws://localhost:3000/chat/${roomName}`);
const username = prompt("Enter your username.  (no spaces)");

socket.onopen = (evt) => {
  console.log("WEB SOCKET OPENED!!!");
  const data = { type: "join", name: username };
  socket.send(JSON.stringify(data));
};

socket.onmessage = (evt) => {
  console.log("NEW MESSAGE", evt);
  let msg = JSON.parse(evt.data);
  if (msg.type === "note") {
    const item = document.createElement("li");
    const text = document.createElement("i");
    text.textContent = msg.text;
    item.appendChild(text);
    document.querySelector("#messages").appendChild(item);
  } else if (msg.type === "chat") {
    const item = document.createElement("li");
    item.innerHTML = `<b>${msg.name}:</b> ${msg.text}`;
    document.querySelector("#messages").appendChild(item);
  }
};

socket.onerror = (evt) => {
  console.log("SOMETHING WENT WRONG!");
  console.log(evt);
};

socket.onclose = (evt) => {
  console.log("WEB SOCKET HAS BEEN CLOSED!!!!");
};

document.querySelector("#msg-form").addEventListener("submit", (evt) => {
  const input = document.querySelector("#messageInput");
  evt.preventDefault();
  const payload = JSON.stringify({ type: "chat", text: input.value });
  socket.send(payload);
  input.value = "";
});

// Do stuff eventually
