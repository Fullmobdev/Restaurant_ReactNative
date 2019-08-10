import 'isomorphic-fetch';
import * as services from './search.service';

const location = { latitude: -74.8394, longitude: 198.9303 };
const radius = 1;

describe("Get Predictions for input", async () => {

  it('Should return empty result set for null input', async () => {
    expect.assertions(1);
    await services.getPredictionsForInput('', '', '')
    .then(data => {
      const expected = [];
      expect(data).toEqual(expected);
    });
  });
});

describe("Get Predictions for input", async () => {

  it('Should return result for input with at least one character', async () => {
    expect.assertions(1);
    console.log(global.CACHING_ENABLED);
    await services.getPredictionsForInput('A', location, radius)
    .then(data => {
      expect(data).toBeTruthy();
    });
  });
});

describe("Get Predictions for input", async () => {

  it('Should return result for input without a location', async () => {
    expect.assertions(1);
    await services.getPredictionsForInput('A', '', radius)
    .then(data => {
      expect(data).toBeTruthy();
    });
  });
});

describe("Get Predictions for input", async () => {

  it('Should return result for input without a radius', async () => {
    expect.assertions(1);
    await services.getPredictionsForInput('A', location, '')
    .then(data => {
      expect(data).toBeTruthy();
    });
  });
});

describe("Get Predictions for input", async () => {

  it('Should return error if unable to retrieve results for input', async () => {
    expect.assertions(1);
    await services.getPredictionsForInput('jlkdfjoiewlrkjlksdf', location, '')
    .catch(data => {
      expect(data).toBeTruthy();
    });
  });
});
