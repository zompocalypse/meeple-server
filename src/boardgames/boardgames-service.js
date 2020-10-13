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
  getGameById(db, id, userId) {
    return BoardGamesService.getAllAvailableGames(db, userId)
      .where('bg.id', id)
      .first();
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
  insertBoardgame(db, newItem, userId) {
    return db
      .insert(newItem)
      .into('boardgames')
      .returning('*')
      .then(([boardgame]) => boardgame)
      .then((boardgame) =>
        BoardGamesService.getGameById(db, boardgame.id, userId)
      );
  },
  serializeBoardGames(games) {
    return games.map(this.serializeBoardGame);
  },
  serializeBoardGame(game) {
    const gameTree = new Treeize();
    const gameData = gameTree.grow([game]).getData()[0];

    return {
      id: gameData.id,
      title: xss(gameData.title),
    };
  },
};

module.exports = BoardGamesService;
