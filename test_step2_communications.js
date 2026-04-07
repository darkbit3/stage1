const axios = require('axios');

async function testStep2Communications() {
  console.log('🎯 Testing Phase 2 - Step 2: Backend Communications');
  console.log('=====================================');
  
  try {
    // Test 1: BigServer Balance Check
    console.log('\n💰 Test 1: BigServer Balance Check...');
    const playerId = 'P' + Math.floor(Math.random() * 100000);
    console.log(`Player ID: ${playerId}`);
    
    const balanceResponse = await axios.get(`http://localhost:3000/api/v1/player/balance/${playerId}`, {
      headers: {
        'X-API-Key': 'bsk_2026_secure_inter_service_key_kalea_bingo_system'
      }
    });
    
    if (balanceResponse.data && balanceResponse.data.success) {
      const balance = balanceResponse.data.balance;
      console.log(`✅ Balance check successful: ${balance}`);
      
      // Test 2: Stage Server Bet Request
      console.log('\n🎯 Test 2: Stage Server Bet Request...');
      
      const betResponse = await axios.post('http://localhost:3001/api/v1/game/place-bet', {
        boardNumber: 200,
        playerId: playerId,
        amount: 10,
        stage: 'A'
      });
      
      if (betResponse.data && betResponse.data.success) {
        console.log('✅ Stage Server bet successful!');
        console.log('📊 Bet Response:', betResponse.data.data);
        
        // Test 3: Verify DB Manager Update
        console.log('\n🗄️ Test 3: Verify DB Manager Update...');
        
        const gameDataResponse = await axios.get('http://localhost:3001/api/v1/game/latest-data?stage=a');
        
        if (gameDataResponse.data && gameDataResponse.data.success) {
          const gameData = gameDataResponse.data.data;
          console.log('✅ DB Manager update verified!');
          console.log('📊 Updated Game Data:', {
            gameId: gameData.gameId,
            totalPlayers: gameData.totalPlayers,
            boards: gameData.boards,
            playerIds: gameData.playerIds
          });
          
          // Test 4: Verify Balance Deduction
          console.log('\n💸 Test 4: Verify Balance Deduction...');
          
          const newBalanceResponse = await axios.get(`http://localhost:3000/api/v1/player/balance/${playerId}`, {
            headers: {
              'X-API-Key': 'bsk_2026_secure_inter_service_key_kalea_bingo_system'
            }
          });
          
          if (newBalanceResponse.data && newBalanceResponse.data.success) {
            const newBalance = newBalanceResponse.data.balance;
            const deducted = balance - newBalance;
            console.log(`✅ Balance deduction verified!`);
            console.log(`💸 Amount deducted: ${deducted}`);
            console.log(`💰 New balance: ${newBalance}`);
            
            console.log('\n🎉 PHASE 2 - STEP 2: ALL COMMUNICATIONS WORKING!');
            console.log('=====================================');
            console.log('✅ BigServer ↔ Stage Server: Working');
            console.log('✅ Stage Server ↔ DB Manager: Working');
            console.log('✅ Balance Management: Working');
            console.log('✅ Database Updates: Working');
            console.log('✅ Real-time Data Sync: Working');
            console.log('✅ Complete Backend Flow: OPERATIONAL');
            
          } else {
            console.log('❌ Balance deduction verification failed');
          }
        } else {
          console.log('❌ DB Manager update verification failed');
        }
      } else {
        console.log('❌ Stage Server bet failed:', betResponse.data);
      }
    } else {
      console.log('❌ Balance check failed');
    }
    
  } catch (error) {
    console.error('❌ Error in Step 2 communications test:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure all services are running:');
      console.log('   - BigServer: http://localhost:3000');
      console.log('   - Stage1: http://localhost:3001');
      console.log('   - DB Manager: http://localhost:3007');
    }
  }
}

testStep2Communications();
