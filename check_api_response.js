const axios = require('axios');

async function checkApiResponse() {
  try {
    console.log('🔍 Checking API response...');
    const response = await axios.get('http://localhost:3001/api/v1/game/latest-data?stage=a');
    
    console.log('📊 Full API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      console.log('\n🎯 Key Fields:');
      console.log('- gameId:', data.gameId);
      console.log('- totalPlayers:', data.totalPlayers);
      console.log('- boards:', data.boards);
      console.log('- selectedBoard:', data.selectedBoard);
      console.log('- players:', data.players);
      
      if (data.selectedBoard) {
        console.log('\n🔍 Parsing selectedBoard:');
        const entries = data.selectedBoard.split(',');
        console.log('Total entries:', entries.length);
        
        const boards = [];
        entries.forEach((entry, index) => {
          if (entry && entry.includes(':')) {
            const parts = entry.split(':');
            if (parts.length >= 2) {
              const playerId = parts[0].trim();
              const boardNum = parts[parts.length - 1].trim();
              const boardNumInt = parseInt(boardNum);
              
              if (!isNaN(boardNumInt) && boardNumInt > 0 && boardNumInt <= 400) {
                boards.push(boardNumInt);
                console.log(`✅ Entry ${index}: ${playerId} → Board ${boardNumInt}`);
              } else {
                console.log(`❌ Entry ${index}: ${playerId} → Board ${boardNumInt} (invalid)`);
              }
            }
          }
        });
        
        console.log('\n📋 Valid boards (1-400):', boards);
        console.log('📊 Total valid boards:', boards.length);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkApiResponse();
