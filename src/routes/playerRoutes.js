const express = require('express');
const router = express.Router();

// Mock player data for Stage 1
let players = [
  {
    id: 'player1',
    name: 'John Doe',
    email: 'john@example.com',
    stage: 'Stage 1',
    registeredAt: new Date().toISOString(),
    games: []
  }
];

// GET /api/players - Get all players
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: players,
    count: players.length,
    stage: 'Stage 1 - Registration'
  });
});

// GET /api/players/:id - Get specific player
router.get('/:id', (req, res) => {
  const player = players.find(p => p.id === req.params.id);
  if (!player) {
    return res.status(404).json({
      success: false,
      error: 'Player not found'
    });
  }
  res.json({
    success: true,
    data: player
  });
});

// POST /api/players - Create new player
router.post('/', (req, res) => {
  const { id, name, email } = req.body;
  
  if (!id || !name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Player ID, name, and email are required'
    });
  }
  
  if (players.find(p => p.id === id)) {
    return res.status(400).json({
      success: false,
      error: 'Player ID already exists'
    });
  }
  
  const newPlayer = {
    id,
    name,
    email,
    stage: 'Stage 1',
    registeredAt: new Date().toISOString(),
    games: []
  };
  
  players.push(newPlayer);
  
  res.status(201).json({
    success: true,
    data: newPlayer,
    message: 'Player created successfully'
  });
});

// PUT /api/players/:id - Update player
router.put('/:id', (req, res) => {
  const player = players.find(p => p.id === req.params.id);
  if (!player) {
    return res.status(404).json({
      success: false,
      error: 'Player not found'
    });
  }
  
  const { name, email } = req.body;
  
  if (name) player.name = name;
  if (email) player.email = email;
  
  res.json({
    success: true,
    data: player,
    message: 'Player updated successfully'
  });
});

// DELETE /api/players/:id - Delete player
router.delete('/:id', (req, res) => {
  const playerIndex = players.findIndex(p => p.id === req.params.id);
  if (playerIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Player not found'
    });
  }
  
  const deletedPlayer = players.splice(playerIndex, 1)[0];
  
  res.json({
    success: true,
    data: deletedPlayer,
    message: 'Player deleted successfully'
  });
});

module.exports = router;
