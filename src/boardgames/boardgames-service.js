const xss = require('xss');
const Treeize = require('treeize');

const BoardGamesService = {
  getAllGames(db) {
    return db
      .from('boardgames AS bg')
      .select(
        'bg.id',
        'bg.title',
        'bg.tagline',
        'bg.description',
        'bg.type',
        'bg.minimum_players',
        'bg.maximum_players'
      );
  },
  getGameById(db, id) {
    return BoardGamesService.getAllGames(db).where('bg.id', id).first();
  },
  getRatingForBoardGames(db) {
    return db
      .from('collections AS c')
      .select(
        db.raw('ROUND(AVG(c.rating), 1) AS "average_rating"'),
        'c.boardgame_id'
      )
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
  serializeBoardGames(games) {
    return games.map(this.serializeBoardGame);
  },
  serializeBoardGame(game) {
    const gameTree = new Treeize();
    const gameData = gameTree.grow([game]).getData()[0];

    return {
      id: gameData.id,
      title: xss(gameData.title),
      tagline: xss(gameData.tagline),
      description: xss(gameData.description),
      type: xss(gameData.type),
      minimum_players: Number(gameData.minimum_players) || 0,
      maximum_players: Number(gameData.maximum_players) || 0,
      date_created: gameData.date_created,
    };
  },
};

module.exports = BoardGamesService;
