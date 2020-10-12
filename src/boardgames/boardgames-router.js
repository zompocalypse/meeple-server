const express = require('express');
const path = require('path');
const BoardGamesService = require('./boardgames-service');
const { requireAuth } = require('../middleware/jwt-auth');

const boardGamesRouter = express.Router();
const jsonBodyParser = express.json();

boardGamesRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const user_id = req.user.id;
    BoardGamesService.getAllAvailableGames(req.app.get('db'), user_id)
      .then((games) => {
        res.json(BoardGamesService.serializeBoardGames(games));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
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

    BoardGamesService.all(requireAuth)
      .insertBoardgame(req.app.get('db'), newGame)
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
  .all(requireAuth)
  .get((req, res, next) => {
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

module.exports = boardGamesRouter;
