const axios = require('axios');

async function insertSampleData() {
  const stages = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  
  // Sample data without gameId (for stages A, B)
  const sampleDataWithoutGameId = [
    {
      playerId: "+251909090901,+251909090902",
      selectedBoard: "+251909090901:15,+251909090902:23",
      status: "active"
    },
    {
      playerId: "+251909090903,+251909090904,+251909090905",
      selectedBoard: "+251909090903:45,+251909090904:67,+251909090905:89",
      status: "active"
    },
    {
      playerId: "+251909090906,+251909090907",
      selectedBoard: "+251909090906:123,+251909090907:234",
      status: "active"
    }
  ];
  
  // Sample data with gameId (for stages C-L)
  const sampleDataWithGameId = [
    {
      gameId: `GAME_${Date.now()}_001`,
      playerId: "+251909090901,+251909090902",
      selectedBoard: "+251909090901:15,+251909090902:23",
      status: "active"
    },
    {
      gameId: `GAME_${Date.now()}_002`,
      playerId: "+251909090903,+251909090904,+251909090905",
      selectedBoard: "+251909090903:45,+251909090904:67,+251909090905:89",
      status: "active"
    },
    {
      gameId: `GAME_${Date.now()}_003`,
      playerId: "+251909090906,+251909090907",
      selectedBoard: "+251909090906:123,+251909090907:234",
      status: "active"
    }
  ];

  for (const stage of stages) {
    console.log(`\n🎯 Inserting sample data for Stage ${stage.toUpperCase()}...`);
    
    // Choose appropriate data based on stage
    const sampleData = ['a', 'b'].includes(stage) ? sampleDataWithoutGameId : sampleDataWithGameId;
    
    for (let i = 0; i < sampleData.length; i++) {
      const data = sampleData[i];
      try {
        const response = await axios.post(`http://localhost:3007/api/v1/stage-${stage}/create`, data, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          console.log(`✅ Stage ${stage.toUpperCase()} - Record ${i + 1}: gameId=${response.data.data.gameId}`);
        } else {
          console.log(`❌ Stage ${stage.toUpperCase()} - Record ${i + 1}: Failed - ${response.data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`❌ Stage ${stage.toUpperCase()} - Record ${i + 1}: ${error.message}`);
        if (error.response) {
          console.log(`   Response: ${JSON.stringify(error.response.data)}`);
        }
      }
    }
  }
  
  console.log('\n🎉 Sample data insertion completed!');
}

insertSampleData().catch(console.error);
