const axios = require('axios');

async function testCountdown() {
  try {
    console.log('Testing countdown API...');

    // Test room 1
    const response1 = await axios.get('http://localhost:3001/api/v1/room-countdown?room=1');
    console.log('Room 1:', response1.data);

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test room 2
    const response2 = await axios.get('http://localhost:3001/api/v1/room-countdown?room=2');
    console.log('Room 2:', response2.data);

    // Wait 2 more seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test room 1 again
    const response3 = await axios.get('http://localhost:3001/api/v1/room-countdown?room=1');
    console.log('Room 1 again:', response3.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCountdown();