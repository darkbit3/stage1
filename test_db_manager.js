const axios = require('axios');

async function testDbManagerUpdate() {
  try {
    console.log('🗄️ Testing DB Manager update-game endpoint...');
    
    const response = await axios.put('http://localhost:3007/api/v1/stage-a/update-game', {
      newPlayerId: 'P12345',
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
