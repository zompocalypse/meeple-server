const express = require('express');
const CollectionsService = require('./collections-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');

const collectionsRouter = express.Router();
const jsonBodyParser = express.json();

collectionsRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    CollectionsService.getAllCollections(req.app.get('db'))
      .then((collections) => {
        return res.json(CollectionsService.serializeCollections(collections));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { boardgame_id } = req.body;
    const newItem = { boardgame_id };

    for (const [key, value] of Object.entries(newItem))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    newItem.user_id = req.user.id;

    CollectionsService.addToCollection(req.app.get('db'), newItem)
      .then((collection) => {
        return res
          .status(201)
          .location(
            path.posix.join(
              req.originalUrl,
              `${req.user.collection_path}/${collection.id}`
            )
          )
          .send(CollectionsService.serializeCollection(collection));
      })
      .catch(next);
  });

collectionsRouter
  .route('/:collection_path')
  .get(requireAuth, (req, res, next) => {
    CollectionsService.getByCollectionPath(
      req.app.get('db'),
      req.params.collection_path
    )
      .then((collection) => {
        return res.json(CollectionsService.serializeCollections(collection));
      })
      .catch(next);
  });

collectionsRouter
  .route('/:collection_path/:collection_id')
  .all(requireAuth, (req, res, next) => {
    CollectionsService.getByCollectionId(
      req.app.get('db'),
      req.params.collection_id
    )
      .then((collection) => {
        if (!collection) {
          return res.status(404).json({
            error: `Collection doesn't exist`,
          });
        }
        res.collection = collection;
        next();
      })
      .catch(next);
  })
  .get(requireAuth, (req, res, next) => {
    return res.json(CollectionsService.serializeCollection(res.collection));
  })
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    const { rating, owner_status, play_count } = req.body;
    const collectionToUpdate = { rating, owner_status, play_count };

    const numberOfValues = Object.values(collectionToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'rating', 'owner_status', or 'play_count'`,
        },
      });

    CollectionsService.updateCollectionItem(
      req.app.get('db'),
      req.params.collection_id,
      collectionToUpdate
    )
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    CollectionsService.deleteCollectionItem(
      req.app.get('db'),
      req.params.collection_id
    )
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = collectionsRouter;
