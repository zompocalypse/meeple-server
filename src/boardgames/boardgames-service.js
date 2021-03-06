const xss = require('xss');
const Treeize = require('treeize');

const BoardGamesService = {
  getAllAvailableGames(db, user_id) {
    return db
      .from('boardgames AS bg')
      .select('bg.id', 'bg.title')
      .whereNotIn(
        'id',
        db.select('boardgame_id').from('collections').where('user_id', user_id)
      )
      .orderBy('bg.title');
  },
  getGameById(db, id) {
    return db.from('boardgames AS bg').select('*').where('bg.id', id).first();
  },
  getRatingsForBoardGames(db) {
    return db
      .from('collections AS c')
      .select(
        db.raw('ROUND(AVG(c.rating), 1) AS "average_rating"'),
        'c.boardgame_id'
      )
      .whereNot('c.rating', '0')
      .groupBy('c.boardgame_id');
  },
  getRatingByGameId(db, id) {
    return BoardGamesService.getRatingForBoardGames(db)
      .where('c.boardgame_id', id)
      .first();
  },
  insertBoardgame(db, newItem) {
    return db
      .insert(newItem)
      .into('boardgames')
      .returning('*')
      .then(([boardgame]) => boardgame)
      .then((boardgame) => BoardGamesService.getGameById(db, boardgame.id));
  },
  serializeAvailableBoardGames(games) {
    return games.map(this.serializeAvailableBoardGame);
  },
  serializeAvailableBoardGame(game) {
    const gameTree = new Treeize();
    const gameData = gameTree.grow([game]).getData()[0];

    return {
      id: gameData.id,
      title: xss(gameData.title),
    };
  },
  serializeBoardGame(game) {
    return {
      id: game.id,
      title: xss(game.title),
      tagline: xss(game.tagline),
      description: xss(game.description),
      type: xss(game.type),
      minimum_players: Number(game.minimum_players),
      maximum_players: Number(game.maximum_players),
      date_created: game.date_created,
    };
  },
};

module.exports = BoardGamesService;
