const express = require('express')
const BoardGamesService = require('./boardgames-service')

const boardGamesRouter = express.Router()

boardGamesRouter
  .route('/')
  .get((req, res, next) => {
    BoardGamesService.getAllGames(req.app.get('db'))
      .then((games) => {
        res.json(BoardGamesService.serializeBoardGames(games))
      })
      .catch(next)
  })

module.exports = boardGamesRouter