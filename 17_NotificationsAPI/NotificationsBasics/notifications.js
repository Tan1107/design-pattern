let notification;
async function showNotification() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    notification = new Notification("Look at my cat!", {
      body: "This is the body of my first notification! I'm so excited :) ",
      icon: "blue.png",
      data: {
        url: "blah.com",
        person: "timbo jimbo",
      },
    });
    notification.addEventListener("click", () => {
      console.log("CLICKED THE NOTIFICATION!");
      console.log(notification);
      window.focus();
      notification.close();
    });
    notification.addEventListener("close", () => {
      console.log("CLOSED THE NOTIFICATION!");
    });
  }
}

document.querySelector("#btn").addEventListener("click", showNotification);
