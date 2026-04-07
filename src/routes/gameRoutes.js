const express = require('express');
const router = express.Router();

// Mock game data for Stage 1 (Initial Registration)
let games = [
  {
    id: 1,
    name: 'Bingo Game 1',
    stage: 'Stage 1',
    status: 'registration',
    players: [],
    maxPlayers: 100,
    createdAt: new Date().toISOString()
  }
];

// GET /api/games - Get all games
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: games,
    count: games.length,
    stage: 'Stage 1 - Registration'
  });
});

// GET /api/games/:id - Get specific game
router.get('/:id', (req, res) => {
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (!game) {
    return res.status(404).json({
      success: false,
      error: 'Game not found'
    });
  }
  res.json({
    success: true,
    data: game
  });
});

// POST /api/games - Create new game
router.post('/', (req, res) => {
  const { name, maxPlayers = 100 } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Game name is required'
    });
  }
  
  const newGame = {
    id: games.length + 1,
    name,
    stage: 'Stage 1',
    status: 'registration',
    players: [],
    maxPlayers,
    createdAt: new Date().toISOString()
  };
  
  games.push(newGame);
  
  res.status(201).json({
    success: true,
    data: newGame,
    message: 'Game created successfully'
  });
});

// PUT /api/games/:id - Update game
router.put('/:id', (req, res) => {
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (!game) {
    return res.status(404).json({
      success: false,
      error: 'Game not found'
    });
  }
  
  const { name, maxPlayers, status } = req.body;
  
  if (name) game.name = name;
  if (maxPlayers) game.maxPlayers = maxPlayers;
  if (status) game.status = status;
  
  res.json({
    success: true,
    data: game,
    message: 'Game updated successfully'
  });
});

// DELETE /api/games/:id - Delete game
router.delete('/:id', (req, res) => {
  const gameIndex = games.findIndex(g => g.id === parseInt(req.params.id));
  if (gameIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Game not found'
    });
  }
  
  const deletedGame = games.splice(gameIndex, 1)[0];
  
  res.json({
    success: true,
    data: deletedGame,
    message: 'Game deleted successfully'
  });
});

// POST /api/games/:id/register - Register player for game
router.post('/:id/register', (req, res) => {
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (!game) {
    return res.status(404).json({
      success: false,
      error: 'Game not found'
    });
  }
  
  const { playerId, playerName } = req.body;
  
  if (!playerId || !playerName) {
    return res.status(400).json({
      success: false,
      error: 'Player ID and name are required'
    });
  }
  
  if (game.players.length >= game.maxPlayers) {
    return res.status(400).json({
      success: false,
      error: 'Game is full'
    });
  }
  
  if (game.players.find(p => p.id === playerId)) {
    return res.status(400).json({
      success: false,
      error: 'Player already registered'
    });
  }
  
  game.players.push({
    id: playerId,
    name: playerName,
    registeredAt: new Date().toISOString()
  });
  
  res.json({
    success: true,
    data: game,
    message: 'Player registered successfully'
  });
});

module.exports = router;
