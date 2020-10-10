const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeBoardGamesArray() {
  return [
    {
      id: 1,
      image: '',
      title: 'First Game',
      tagline: 'First tagline',
      description: 'This is a description of the first game',
      type: 'Strategy',
      minimum_players: '2',
      maximum_players: '4',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      image: '',
      title: 'Second Game',
      tagline: 'Second tagline',
      description: 'This is a description of the second game',
      bg_type: 'Family',
      minimum_players: '2',
      maximum_players: '5',
      date_created: '2029-01-23T17:28:32.615Z',
    },
    {
      id: 3,
      image: '',
      title: 'Third Game',
      tagline: 'Third tagline',
      description: 'This is a description of the third game',
      bg_type: 'Party',
      minimum_players: '2',
      maximum_players: '8',
      date_created: '2029-01-24T18:28:32.615Z',
    },
  ];
}

function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'test-user-1@gmail.com',
      first_name: 'First1',
      last_name: 'Last1',
      password: 'password',
      collection_path: 'cpath1',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      email: 'test-user-2@gmail.com',
      first_name: 'First2',
      last_name: 'Last2',
      password: 'password',
      collection_path: 'cpath2',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      email: 'test-user-3@gmail.com',
      first_name: 'First3',
      last_name: 'Last3',
      password: 'password',
      collection_path: 'cpath3',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      email: 'test-user-4@gmail.com',
      first_name: 'First4',
      last_name: 'Last4',
      password: 'password',
      collection_path: 'cpath4',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeCollectionsArray(users, games) {
  return [
    {
      id: 1,
      bgame_id: games[0].id,
      user_id: users[0].id,
      rating: 7,
      num_plays: 3,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      bgame_id: games[1].id,
      user_id: users[0].id,
      rating: 5,
      num_plays: 1,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      bgame_id: games[2].id,
      user_id: users[3].id,
      rating: 9,
      num_plays: 9,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      bgame_id: games[2].id,
      user_id: users[1].id,
      rating: 9,
      num_plays: 1,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 5,
      bgame_id: games[0].id,
      user_id: users[2].id,
      rating: 2,
      num_plays: 1,
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeMeepleFixtures() {
  const testUsers = makeUsersArray();
  const testGames = makeBoardGamesArray();
  const testCollections = makeCollectionsArray(testUsers, testGames);
  return { testUsers, testGames, testCollections };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      collections,
      boardgames,
      users
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeBoardGamesArray,
  makeUsersArray,
  makeCollectionsArray,
  makeMeepleFixtures,
  seedUsers,
  makeAuthHeader,
  cleanTables,
};
