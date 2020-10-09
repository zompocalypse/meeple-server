const xss = require('xss')
const Treeize = require('treeize')

const CollectionsService = {
  getAllCollections(db) {
    return db
      .from('collections AS c')
      .select(
        'c.id',
        'c.user_id',
        'c.boardgame_id',
        'bg.title',
        'bg.tagline',
        'bg.description',
        'bg.type',
        'bg.minimum_players',
        'bg.maximum_players',
        'c.rating',
        'c.play_count',
        'c.owner_status',
        'u.collection_path'
      )
      .join(
        'boardgames AS bg',
        'c.boardgame_id',
        'bg.id',
      )
      .join(
        'users AS u',
        'c.user_id',
        'u.id'
      )
  },
  getByCollectionId(db, id) {
    CollectionsService.getAllCollections(db)
      .where('c.id', id)
  },
  getByCollectionPath(db, path) {
    return CollectionsService.getAllCollections(db)
      .where('u.collection_path', path)
  },
  getByGameId(db, path, gameId) {
    return CollectionsService.getAllCollections(db)
      .where({
        'c.boardgame_id': gameId,
        'u.collection_path': path,
      })
  },
  insertIntoCollection(db, newItem) {
    return db
      .insert(newItem)
      .into('collections')
      .returning('*')
      .then(([collection]) => collection)
      .then(collection => 
        CollectionsService.getByCollectionId(db, collection.id))
  },
  serializeCollections(collections) {
    return collections.map(
      this.serializeCollection
    )
  },
  serializeCollection(collection) {
    const collTree = new Treeize()
    const collData = collTree.grow([ collection ]).getData()[0]

    return {
      id: collData.id,
      user_id: Number(collData.user_id),
      boardgame_id: Number(collData.boardgame_id),
      title: xss(collData.title),
      tagline: xss(collData.tagline),
      description: xss(collData.description),
      type: xss(collData.type),
      minimum_players: Number(collData.minimum_players),
      maximum_players: Number(collData.maximum_players),
      rating: Number(collData.rating),
      play_count: Number(collData.play_count),
      owner_status: xss(collData.owner_status),
      date_created: collData.date_created
    }
  },

  serializeSingleCollection(collection) {
    return {
      id: collection.id,
      user_id: Number(collection.user_id),
      boardgame_id: Number(collection.boardgame_id),
      play_count: Number(collection.play_count),
      rating: Number(collection.rating),
      owner_status: xss(collection.owner_status),
    }
  }
}

module.exports = CollectionsService