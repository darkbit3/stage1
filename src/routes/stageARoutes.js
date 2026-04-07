const express = require('express');
const DatabaseManager = require('../models/DatabaseManager');
const router = express.Router();

const dbManager = new DatabaseManager();

// Middleware to handle database errors
const handleDatabaseError = (error, req, res, next) => {
  console.error('Database operation error:', error);
  res.status(500).json({
    success: false,
    error: 'Database operation failed',
    message: error.message
  });
};

// GET /api/stage-a - Get all Stage A records
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, gameId, playerId, status } = req.query;
    
    const filters = {};
    if (gameId) filters.gameId = gameId;
    if (playerId) filters.playerId = playerId;
    if (status) filters.status = status;
    
    const result = await dbManager.getStageA(filters);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = (result.data || result).slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: (result.data || result).length,
        pages: Math.ceil((result.data || result).length / limit)
      },
      filters: { gameId, playerId, status }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stage-a/:id - Get specific Stage A record
router.get('/:id', async (req, res, next) => {
  try {
    const result = await dbManager.getStageA({ id: req.params.id });
    const record = (result.data || result).find(item => item._id === req.params.id || item.id === req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Stage A record not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/stage-a - Create new Stage A record
router.post('/', async (req, res, next) => {
  try {
    const {
      gameId,
      playerId,
      amount,
      totalBet,
      owner,
      selectedBoard,
      registrationData
    } = req.body;
    
    if (!gameId || !playerId || !owner) {
      return res.status(400).json({
        success: false,
        error: 'gameId, playerId, and owner are required'
      });
    }
    
    const stageAData = {
      gameId,
      playerId,
      amount: amount || 0,
      totalBet: totalBet || 0,
      owner,
      selectedBoard,
      status: 'active',
      registrationData: {
        playerName: registrationData?.playerName || '',
        playerEmail: registrationData?.playerEmail || '',
        registrationTime: new Date(),
        gameMode: registrationData?.gameMode || 'standard',
        maxPlayers: registrationData?.maxPlayers || 100
      }
    };
    
    const result = await dbManager.createStageA(stageAData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Stage A record created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/stage-a/:id - Update Stage A record
router.put('/:id', async (req, res, next) => {
  try {
    const updateData = req.body;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    const result = await dbManager.updateStageA(req.params.id, updateData);
    
    res.json({
      success: true,
      data: result,
      message: 'Stage A record updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/stage-a/:id - Delete Stage A record
router.delete('/:id', async (req, res, next) => {
  try {
    await dbManager.deleteStageA(req.params.id);
    
    res.json({
      success: true,
      message: 'Stage A record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stage-a/game/:gameId - Get all records for a specific game
router.get('/game/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { status } = req.query;
    
    const filters = { gameId };
    if (status) filters.status = status;
    
    const result = await dbManager.getStageA(filters);
    
    res.json({
      success: true,
      data: result.data || result,
      gameId,
      count: (result.data || result).length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stage-a/player/:playerId - Get all records for a specific player
router.get('/player/:playerId', async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const { status, gameId } = req.query;
    
    const filters = { playerId };
    if (status) filters.status = status;
    if (gameId) filters.gameId = gameId;
    
    const result = await dbManager.getStageA(filters);
    
    // Calculate player statistics
    const records = result.data || result;
    const stats = {
      totalGames: records.length,
      activeGames: records.filter(r => r.status === 'active').length,
      completedGames: records.filter(r => r.status === 'completed').length,
      totalBet: records.reduce((sum, r) => sum + (r.totalBet || 0), 0),
      totalPayout: records.reduce((sum, r) => sum + (r.payout || 0), 0),
      averageBet: records.length > 0 ? records.reduce((sum, r) => sum + (r.totalBet || 0), 0) / records.length : 0
    };
    
    res.json({
      success: true,
      data: records,
      playerId,
      statistics: stats,
      filters: { status, gameId }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/stage-a/batch - Batch operations
router.post('/batch', async (req, res, next) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: 'Operations must be an array'
      });
    }
    
    const results = [];
    
    for (const operation of operations) {
      try {
        let result;
        switch (operation.type) {
          case 'create':
            result = await dbManager.createStageA(operation.data);
            break;
          case 'update':
            result = await dbManager.updateStageA(operation.id, operation.data);
            break;
          case 'delete':
            result = await dbManager.deleteStageA(operation.id);
            break;
          default:
            result = { error: 'Invalid operation type' };
        }
        
        results.push({
          operation: operation.type,
          id: operation.id,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          operation: operation.type,
          id: operation.id,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: 'Batch operations completed'
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
router.use(handleDatabaseError);

module.exports = router;
