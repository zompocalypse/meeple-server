const express = require('express')
const CollectionsService = require('./collections-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')
const { response } = require('../app')

const collectionsRouter = express.Router()
const jsonBodyParser = express.json()

collectionsRouter
  .route('/')
  .get((req, res, next) => {
    CollectionsService.getAllCollections(req.app.get('db'))
      .then((collections) => {
        res.json(CollectionsService.serializeCollections(collections))
      })
      .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { boardgame_id } = req.body
    const newItem = { boardgame_id }

    for (const [key, value] of Object.entries(newItem))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    newItem.user_id = req.user.id

    CollectionsService.insertIntoCollection(
      req.app.get('db'),
      newItem
    )
    .then(collection => {
      res
        .status(201)
    })
    .catch(next)
  })

collectionsRouter
  .route('/:collection_path')
  .get((req, res, next) => {
    CollectionsService.getByCollectionPath(
      req.app.get('db'),
      req.params.collection_path,
    )
    .then((collection) => {
      return res.json(collection)
    })
    .catch(next)
  })

  collectionsRouter
    .route('/:collection_path/:game_id')
    .get((req, res, next) => {
      CollectionsService.getByGameId(
        req.app.get('db'),
        req.params.collection_path,
        req.params.game_id
      )
      .then((game) => {
        return res.json(game)
      })
      .catch(next)
    })



module.exports = collectionsRouter