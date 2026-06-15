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
  data: {},
  lastHash: "GENESIS"
};

const app = document.getElementById("app");

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
   LEDGER HASH GENERATOR
-------------------------- */
async function createLedgerHash(step, payload, prevHash) {

  return await TrustEngine.createStageHash(
    step + prevHash,
    payload
  );

}

/* -------------------------
   COMET CORE ENGINE
-------------------------- */
window.COMET = {

  next(payload = {}) {

    const step = FLOW[state.index];

    createLedgerHash(
      step,
      payload,
      state.lastHash
    ).then(async (hash) => {

      const valid =
        await TrustEngine.validateStage(
          step + state.lastHash,
          payload,
          hash
        );

      if (!valid) {
        console.error("LEDGER CHAIN BROKEN");
        return;
      }

      /* -------------------------
         STORE CHAIN LINK
      -------------------------- */
      state.data[step] = {
        payload,
        hash,
        prevHash: state.lastHash
      };

      /* -------------------------
         UPDATE CHAIN POINTER
      -------------------------- */
      state.lastHash = hash;

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
   DAY 0 TEST HARNESS (UPDATED)
-------------------------- */
window.runDay0Tests = async function () {

  const resultBox = document.getElementById("result");

  let pass = true;

  const steps = Object.keys(COMET.state.data);

  // -------------------------
  // TEST 1: FLOW ORDER
  // -------------------------
  const flowOk =
    steps.every((s, i) => s === FLOW[i]);

  if (!flowOk) pass = false;

  // -------------------------
  // TEST 2: CHAIN INTEGRITY
  // -------------------------
  let prev = "GENESIS";

  for (const step of steps) {

    const item = COMET.state.data[step];

    if (item.prevHash !== prev) {
      pass = false;
      break;
    }

    const expectedHash =
      await TrustEngine.createStageHash(
        step + prev,
        item.payload
      );

    if (expectedHash !== item.hash) {
      pass = false;
      break;
    }

    prev = item.hash;

  }

  // -------------------------
  // FINAL RESULT
  // -------------------------
  resultBox.innerHTML =
    pass
      ? "DAY 0 PASS ✓ LEDGER CHAIN VALID"
      : "DAY 0 FAIL ✗ CHAIN BROKEN";

};

/* -------------------------
   INIT
-------------------------- */
render();
