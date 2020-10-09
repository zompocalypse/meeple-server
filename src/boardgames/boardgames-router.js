const express = require('express')
const path = require('path')
const BoardGamesService = require('./boardgames-service')
const { requireAuth } = require('../middleware/jwt-auth')

const boardGamesRouter = express.Router()
const jsonBodyParser = express.json()

boardGamesRouter
  .route('/')
  .get((req, res, next) => {
    BoardGamesService.getAllGames(req.app.get('db'))
      .then((games) => {
        res.json(BoardGamesService.serializeBoardGames(games))
      })
      .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { title, tagline, description, type, minimum_players, maximum_players } = req.body
    const newGame = { title, tagline, description, type, minimum_players, maximum_players }

    for (const [key, value] of Object.entries(newGame))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    BoardGamesService.insertBoardgame(
      req.app.get('db'),
      newGame
    )
      .then(game => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${game.id}`))
          .json(BoardGamesService.serializeBoardGame(game))
      })
      .catch(next)
  })

boardGamesRouter
  .route('/:boardgame_id')
  .get((req, res, next) => {
    BoardGamesService.getGameById(
      req.app.get('db'),
      req.params.boardgame_id
    )
      .then((game) => {
        res.json(BoardGamesService.serializeBoardGame(game))
      })
      .catch(next)
  })

boardGamesRouter
  .route('/:id/rating')
  .get((req, res, next) => {
    BoardGamesService.getRatingByGameId(
      req.app.get('db'),
      req.params.id
    )
      .then(rating => {
        return res.json(rating)
      })
      .catch(next)
  })

module.exports = boardGamesRouter