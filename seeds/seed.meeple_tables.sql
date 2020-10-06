BEGIN;

TRUNCATE
  collections,
  boardgames,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (email, first_name, last_name, password)
VALUES
  (
    'jason.stankevich@gmail.com',
    'Jason',
    'Stankevich',
    '$2a$12$Ab0ZctIwib97q8ECbNo/tuUYlfTZrSbfiwQ35Opv2tZxlYwRndJU.'
  ),
  (
    'boba.fett@gmail.com',
    'Boba',
    'Fett',
    '$2a$12$pIZBiogUsUnQBri.dIMjlunig2yS6.kc7iV6rmRDmsCngjycXjlfq'
  ),
  (
    'chewie@gmail.com',
    'Chew',
    'Bacca',
    '$2a$12$xFcMxf8rzFguOeAGfp20DefgBjSab9PPE6P/WndlcWsO.RF.LN/Ny'
  )
;

INSERT INTO boardgames (title, tagline, description, type, minimum_players, maximum_players)
VALUES
  (
    'Ticket to Ride',
    'Build your railroad across North America to connect cities and collect tickets!',
    'With elegantly simple gameplay, Ticket to Ride can be learned in under 15 minutes. Players collect cards of various types of train cars they then use to claim railway routes in North America. The longer the routes, the more points they earn. Additional points come to those who fulfill Destination Tickets – goal cards that connect distant cities; and to the player who builds the longest continuous route.',
    'Family',
    '2',
    '5'
  ),
  (
    'Alchemists',
    'Showcase your alchemical know-how by publishing theories in this app-driven game.',
    'In Alchemists, two to four budding alchemists compete to discover the secrets of their mystical art. Points can be earned in various ways, but most points are earned by publishing theories – correct theories, that is — and therein lies the problem.',
    'Strategy',
    '2',
    '4'
  ),
  (
    'Axis & Allies (1981)',
    'Re-fight WWII on a global scale with plastic soldiers, tanks, planes, and ships! ',
    'Axis & Allies depicts WWII on a grand scale, full global level. Up to five players can play on two different teams. The Axis which has Germany and Japan, and the Allies which has the USA, the United Kingdom, and the USSR. A full map of the world is provided, broken up in various chunks similar to Risk. The game comes with gobs of plastic miniatures that represent various military units during WWII. Players have at their disposal infantry, armor, fighters, bombers, battleships, aircraft carriers, submarines, troop transports, anti-air guns, and factories. All of the units perform differently and many have special functions. Players have to work together with their teammates in order to coordinate offenses and decide how best to utilize their production points. Players also have the option of risking production resources on the possibility of developing a super technology that might turn the tide of war.',
    'Wargames',
    '2',
    '5'
  ),
  (
    'Roll for the Galaxy',
    'Utilize your dice populace to develop technologies, settle worlds, and ship goods.',
    'Roll for the Galaxy is a dice game of building space empires for 2–5 players. Your dice represent your populace, whom you direct to develop new technologies, settle worlds, and ship goods. The player who best manages his workers and builds the most prosperous empire wins!',
    'Strategy',
    '2',
    '5'
  ),
  (
    'Caverna: The Cave Farmers',
    'From a simple cave, expand your dwarven home through mining, agriculture, and more.',
    'Following along the same lines as its predecessor (Agricola), Caverna: The Cave Farmers is a worker-placement game at heart, with a focus on farming. In the game, you are the bearded leader of a small dwarf family that lives in a little cave in the mountains. You begin the game with a farmer and his spouse, and each member of the farming family represents an action that the player can take each turn. Together, you cultivate the forest in front of your cave and dig deeper into the mountain. You furnish the caves as dwellings for your offspring as well as working spaces for small enterprises.',
    'Strategy',
    '1',
    '7'
  ),
  (
    'Lords of Waterdeep',
    'Deploy agents and hire adventurers to expand your control over the city of Waterdeep.',
    'Waterdeep, the City of Splendors – the most resplendent jewel in the Forgotten Realms, and a den of political intrigue and shady back-alley dealings. In this game, the players are powerful lords vying for control of this great city. Its treasures and resources are ripe for the taking, and that which cannot be gained through trickery and negotiation must be taken by force!',
    'Strategy',
    '2',
    '5'
  ),
  (
    'My Little Scythe',
    'Gather fruits and gems, encounter events, and start friendships (or pie fights!).',
    'My Little Scythe is a competitive, family-friendly game in which each player controls 2 animal miniatures embarking upon an adventure in the Kingdom of Pomme./nIn an effort to be the first to earn 4 trophies from 8 possible categories, players take turns choosing to Move, Seek, or Make. These actions will allow players to increase their friendship and pies, power up their actions, complete quests, learn magic spells, deliver gems and apples to Castle Everfree, and perhaps even engage in a pie fight.',
    'Family',
    '1',
    '6'
  ),
  (
    'Space Alert',
    'This ship runs itself! Wait, why are our shields down and where did you go? Help us!',
    'Space Alert is a cooperative team survival game. Players become crew members of a small spaceship scanning dangerous sectors of the galaxy. The missions last just 10 real-time minutes (hyperspace jump, sector scan, hyperspace jump back) and the only task the players have is to protect their ship.',
    'Thematic',
    '1',
    '5'
  )
;

INSERT INTO collections (user_id, boardgame_id, rating, play_count)
VALUES
  (
    '1',
    '1',
    '8',
    '15'
  ),
  (
    '2',
    '1',
    '6',
    '5'
  ),
  (
    '3',
    '1',
    '3',
    '2'
  ),
  (
    '1',
    '4',
    '9',
    '7'
  ),
  (
    '3',
    '8',
    '7',
    '9'
  ),
  (
    '1',
    '6',
    '4',
    '11'
  ),
  (
    '1',
    '3',
    '9',
    '25'
  )
;

COMMIT;