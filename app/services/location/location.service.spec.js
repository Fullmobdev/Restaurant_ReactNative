import 'isomorphic-fetch';
import sinon from 'sinon';
import * as services from './location.service';

const location = { latitude: -74.8394, longitude: 198.9303 };

describe("Get Radius From Service", () => {
  it('Should get the radius to search', () => {
    expect.assertions(1);
    sinon.stub(services, 'getCurrentLocation')
    const result = 1;
    expect(services.getRadius()).toEqual(result);
  });
});

describe("Get Location from Address", async () => {

  it('Should get the Geolocation for a given address', async () => {
    expect.assertions(1);
    await services.getLocationFromAddress('85 Broad Street, New York')
    .then(data => {
      expect(data).toBeTruthy();
    });
  });
});

// describe("Get Location from Address", async () => {
//
//   it('Should get an exception if no address is given', async () => {
//     afterEach(() => {
//       services.getCurrentLocation.restore();
//     });
//     expect.assertions(1);
//     await services.getLocationFromAddress()
//     .then(data => {
//       expect(data).toBeTruthy();
//     });
//   });
// });

describe("Get Location from Address", async () => {
  afterEach(() => {
    services.getCurrentLocation.restore();
  });

  it('Should get an error if exception occurs during address lookup', async () => {
    sinon.stub(services, 'getLocationFromAddress')
      .returns(new Promise((resolve, reject) => {
        reject('ERROR OCCURED!');
     }));
    expect.assertions(1);
    await services.getLocationFromAddress('85 Broad Street, New York')
    .catch(data => {
      expect(data).toBeTruthy();
    });
  });
});

// describe("Get Location from Address", () => {
//   afterEach(() => {
//     services.getCurrentLocation.restore();
//   });
//
//   it('Should get the current location when no address is given', () => {
//     sinon.stub(services, 'getCurrentLocation')
//     .returns(new Promise((resolve, reject) => {
//       resolve(location);
//     }));
//
//     expect.assertions(1);
//      services.getLocationFromAddress('')
//     .then(data => {
//       expect(data).toBeTruthy();
//     });
//   });
// });
