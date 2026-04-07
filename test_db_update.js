const axios = require('axios');

async function testDbManagerUpdate() {
  try {
    console.log('🗄️ Testing DB Manager update-game endpoint...');
    
    // First check current game state
    console.log('\n📋 Checking current game state...');
    const currentGameResponse = await axios.get('http://localhost:3007/api/v1/stage-a/last-game-id');
    
    if (currentGameResponse.data && currentGameResponse.data.success) {
      console.log('Current game:', currentGameResponse.data.data);
    }
    
    // Try with a new player ID
    const newPlayerId = 'P' + Math.floor(Math.random() * 100000);
    console.log(`\n🎯 Using new player ID: ${newPlayerId}`);
    
    const response = await axios.put('http://localhost:3007/api/v1/stage-a/update-game', {
      newPlayerId: newPlayerId,
      newBoardNumber: 456,
      amount: 10
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 DB Manager Response:', response.data);
    
    if (response.data && response.data.success) {
      console.log('✅ DB Manager update successful!');
      console.log('Updated game data:', response.data.data);
    } else {
      console.log('❌ DB Manager update failed:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing DB Manager update:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testDbManagerUpdate();
