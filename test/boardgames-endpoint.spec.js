const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');

describe('Boardgames Endpoints', function () {
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

  describe('GET /api/boardgames', () => {
    context('When no boardgames in the database', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/boardgames')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('When boardgames are in the database', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it(`responds with 200 and all available board games not in user's collection`, () => {
        return supertest(app)
          .get('/api/boardgames')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('boardgames AS bg')
              .select('bg.id', 'bg.title')
              .whereNotIn(
                'id',
                db
                  .select('boardgame_id')
                  .from('collections')
                  .where('user_id', testUsers[0].id)
              )
              .orderBy('bg.title')
          );
      });
    });

    context('When an XSS attack (boardgame)', () => {
      beforeEach('insert malicious fixture', () =>
        helpers.seedMeepleTables(
          db,
          maliciousUsers,
          maliciousCollections,
          maliciousGames
        )
      );

      it('removes XSS attack content', () => {
        const expectedCleanedBoardGames = helpers.makeExpectedMaliciousBoardGames();
        return supertest(app)
          .get('/api/boardgames')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('boardgames AS bg')
              .select('bg.id', 'bg.title')
              .whereNotIn(
                'id',
                db
                  .select('boardgame_id')
                  .from('collections')
                  .where('user_id', testUsers[0].id)
              )
              .orderBy('bg.title')
          )
          .expect((res) => {
            expect(res.body[0].id).to.eql(expectedCleanedBoardGames[0].id);
            expect(res.body[0].title).to.eql(
              expectedCleanedBoardGames[0].title
            );
          });
      });
    });
  });

  describe('POST /api/boardgames', () => {
    context('When adding new boardgames to the database', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('creates a boardgames, responds with 201, and the new boardgame', () => {
        this.retries(3);
        const newGame = {
          title: 'New Board Game',
          tagline: 'A new game for the database',
          description:
            'Wowsers.  This new board game is new and it should be in the database.  We did it',
          type: 'Strategy',
          minimum_players: 2,
          maximum_players: 5,
        };
        return supertest(app)
          .post('/api/boardgames')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newGame)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property('id');
            expect(res.body.title).to.eql(newGame.title);
            expect(res.body.tagline).to.eql(newGame.tagline);
            expect(res.body.description).to.eql(newGame.description);
            expect(res.body.type).to.eql(newGame.type);
            expect(res.body.minimum_players).to.eql(newGame.minimum_players);
            expect(res.body.maximum_players).to.eql(newGame.maximum_players);
            expect(res.headers.location).to.eql(
              `/api/boardgames/${res.body.id}`
            );
            const expectedDate = new Date().toLocaleString();
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect((res) => {
            db.from('boardgames')
              .select('*')
              .where('id', `${res.body.id}`)
              .first()
              .then((row) => {
                expect(row.title).to.eql(newGame.title);
                expect(row.tagline).to.eql(newGame.tagline);
                expect(row.description).to.eql(newGame.description);
                expect(row.type).to.eql(newGame.type);
                expect(row.minimum_players).to.eql(newGame.minimum_players);
                expect(row.maximum_players).to.eql(newGame.maximum_players);
                const expectedDate = new Date().toLocaleString();
                const actualDate = new Date(
                  res.body.date_created
                ).toLocaleString();
                expect(actualDate).to.eql(expectedDate);
              });
          });
      });

      const requiredFields = [
        'title',
        'tagline',
        'description',
        'type',
        'minimum_players',
        'maximum_players',
      ];
      requiredFields.forEach((field) => {
        const newGame = {
          title: 'New Board Game',
          tagline: 'A new game for the database',
          description:
            'Wowsers.  This new board game is new and it should be in the database.  We did it',
          type: 'Strategy',
          minimum_players: 2,
          maximum_players: 5,
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newGame[field];

          return supertest(app)
            .post('/api/boardgames')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newGame)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            });
        });
      });
    });
  });

  describe('GET /api/boardgames/:boardgame_id', () => {
    context('When no boardgames in the database', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('resonds with 404', () => {
        const gameId = 1;
        return supertest(app)
          .get(`/api/boardgames/${gameId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Boardgame doesn't exist` });
      });
    });

    context('When there are boardgames in the database', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('resonds with 404', () => {
        const gameId = 123456789;
        return supertest(app)
          .get(`/api/boardgames/${gameId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Boardgame doesn't exist` });
      });

      it('responds with 200 and the requested boardgame', () => {
        const boardGameId = 1;
        return supertest(app)
          .get(`/api/boardgames/${boardGameId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('boardgames AS bg')
              .select('*')
              .where('bg.id', `${boardGameId}`)
              .first()
          );
      });
    });

    context('When XSS attack (boardgame)', () => {
      beforeEach('insert malicious fixture', () =>
        helpers.seedMeepleTables(
          db,
          maliciousUsers,
          maliciousCollections,
          maliciousGames
        )
      );

      it('removes XSS attack content', () => {
        const expectedCleanedBoardGame = helpers.makeExpectedMaliciousBoardGame();
        return supertest(app)
          .get(`/api/boardgames/${maliciousGames[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(maliciousUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('boardgames AS bg')
              .select('*')
              .where('bg.id', `${maliciousGames[0].id}`)
              .first()
          )
          .expect((res) => {
            expect(res.body.id).to.eql(expectedCleanedBoardGame[0].id);
            expect(res.body.title).to.eql(expectedCleanedBoardGame[0].title);
            expect(res.body.tagline).to.eql(
              expectedCleanedBoardGame[0].tagline
            );
            expect(res.body.description).to.eql(
              expectedCleanedBoardGame[0].description
            );
            expect(res.body.type).to.eql(expectedCleanedBoardGame[0].type);
            expect(res.body.minimum_players).to.eql(
              expectedCleanedBoardGame[0].minimum_players
            );
            expect(res.body.maximum_players).to.eql(
              expectedCleanedBoardGame[0].maximum_players
            );
            expect(res.body.date_created).to.eql(
              expectedCleanedBoardGame[0].date_created
            );
          });
      });
    });
  });

  describe('GET /api/boardgames/average/rating', () => {
    context('When no boardgames in the database', () => {
      beforeEach('insert Users', () => helpers.seedUsers(db, testUsers));

      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/boardgames/average/rating')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('When there are boardgames in the database', () => {
      beforeEach('insert games, collections, and users', () =>
        helpers.seedMeepleTables(db, testUsers, testCollections, testGames)
      );

      it('responds with 200 and the requested average boardgame ratings', () => {
        return supertest(app)
          .get('/api/boardgames/average/rating')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(() =>
            db
              .from('collections AS c')
              .select(
                db.raw('ROUND(AVG(c.rating), 1) AS "average_rating"'),
                'c.boardgame_id'
              )
              .whereNot('c.rating', '0')
              .groupBy('c.boardgame_id')
          );
      });
    });
  });
});
