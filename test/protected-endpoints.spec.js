const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', function () {
  let db;

  const {
    testUsers,
    testCollections,
    testGames,
  } = helpers.makeMeepleFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach('insert collections', () =>
    helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
  );

  const protectedEndpoints = [
    {
      name: 'GET /api/collections/',
      path: '/api/collections/',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/collections/:collection_path',
      path: '/api/collections/cpath',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/collections/:collection_path/:collection_id:',
      path: '/api/collections/cpath/1',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/boardgames/',
      path: '/api/boardgames/',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/boardgames/:boardgame_id',
      path: '/api/boardgames/1',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/boardgames/average/rating',
      path: '/api/boardgames/average/rating',
      method: supertest(app).get,
    },
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return endpoint
          .method(endpoint.path)
          .set(
            'Authorization',
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: `Unauthorized request` });
      });

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { email: 'user-not-existy', id: 1 };
        return endpoint
          .method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });
    });
  });
});
