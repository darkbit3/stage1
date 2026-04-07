const axios = require('axios');

async function checkAndUpdateGameIds() {
  const stages = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  
  console.log('🔍 Checking current game IDs...\n');
  
  for (const stage of stages) {
    try {
      const response = await axios.get(`http://localhost:3007/api/v1/stage-${stage}/last-game-id`);
      if (response.data && response.data.success) {
        const currentGameId = response.data.data.gameId;
        console.log(`Stage ${stage.toUpperCase()}: ${currentGameId}`);
      }
    } catch (error) {
      console.log(`Stage ${stage.toUpperCase()}: Error - ${error.message}`);
    }
  }
  
  console.log('\n🎯 Now updating game IDs to simple numbers (1, 2, 3)...');
  
  for (const stage of stages) {
    try {
      // Update records with simple game IDs 1, 2, 3
      for (let newId = 1; newId <= 3; newId++) {
        const updateData = {
          gameId: newId.toString(),
          playerId: "+251909090901,+251909090902",
          selectedBoard: "+251909090901:15,+251909090902:23",
          status: "active"
        };
        
        const response = await axios.post(`http://localhost:3007/api/v1/stage-${stage}/create`, updateData, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          console.log(`✅ Stage ${stage.toUpperCase()}: Updated game ID to ${newId}`);
        } else {
          console.log(`❌ Stage ${stage.toUpperCase()}: Failed to update game ID to ${newId}`);
        }
      }
    } catch (error) {
      console.log(`❌ Stage ${stage.toUpperCase()}: Error updating - ${error.message}`);
    }
  }
  
  console.log('\n🎉 Game ID update completed!');
  
  console.log('\n🔍 Verifying updated game IDs...\n');
  
  for (const stage of stages) {
    try {
      const response = await axios.get(`http://localhost:3007/api/v1/stage-${stage}/last-game-id`);
      if (response.data && response.data.success) {
        const newGameId = response.data.data.gameId;
        console.log(`Stage ${stage.toUpperCase()}: ${newGameId}`);
      }
    } catch (error) {
      console.log(`Stage ${stage.toUpperCase()}: Error - ${error.message}`);
    }
  }
}

checkAndUpdateGameIds().catch(console.error);
