const context = new AudioContext();
const slider = document.querySelector("#freqSlider");
const playBtn = document.querySelector("#playBtn");
const stopBtn = document.querySelector("#stopBtn");
const freqLabel = document.querySelector("#freqLabel");

let oscillator = null;
playBtn.addEventListener("click", () => {
  oscillator = context.createOscillator();
  oscillator.type = "sawtooth";
  oscillator.frequency.value = slider.value;
  oscillator.connect(context.destination);
  oscillator.start();
});

slider.addEventListener("input", (e) => {
  const frequency = e.target.value;
  freqLabel.textContent = `Frequency: ${frequency}Hz`;
  if (oscillator) {
    oscillator.frequency.value = frequency;
  }
});

stopBtn.addEventListener("click", () => {
  if (oscillator) {
    oscillator.stop();
    oscillator = null;
  }
});
