window.VERIFY = {

  render(state) {

    return `
      <h2>VERIFY</h2>

      <button onclick="runDay0Tests()">
        RUN VALIDATION
      </button>

      <pre id="output">
${JSON.stringify(state.data, null, 2)}
      </pre>

      <div id="result"></div>
    `;

  }

};
