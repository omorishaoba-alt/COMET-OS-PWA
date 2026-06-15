const FLOW = [
  "PVN",
  "TX",
  "PAY",
  "REPORT",
  "TAQ",
  "VERIFY"
];

const STORAGE_KEY = "COMET_LEDGER_V1";

let state = {
  index: 0,
  data: {},
  lastHash: "GENESIS"
};

const app = document.getElementById("app");

/* -------------------------
   PERSISTENCE LOAD
-------------------------- */
function loadLedger() {

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {

    const parsed = JSON.parse(saved);

    state = parsed;

  } catch (e) {

    console.error("LEDGER CORRUPTED - RESETTING");

    localStorage.removeItem(STORAGE_KEY);

  }

}

/* -------------------------
   PERSISTENCE SAVE
-------------------------- */
function saveLedger() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

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
   LEDGER HASH
-------------------------- */
async function createLedgerHash(step, payload, prevHash) {

  return await TrustEngine.createStageHash(
    step + prevHash,
    payload
  );

}

/* -------------------------
   CORE ENGINE
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
        console.error("LEDGER BLOCKED");
        return;
      }

      state.data[step] = {
        payload,
        hash,
        prevHash: state.lastHash
      };

      state.lastHash = hash;

      if (state.index < FLOW.length - 1) {
        state.index++;
      }

      saveLedger();
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
   DAY 0 TEST HARNESS (WITH RECOVERY CHECK)
-------------------------- */
window.runDay0Tests = async function () {

  const resultBox = document.getElementById("result");

  let pass = true;

  const steps = Object.keys(COMET.state.data);

  // -------------------------
  // FLOW ORDER CHECK
  // -------------------------
  const flowOk =
    steps.every((s, i) => s === FLOW[i]);

  if (!flowOk) pass = false;

  // -------------------------
  // CHAIN VALIDATION
  // -------------------------
  let prev = "GENESIS";

  for (const step of steps) {

    const item = COMET.state.data[step];

    if (item.prevHash !== prev) {
      pass = false;
      break;
    }

    const expected =
      await TrustEngine.createStageHash(
        step + prev,
        item.payload
      );

    if (expected !== item.hash) {
      pass = false;
      break;
    }

    prev = item.hash;

  }

  resultBox.innerHTML =
    pass
      ? "DAY 0 PASS ✓ PERSISTENT CHAIN VALID"
      : "DAY 0 FAIL ✗ PERSISTENCE BROKEN";

};

/* -------------------------
   INIT (WITH RECOVERY)
-------------------------- */
loadLedger();
render();
