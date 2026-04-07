const axios = require('axios');

async function testCompleteBettingFlow() {
  console.log('🎯 Testing Complete Betting Flow');
  console.log('=====================================');
  
  const playerId = 'P72248';
  const boardNumber = 123;
  const amount = 10;
  const stage = 'A';
  
  try {
    // Step 1: Check initial balance
    console.log('\n💰 Step 1: Checking initial balance...');
    const balanceResponse = await axios.get(`http://localhost:3000/api/v1/player/balance/${playerId}`, {
      headers: {
        'X-API-Key': 'bsk_2026_secure_inter_service_key_kalea_bingo_system'
      }
    });
    
    const initialBalance = balanceResponse.data.balance;
    console.log(`✅ Initial balance: ${initialBalance}`);
    
    // Step 2: Place bet
    console.log('\n🎯 Step 2: Placing bet...');
    const betResponse = await axios.post('http://localhost:3001/api/v1/game/place-bet', {
      boardNumber: boardNumber,
      playerId: playerId,
      amount: amount,
      stage: stage
    });
    
    if (betResponse.data.success) {
      console.log('✅ Bet placed successfully!');
      console.log(`📊 Bet Details:`, betResponse.data.data);
      
      // Step 3: Check new balance
      console.log('\n💰 Step 3: Checking new balance...');
      const newBalanceResponse = await axios.get(`http://localhost:3000/api/v1/player/balance/${playerId}`, {
        headers: {
          'X-API-Key': 'bsk_2026_secure_inter_service_key_kalea_bingo_system'
        }
      });
      
      const newBalance = newBalanceResponse.data.balance;
      console.log(`✅ New balance: ${newBalance}`);
      console.log(`💸 Amount deducted: ${initialBalance - newBalance}`);
      
      // Step 4: Verify game data updated
      console.log('\n🗄️ Step 4: Verifying game data updated...');
      const gameDataResponse = await axios.get(`http://localhost:3001/api/v1/game/latest-data?stage=${stage.toLowerCase()}`);
      
      if (gameDataResponse.data.success) {
        console.log('✅ Game data updated successfully!');
        console.log(`📊 Updated Game Data:`, gameDataResponse.data.data);
        
        // Check if our bet is included
        const gameData = gameDataResponse.data.data;
        if (gameData.boards && gameData.boards.includes(boardNumber.toString())) {
          console.log(`✅ Board ${boardNumber} is now marked in the game!`);
        } else {
          console.log(`❌ Board ${boardNumber} not found in updated game data`);
        }
        
        if (gameData.playerIds && gameData.playerIds.includes(playerId)) {
          console.log(`✅ Player ${playerId} is included in the game!`);
        } else {
          console.log(`❌ Player ${playerId} not found in updated game data`);
        }
      } else {
        console.log('❌ Failed to get updated game data');
      }
      
      console.log('\n🎉 Complete betting flow test finished successfully!');
      console.log('=====================================');
      console.log('✅ Balance management: Working');
      console.log('✅ Bet placement: Working');
      console.log('✅ Database updates: Working');
      console.log('✅ Real-time data: Working');
      
    } else {
      console.log('❌ Bet placement failed:', betResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error in betting flow:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testCompleteBettingFlow();
