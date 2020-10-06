const xss = require('xss')
const Treeize = require('treeize')

const BoardGamesService = {
  getAllGames(db) {
    return db
      .from('boardgames')
      .select('*')
  },
  serializeBoardGames(games) {
    return games.map(
      this.serializeBoardGame
    )
  },
  serializeBoardGame(game) {
    const gameTree = new Treeize()
    const gameData = gameTree.grow([ game ]).getData()[0]

    return {
      id: gameData.id,
      title: xss(gameData.title),
      tagline: xss(gameData.tagline),
      description: xss(gameData.description),
      type: xss(gameData.type),
      minimum_players: Number(gameData.minimum_players) || 0,
      maximum_players: Number(gameData.maximum_players) || 0,
      date_created: gameData.date_created
    }
  },
}

module.exports = BoardGamesService