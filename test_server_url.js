const axios = require('axios');

async function testServerUrl() {
  try {
    console.log('🔍 Testing BigServer server-url endpoint...');
    
    const response = await axios.get('http://localhost:3000/server-url/10/1');
    
    if (response.data && response.data.success) {
      console.log('✅ Server URL response:', response.data);
      return response.data.data.serverUrl;
    } else {
      console.log('❌ Server URL response:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing server URL:', error.message);
    return null;
  }
}

testServerUrl();
