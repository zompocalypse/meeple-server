const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: xss } = require('xss');

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      collections,
      boardgames,
      users
      RESTART IDENTITY CASCADE`
  );
}

function makeBoardGamesArray() {
  return [
    {
      id: 1,
      title: 'First Game',
      tagline: 'First tagline',
      description: 'This is a description of the first game',
      type: 'Strategy',
      minimum_players: 2,
      maximum_players: 4,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      title: 'Second Game',
      tagline: 'Second tagline',
      description: 'This is a description of the second game',
      type: 'Family',
      minimum_players: 2,
      maximum_players: 5,
      date_created: '2029-01-23T17:28:32.615Z',
    },
    {
      id: 3,
      title: 'Third Game',
      tagline: 'Third tagline',
      description: 'This is a description of the third game',
      type: 'Party',
      minimum_players: 2,
      maximum_players: 8,
      date_created: '2029-01-24T18:28:32.615Z',
    },
  ];
}

function makeMaliciousBoardGamesArray() {
  return [
    {
      id: 1,
      title: '<strong>1st</strong><script>alert("xss");</script>',
      tagline: 'First <script>alert("xss");</script>tagline',
      description:
        'This is a<script>alert("xss");</script> description <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"> of the <strong>first game</strong>',
      type: 'Strategy',
      minimum_players: 2,
      maximum_players: 4,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      title: '<strong>2nd</strong><script>alert("xss");</script>',
      tagline: 'Second <script>alert("xss");</script>tagline',
      description:
        'This is a<script>alert("xss");</script> description of the <strong>second game</strong>',
      type: 'Family',
      minimum_players: 2,
      maximum_players: 5,
      date_created: '2029-01-23T17:28:32.615Z',
    },
    {
      id: 3,
      title: '<strong>3rd</strong><script>alert("xss");</script>',
      tagline: 'Third <script>alert("xss");</script>tagline',
      description:
        'This is a<script>alert("xss");</script> description of the <strong>third game</strong>',
      type: 'Party',
      minimum_players: 2,
      maximum_players: 8,
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
      boardgame_id: games[0].id,
      user_id: users[0].id,
      rating: 7,
      play_count: 3,
      owner_status: 'Own',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      boardgame_id: games[1].id,
      user_id: users[0].id,
      rating: 5,
      play_count: 1,
      owner_status: 'Want',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      boardgame_id: games[2].id,
      user_id: users[3].id,
      rating: 9,
      play_count: 9,
      owner_status: 'Sell',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      boardgame_id: games[2].id,
      user_id: users[1].id,
      rating: 9,
      play_count: 1,
      owner_status: 'Own',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 5,
      boardgame_id: games[0].id,
      user_id: users[2].id,
      rating: 2,
      play_count: 1,
      owner_status: 'Own',
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

function makeMaliciousMeepleFixtures() {
  const maliciousUsers = makeUsersArray();
  const maliciousGames = makeMaliciousBoardGamesArray();
  const maliciousCollections = makeCollectionsArray(
    maliciousUsers,
    maliciousGames
  );
  return { maliciousUsers, maliciousGames, maliciousCollections };
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

function seedMeepleTables(db, users, collections, boardgames) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into('boardgames').insert(boardgames);
    await trx.raw(`SELECT setval('boardgames_id_seq', ?)`, [
      boardgames[boardgames.length - 1].id,
    ]);
    if (collections.length) {
      await trx.into('collections').insert(collections);
      await trx.raw(`SELECT setval('collections_id_seq', ?)`, [
        collections[collections.length - 1].id,
      ]);
    }
  });
}

function makeExpectedMaliciousBoardGames() {
  return [
    {
      id: 3,
      title: '<strong>3rd</strong>&lt;script&gt;alert("xss");&lt;/script&gt;',
    },
  ];
}

function makeExpectedMaliciousBoardGame() {
  return [
    {
      id: 1,
      title: '<strong>1st</strong>&lt;script&gt;alert("xss");&lt;/script&gt;',
      tagline: 'First &lt;script&gt;alert("xss");&lt;/script&gt;tagline',
      description:
        'This is a&lt;script&gt;alert("xss");&lt;/script&gt; description <img src="https://url.to.file.which/does-not.exist"> of the <strong>first game</strong>',
      type: 'Strategy',
      minimum_players: 2,
      maximum_players: 4,
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeExpectedMaliciousCollection() {
  return [
    {
      id: 1,
      boardgame_id: 1,
      user_id: 1,
      title: '<strong>1st</strong>&lt;script&gt;alert("xss");&lt;/script&gt;',
      tagline: 'First &lt;script&gt;alert("xss");&lt;/script&gt;tagline',
      description:
        'This is a&lt;script&gt;alert("xss");&lt;/script&gt; description <img src="https://url.to.file.which/does-not.exist"> of the <strong>first game</strong>',
      type: 'Strategy',
      minimum_players: 2,
      maximum_players: 4,
      rating: 7,
      play_count: 3,
      owner_status: 'Own',
      collection_path: 'cpath1',
    },
  ];
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
  makeMaliciousMeepleFixtures,
  seedUsers,
  makeAuthHeader,
  cleanTables,
  seedMeepleTables,
  makeExpectedMaliciousBoardGames,
  makeExpectedMaliciousBoardGame,
  makeExpectedMaliciousCollection,
};
