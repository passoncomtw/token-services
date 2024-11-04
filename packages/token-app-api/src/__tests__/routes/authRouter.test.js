const { mockApp } = require('../server.test');
const MOCK_USER = require('../../constants/mockUser');

describe('Test authorization user routes', () => {
  beforeAll(done => {
    try {
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(done => {
    try {
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should login by mockUser success', done => {
    const mockAdminUserLoginBody = MOCK_USER;
    mockApp
      .post('/auth')
      .set('Content-Type', 'application/json')
      .send(mockAdminUserLoginBody)
      .then(response => {
        expect(response.statusCode).toBe(200);
        // expect(response.body.success).toBe(true);
        // expect(response.body.data.token).not.toBe(undefined);
        done();
      }).catch(done);
  });
});
