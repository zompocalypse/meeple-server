const express = require('express');
const path = require('path');
const BoardGamesService = require('./boardgames-service');
const { requireAuth } = require('../middleware/jwt-auth');

const boardGamesRouter = express.Router();
const jsonBodyParser = express.json();

boardGamesRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    const user_id = req.user.id;
    BoardGamesService.getAllAvailableGames(req.app.get('db'), user_id)
      .then((games) => {
        res.json(BoardGamesService.serializeAvailableBoardGames(games));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const {
      title,
      tagline,
      description,
      type,
      minimum_players,
      maximum_players,
    } = req.body;
    const newGame = {
      title,
      tagline,
      description,
      type,
      minimum_players,
      maximum_players,
    };

    for (const [key, value] of Object.entries(newGame))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    BoardGamesService.insertBoardgame(req.app.get('db'), newGame, req.user.id)
      .then((game) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${game.id}`))
          .json(BoardGamesService.serializeBoardGame(game));
      })
      .catch(next);
  });

boardGamesRouter
  .route('/:boardgame_id')
  .all(checkBoardGameExists)
  .get(requireAuth, (req, res, next) => {
    BoardGamesService.getGameById(req.app.get('db'), req.params.boardgame_id)
      .then((game) => {
        res.json(BoardGamesService.serializeBoardGame(game));
      })
      .catch(next);
  });

boardGamesRouter
  .route('/average/rating')
  .all(requireAuth)
  .get((req, res, next) => {
    BoardGamesService.getRatingsForBoardGames(req.app.get('db'))
      .then((rating) => {
        return res.json(rating);
      })
      .catch(next);
  });

async function checkBoardGameExists(req, res, next) {
  try {
    const game = await BoardGamesService.getGameById(
      req.app.get('db'),
      req.params.boardgame_id
    );

    if (!game)
      return res.status(404).json({
        error: `Boardgame doesn't exist`,
      });

    res.game = game;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = boardGamesRouter;
