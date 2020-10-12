const knex = require('knex');
const jwt = require('jsonwebtoken');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', function () {
  let db;

  const { testUsers } = helpers.makeMeepleFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`POST /api/auth/login`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['email', 'password'];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it(`responds 400 'invalid email or password' when bad email`, () => {
      const userInvalidUser = { email: 'user-not', password: 'existy' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUser)
        .expect(400, { error: `Incorrect email or password` });
    });

    it(`responds 400 'invalid email or password' when bad password`, () => {
      const userInvalidUser = { email: testUser.email, password: 'incorrect' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUser)
        .expect(400, { error: `Incorrect email or password` });
    });

    it(`responds 200 and JWT auth token using secret when valid creds`, () => {
      const userValidCreds = {
        email: testUser.email,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        {
          user_id: testUser.id,
          collection_path: testUser.collection_path,
          first_name: testUser.first_name,
        },
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256',
        }
      );
      return supertest(app)
        .post('/api/auth/login')
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });
});