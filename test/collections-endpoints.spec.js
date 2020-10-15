const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');

describe('Collections Endpoints', function () {
  let db;

  const {
    testUsers,
    testCollections,
    testGames,
  } = helpers.makeMeepleFixtures();

  const {
    maliciousUsers,
    maliciousCollections,
    maliciousGames,
  } = helpers.makeMaliciousMeepleFixtures();

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

  describe('GET /api/collections', () => {
    context('When no collections in the database', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/collections')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('When collections are in the database', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it(`responds with 200 and all collections`, () => {
        return supertest(app)
          .get('/api/collections')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('collections AS c')
              .select(
                'c.id',
                'c.user_id',
                'c.boardgame_id',
                'bg.title',
                'bg.tagline',
                'bg.description',
                'bg.type',
                'bg.minimum_players',
                'bg.maximum_players',
                'c.rating',
                'c.play_count',
                'c.owner_status',
                'u.collection_path'
              )
              .join('boardgames AS bg', 'c.boardgame_id', 'bg.id')
              .join('users AS u', 'c.user_id', 'u.id')
          );
      });
    });
  });

  describe('POST /api/collections', () => {
    context('When adding new collections to the database', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('creates a collection, responds with 201, and the new collection', () => {
        this.retries(3);
        const newCollection = {
          boardgame_id: testGames[2].id,
        };
        return supertest(app)
          .post('/api/collections')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newCollection)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property('id');
            expect(res.body.user_id).to.eql(testUsers[0].id);
            expect(res.body.title).to.eql(testGames[2].title);
            expect(res.body.tagline).to.eql(testGames[2].tagline);
            expect(res.body.description).to.eql(testGames[2].description);
            expect(res.body.type).to.eql(testGames[2].type);
            expect(res.body.minimum_players).to.eql(
              testGames[2].minimum_players
            );
            expect(res.body.maximum_players).to.eql(
              testGames[2].maximum_players
            );
            expect(res.body).to.have.property('rating');
            expect(res.body).to.have.property('play_count');
            expect(res.body).to.have.property('owner_status');
            expect(res.headers.location).to.eql(
              `/api/collections/${testUsers[0].collection_path}/${res.body.id}`
            );
          })
          .expect((res) => {
            db.from('collections AS c')
              .select(
                'c.id',
                'c.user_id',
                'c.boardgame_id',
                'bg.title',
                'bg.tagline',
                'bg.description',
                'bg.type',
                'bg.minimum_players',
                'bg.maximum_players',
                'c.rating',
                'c.play_count',
                'c.owner_status',
                'u.collection_path'
              )
              .join('boardgames AS bg', 'c.boardgame_id', 'bg.id')
              .join('users AS u', 'c.user_id', 'u.id')
              .where('c.id', `${res.body.id}`)
              .first()
              .then((row) => {
                expect(row.user_id).to.eql(testUsers[0].id);
                expect(row.boardgame_id).to.eql(testGames[2].id);
                expect(row.title).to.eql(testGames[2].title);
                expect(row.tagline).to.eql(testGames[2].tagline);
                expect(row.description).to.eql(testGames[2].description);
                expect(row.type).to.eql(testGames[2].type);
                expect(row.minimum_players).to.eql(
                  testGames[2].minimum_players
                );
                expect(row.maximum_players).to.eql(
                  testGames[2].maximum_players
                );
              });
          });
      });

      const requiredFields = ['boardgame_id'];
      requiredFields.forEach((field) => {
        const newCollection = {
          boardgame_id: '3',
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newCollection[field];

          return supertest(app)
            .post('/api/collections')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newCollection)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            });
        });
      });
    });
  });

  describe('GET /api/collections/:collection_path', () => {
    context('When no collections for the specified collection path', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get(`/api/collections/${testUsers[0].collection_path}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('When collections for the specified collection path', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('responds with 200 and the requested collection', () => {
        return supertest(app)
          .get(`/api/collections/${testUsers[0].collection_path}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('collections AS c')
              .select(
                'c.id',
                'c.user_id',
                'c.boardgame_id',
                'bg.title',
                'bg.tagline',
                'bg.description',
                'bg.type',
                'bg.minimum_players',
                'bg.maximum_players',
                'c.rating',
                'c.play_count',
                'c.owner_status',
                'u.collection_path'
              )
              .join('boardgames AS bg', 'c.boardgame_id', 'bg.id')
              .join('users AS u', 'c.user_id', 'u.id')
              .where('c.id', `${testUsers[0].collection_path}`)
              .first()
          );
      });
    });
  });

  describe('GET /api/collections/:collection_path/:collection_id', () => {
    context('When no collection for the given id', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('responds with 200 and an empty list', () => {
        const collectionId = 123456789;
        return supertest(app)
          .get(
            `/api/collections/${testUsers[0].collection_path}/${collectionId}`
          )
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {
            error: `Collection doesn't exist`,
          });
      });
    });

    context('When there are collections for the given id', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('responds with 200 and the requested collection', () => {
        return supertest(app)
          .get(
            `/api/collections/${testUsers[0].collection_path}/${testCollections[0].id}`
          )
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('collections AS c')
              .select(
                'c.id',
                'c.user_id',
                'c.boardgame_id',
                'bg.title',
                'bg.tagline',
                'bg.description',
                'bg.type',
                'bg.minimum_players',
                'bg.maximum_players',
                'c.rating',
                'c.play_count',
                'c.owner_status',
                'u.collection_path'
              )
              .join('boardgames AS bg', 'c.boardgame_id', 'bg.id')
              .join('users AS u', 'c.user_id', 'u.id')
              .where('c.id', `${testCollections[0].id}`)
          );
      });
    });

    context('When XSS attack (collections)', () => {
      beforeEach('insert malicious fixture', () =>
        helpers.seedMeepleTables(
          db,
          maliciousUsers,
          maliciousCollections,
          maliciousGames
        )
      );

      it('removes XSS attack content', () => {
        const expectedCleanedCollection = helpers.makeExpectedMaliciousCollection();
        return supertest(app)
          .get(
            `/api/collections/${testUsers[0].collection_path}/${maliciousCollections[0].id}`
          )
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('collections AS c')
              .select(
                'c.id',
                'c.user_id',
                'c.boardgame_id',
                'bg.title',
                'bg.tagline',
                'bg.description',
                'bg.type',
                'bg.minimum_players',
                'bg.maximum_players',
                'c.rating',
                'c.play_count',
                'c.owner_status',
                'u.collection_path'
              )
              .join('boardgames AS bg', 'c.boardgame_id', 'bg.id')
              .join('users AS u', 'c.user_id', 'u.id')
              .where('c.id', `${maliciousCollections[0].id}`)
          )
          .expect((res) => {
            expect(res.body.id).to.eql(expectedCleanedCollection[0].id);
            expect(res.body.boardgame_id).to.eql(
              expectedCleanedCollection[0].boardgame_id
            );
            expect(res.body.user_id).to.eql(
              expectedCleanedCollection[0].user_id
            );
            expect(res.body.title).to.eql(expectedCleanedCollection[0].title);
            expect(res.body.tagline).to.eql(
              expectedCleanedCollection[0].tagline
            );
            expect(res.body.description).to.eql(
              expectedCleanedCollection[0].description
            );
            expect(res.body.type).to.eql(expectedCleanedCollection[0].type);
            expect(res.body.minimum_players).to.eql(
              expectedCleanedCollection[0].minimum_players
            );
            expect(res.body.maximum_players).to.eql(
              expectedCleanedCollection[0].maximum_players
            );
            expect(res.body.rating).to.eql(expectedCleanedCollection[0].rating);
            expect(res.body.play_count).to.eql(
              expectedCleanedCollection[0].play_count
            );
            expect(res.body.owner_status).to.eql(
              expectedCleanedCollection[0].owner_status
            );
          });
      });
    });
  });

  describe('PATCH /api/collections/:collection_path/:collection_id', () => {
    context('When no collection for the given id', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('responds with 404', () => {
        const idToUpdate = 123456789;
        return supertest(app)
          .patch(
            `/api/collections/${testUsers[0].collection_path}/${idToUpdate}`
          )
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {
            error: `Collection doesn't exist`,
          });
      });
    });

    context('When collection for the given id', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('responds with 404', () => {
        const idToUpdate = testCollections[0].id;
        const updateToCollection = {
          rating: 5,
          play_count: 3,
          owner_status: 'Own',
        };
        const updatedCollection = {
          ...testCollections[idToUpdate],
          ...updateToCollection,
        };
        return supertest(app)
          .patch(
            `/api/collections/${testUsers[0].collection_path}/${idToUpdate}`
          )
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updatedCollection)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(
                `/api/collections/${testUsers[0].collection_path}/${idToUpdate}`
              )
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(() =>
                db
                  .from('collections AS c')
                  .select(
                    'c.id',
                    'c.user_id',
                    'c.boardgame_id',
                    'bg.title',
                    'bg.tagline',
                    'bg.description',
                    'bg.type',
                    'bg.minimum_players',
                    'bg.maximum_players',
                    'c.rating',
                    'c.play_count',
                    'c.owner_status',
                    'u.collection_path'
                  )
                  .join('boardgames AS bg', 'c.boardgame_id', 'bg.id')
                  .join('users AS u', 'c.user_id', 'u.id')
                  .where('c.id', `${idToUpdate}`)
                  .first()
              )
          );
      });
    });
  });

  describe('DELETE /api/collections/:collection_path/:collection_id', () => {
    context('When no collection for the given id', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('responds with 404', () => {
        const collectionId = 123456789;
        return supertest(app)
          .delete(
            `/api/collections/${testUsers[0].collection_path}/${collectionId}`
          )
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {
            error: `Collection doesn't exist`,
          });
      });
    });

    context('When collection for the given id', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('responds with 204 and removes the collection', () => {
        const idToDelete = 1;

        return supertest(app)
          .delete(
            `/api/collections/${testUsers[0].collection_path}/${idToDelete}`
          )
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(
                `/api/collections/${testUsers[0].collection_path}/${idToDelete}`
              )
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(404)
          );
      });
    });
  });
});
