
const TrustEngine = {
  async hash(payload) {
    return sha256(JSON.stringify(payload));
  }
};
