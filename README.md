# Meeple
##Board Game Collection Manager

Meeple is a board game collection manager app.  The app is designed to allow users to add board games to the application.  Theose globally availabel games can be added to their collection as well as other application users.  Once added to the collection, a user can rate and count the number of plays.  Users are also able to indicate ownership status of a particular board game with own, for sale, or want.

### Live site
https://meeple.vercel.com

### Server and Client Repos
- Server - https://github.com/zompocalypse/meeple-server
- Client - https://github.com/zompocalypse/meeple-client

### API Documentation
#### Auth  - User authentication endpoint
###### /api/auth/login
POST - requests must contain email and password in the request body.

------------
#### User - User registration endpoint
###### /api/users
POST - requests muct contain email, password, and collection path in the request body

------------

#### Boardgames - Boardgames endpoints
###### /api/boardgames
GET - retrieve all available games for authenticated user.  Requests must include user_id in request body
POST - add new boardgame to application.  Requests must include title, tagline, description, type, minimum_players, and maximum_players in request body.

###### /api/boardgames/:boardgame_id
GET - retrieve single board game based on the id provided in params (boardgame_id).

###### /api/boardgames/average/rating
GET - retrieve average ratings for all boardgames

------------

#### Collections - Collections endpoints
###### /api/collections
GET - retieve all collections for all users
POST - add new game to the authenticated user.  Request must include boardgame_id in request body.

###### /api/collections/:collection_path
GET - retrieve all games for a specific collection_path (user defined collection name).  collection_path pulled from params.

###### /api/collections/:collection_path/:collection_id
GET - retrieve specific collection item.  collection_path and collection_id pulled from params.
PATCH - Update owner_status, rating, or play_count for the specified collection_id.  Requests must contain at least one of owner_status, rating, OR play_count.
DELETE - Delete the specified collection_id.  collection_id retrieved from params.

![Home Page](https://imgur.com/1exia5c "Home Page")
![Login Page](https://imgur.com/Ng4U5e3 "Login Page")
![Collection Page](https://imgur.com/88O1xlW "Collection Page")
![Collection Item Detail Page](https://imgur.com/ak2EtDZ "Collection Item Detail Page")
![Available Board Game Page](https://imgur.com/tquBfxa "Available Board Game Page")

### Technology Used
###### Server
- Express
- PostgreSQL

###### Client
- REACT
