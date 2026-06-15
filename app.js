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

window.runValidation = async function () {

  const stages = Object.keys(COMET.state.data);

  let valid = true;

  for (const stage of stages) {

    const item = COMET.state.data[stage];

    const ok = await TrustEngine.validateStage(
      stage,
      item.payload,
      item.hash
    );

    if (!ok) {
      valid = false;
      break;
    }

  }

  const result = document.getElementById("result");

  if (result) {
    result.innerHTML = valid
      ? "TRUST VALID"
      : "TRUST FAILED";
  }

};

render();
