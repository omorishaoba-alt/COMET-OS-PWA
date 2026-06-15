window.VERIFY = {

render(state) {

return `
  <h2>VERIFY</h2>

  <button onclick="runValidation()">
    VALIDATE TRUST
  </button>

  <pre>${JSON.stringify(state.data, null, 2)}</pre>

  <div id="result"></div>
`;

}

};
