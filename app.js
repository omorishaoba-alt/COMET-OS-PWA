const FLOW = [
"PVN",
"TX",
"PAY",
"REPORT",
"TAQ",
"VERIFY"
];

let state = {
index: 0,
data: {}
};

const app = document.getElementById("app");

function render() {

const step = FLOW[state.index];

const screen = document.createElement("div");

screen.className = "screen active";

screen.innerHTML = window[step].render(state);

app.innerHTML = "";

app.appendChild(screen);

}

window.COMET = {

next(payload = {}) {

const step = FLOW[state.index];

TrustEngine.createStageHash(
  step,
  payload
).then(hash => {

  state.data[step] = {
    payload,
    hash
  };

  if (state.index < FLOW.length - 1) {

    state.index++;

  }

  render();

});

return;

},

back() {

if (state.index > 0) {

  state.index--;

}

render();

},

state

};

render();
