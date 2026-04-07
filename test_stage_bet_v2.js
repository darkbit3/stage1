const axios = require('axios');

async function testStageServerBet() {
  try {
    console.log('🎯 Testing Stage Server bet endpoint directly...');
    
    // First check current game data to see what boards are taken
    console.log('\n📋 Checking current game state...');
    const gameDataResponse = await axios.get('http://localhost:3001/api/v1/game/latest-data?stage=a');
    
    if (gameDataResponse.data && gameDataResponse.data.success) {
      console.log('Current game data:', gameDataResponse.data.data);
      
      if (gameDataResponse.data.data.boards) {
        const takenBoards = gameDataResponse.data.data.boards.split(',');
        console.log('Taken boards:', takenBoards);
        
        // Find an available board
        let availableBoard = null;
        for (let i = 1; i <= 400; i++) {
          if (!takenBoards.includes(i.toString())) {
            availableBoard = i;
            break;
          }
        }
        
        if (availableBoard) {
          console.log(`\n🎯 Using available board: ${availableBoard}`);
          
          const response = await axios.post('http://localhost:3001/api/v1/game/place-bet', {
            boardNumber: availableBoard,
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
        } else {
          console.log('❌ No available boards found!');
        }
      } else {
        console.log('❌ No boards data in current game');
      }
    } else {
      console.log('❌ Failed to get current game data');
    }
    
  } catch (error) {
    console.error('❌ Error testing Stage Server bet:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testStageServerBet();
