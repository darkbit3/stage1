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

// GET /api/stage-b - Get all Stage B records
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, gameId, playerId, status } = req.query;
    
    const filters = {};
    if (gameId) filters.gameId = gameId;
    if (playerId) filters.playerId = playerId;
    if (status) filters.status = status;
    
    const result = await dbManager.getStageB(filters);
    
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

// GET /api/stage-b/:id - Get specific Stage B record
router.get('/:id', async (req, res, next) => {
  try {
    const result = await dbManager.getStageB({ id: req.params.id });
    const record = (result.data || result).find(item => item._id === req.params.id || item.id === req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Stage B record not found'
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

// POST /api/stage-b - Create new Stage B record
router.post('/', async (req, res, next) => {
  try {
    const {
      gameId,
      playerId,
      amount,
      totalBet,
      owner,
      selectedBoard,
      cardData
    } = req.body;
    
    if (!gameId || !playerId || !owner) {
      return res.status(400).json({
        success: false,
        error: 'gameId, playerId, and owner are required'
      });
    }
    
    const stageBData = {
      gameId,
      playerId,
      amount: amount || 0,
      totalBet: totalBet || 0,
      owner,
      selectedBoard,
      status: 'active',
      cardData: {
        cardId: cardData?.cardId || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cardNumbers: cardData?.cardNumbers || [],
        cardType: cardData?.cardType || 'standard',
        generatedAt: new Date(),
        cardTemplate: cardData?.cardTemplate || 'classic',
        freeSpace: cardData?.freeSpace !== false
      },
      cardValidation: {
        isValid: true,
        validationErrors: [],
        validatedAt: new Date()
      }
    };
    
    const result = await dbManager.createStageB(stageBData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Stage B record created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/stage-b/:id - Update Stage B record
router.put('/:id', async (req, res, next) => {
  try {
    const updateData = req.body;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    const result = await dbManager.updateStageB(req.params.id, updateData);
    
    res.json({
      success: true,
      data: result,
      message: 'Stage B record updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/stage-b/:id - Delete Stage B record
router.delete('/:id', async (req, res, next) => {
  try {
    await dbManager.deleteStageB(req.params.id);
    
    res.json({
      success: true,
      message: 'Stage B record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stage-b/game/:gameId - Get all records for a specific game
router.get('/game/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { status } = req.query;
    
    const filters = { gameId };
    if (status) filters.status = status;
    
    const result = await dbManager.getStageB(filters);
    
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

// GET /api/stage-b/player/:playerId - Get all records for a specific player
router.get('/player/:playerId', async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const { status, gameId } = req.query;
    
    const filters = { playerId };
    if (status) filters.status = status;
    if (gameId) filters.gameId = gameId;
    
    const result = await dbManager.getStageB(filters);
    
    // Calculate player statistics
    const records = result.data || result;
    const stats = {
      totalCards: records.length,
      activeCards: records.filter(r => r.status === 'active').length,
      validatedCards: records.filter(r => r.cardValidation?.isValid).length,
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

// POST /api/stage-b/generate-cards - Generate cards for players
router.post('/generate-cards', async (req, res, next) => {
  try {
    const { gameId, playerId, cardType = 'standard', quantity = 1 } = req.body;
    
    if (!gameId || !playerId) {
      return res.status(400).json({
        success: false,
        error: 'gameId and playerId are required'
      });
    }
    
    const cards = [];
    
    for (let i = 0; i < quantity; i++) {
      const cardNumbers = generateBingoCard();
      const cardData = {
        gameId,
        playerId,
        amount: 0,
        totalBet: 0,
        owner: 'system',
        status: 'generated',
        cardData: {
          cardId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
          cardNumbers,
          cardType,
          generatedAt: new Date(),
          cardTemplate: 'classic',
          freeSpace: true
        }
      };
      
      const result = await dbManager.createStageB(cardData);
      cards.push(result);
    }
    
    res.status(201).json({
      success: true,
      data: cards,
      message: `${quantity} card(s) generated successfully`
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/stage-b/batch - Batch operations
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
            result = await dbManager.createStageB(operation.data);
            break;
          case 'update':
            result = await dbManager.updateStageB(operation.id, operation.data);
            break;
          case 'delete':
            result = await dbManager.deleteStageB(operation.id);
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

// Helper function to generate bingo card numbers
function generateBingoCard() {
  const card = [];
  const usedNumbers = new Set();
  
  // B column (1-15)
  for (let i = 0; i < 5; i++) {
    let num;
    do {
      num = Math.floor(Math.random() * 15) + 1;
    } while (usedNumbers.has(num));
    usedNumbers.add(num);
    card.push(num);
  }
  
  // I column (16-30)
  for (let i = 0; i < 5; i++) {
    let num;
    do {
      num = Math.floor(Math.random() * 15) + 16;
    } while (usedNumbers.has(num));
    usedNumbers.add(num);
    card.push(num);
  }
  
  // N column (31-45) with free space in center
  for (let i = 0; i < 5; i++) {
    if (i === 2) {
      card.push(0); // Free space
    } else {
      let num;
      do {
        num = Math.floor(Math.random() * 15) + 31;
      } while (usedNumbers.has(num));
      usedNumbers.add(num);
      card.push(num);
    }
  }
  
  // G column (46-60)
  for (let i = 0; i < 5; i++) {
    let num;
    do {
      num = Math.floor(Math.random() * 15) + 46;
    } while (usedNumbers.has(num));
    usedNumbers.add(num);
    card.push(num);
  }
  
  // O column (61-75)
  for (let i = 0; i < 5; i++) {
    let num;
    do {
      num = Math.floor(Math.random() * 15) + 61;
    } while (usedNumbers.has(num));
    usedNumbers.add(num);
    card.push(num);
  }
  
  return card;
}

// Error handling middleware
router.use(handleDatabaseError);

module.exports = router;
