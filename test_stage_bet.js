const axios = require('axios');

async function testStageServerBet() {
  try {
    console.log('🎯 Testing Stage Server bet endpoint directly...');
    
    const response = await axios.post('http://localhost:3001/api/v1/game/place-bet', {
      boardNumber: 125,
      playerId: 'P72248',
      amount: 10,
      stage: 'A'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Stage Server Response:', response.data);
    
    if (response.data && response.data.success) {
      console.log('✅ Stage Server bet successful!');
      console.log('Bet details:', response.data.data);
    } else {
      console.log('❌ Stage Server bet failed:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing Stage Server bet:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testStageServerBet();
