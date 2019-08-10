import * as services from './authentication.service';
import * as initService from '../../config/db/firebase.initialize';


beforeAll(() => {
  initService.initializeFirebaseAuthentication();
});

describe("Login Form Service", async () => {

  it('Should authenticate the user with email and password', async () => {
    expect.assertions(1);
    await services.loginWithEmailAndPassword('a@b.com', 'password')
    .then(data => {
      expect(data).toBeTruthy();
    });
  });

  it('Should handle errors', async () => {
    expect.assertions(1);
    await services.loginWithEmailAndPassword('', '')
    .then()
    .catch(error => {
      expect(error).toBeTruthy();
    });
  });

  it('Signs out the user', async () => {
      expect.assertions(1);
      const thenCallback = jest.fn();
      await services.logout().then(thenCallback);
      expect(thenCallback).toBeCalled();
  });
});
