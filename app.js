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

/* -------------------------
   IMMUTABLE STATE LOCK
-------------------------- */
function lockDeep(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      lockDeep(obj[key]);
    }
  });
  return Object.freeze(obj);
}

/* -------------------------
   RENDER ENGINE
-------------------------- */
function render() {

  const step = FLOW[state.index];

  const screen = document.createElement("div");

  screen.className = "screen active";

  screen.innerHTML = window[step].render(state);

  app.innerHTML = "";

  app.appendChild(screen);

}

/* -------------------------
   AUTO-GUARD VALIDATION
-------------------------- */
function isValidStage(step, payload, hash) {
  return TrustEngine.validateStage(step, payload, hash);
}

/* -------------------------
   COMET CORE ENGINE
-------------------------- */
window.COMET = {

  next(payload = {}) {

    const step = FLOW[state.index];

    TrustEngine.createStageHash(step, payload)
      .then(async (hash) => {

        const valid = await isValidStage(
          step,
          payload,
          hash
        );

        /* -------------------------
           AUTO-GUARD MODE
        -------------------------- */
        if (!valid) {
          console.error("AUTO-GUARD BLOCK: INVALID STAGE");
          return;
        }

        /* -------------------------
           IMMUTABLE STATE LOCK
        -------------------------- */
        const lockedEntry = lockDeep({
          payload,
          hash
        });

        state.data[step] = lockedEntry;

        if (state.index < FLOW.length - 1) {
          state.index++;
        }

        render();

      });

  },

  back() {

    if (state.index > 0) {
      state.index--;
    }

    render();

  },

  state

};

/* -------------------------
   DAY 0 TEST HARNESS
-------------------------- */
window.runDay0Tests = async function () {

  const resultBox = document.getElementById("result");

  let pass = true;

  const expectedFlow = [
    "PVN",
    "TX",
    "PAY",
    "REPORT",
    "TAQ",
    "VERIFY"
  ];

  const actualFlow = Object.keys(COMET.state.data);

  const flowOk =
    expectedFlow.length === actualFlow.length &&
    expectedFlow.every((step, i) => step === actualFlow[i]);

  if (!flowOk) pass = false;

  const stateOk =
    actualFlow.every(step => {
      const item = COMET.state.data[step];
      return item && item.payload !== undefined && item.hash !== undefined;
    });

  if (!stateOk) pass = false;

  for (const step of actualFlow) {

    const item = COMET.state.data[step];

    const ok = await TrustEngine.validateStage(
      step,
      item.payload,
      item.hash
    );

    if (!ok) {
      pass = false;
      break;
    }

  }

  resultBox.innerHTML =
    pass
      ? "DAY 0 PASS ✓ SYSTEM VALID"
      : "DAY 0 FAIL ✗ SYSTEM INVALID";

};

/* -------------------------
   INIT
-------------------------- */
render();
