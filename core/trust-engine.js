const TrustEngine = {

  async createStageHash(stage, payload) {

    const data = {
      stage,
      payload
    };

    return await sha256(JSON.stringify(data));
  },

  async validateStage(stage, payload, hash) {

    const expected = await this.createStageHash(
      stage,
      payload
    );

    return expected === hash;
  }

};
