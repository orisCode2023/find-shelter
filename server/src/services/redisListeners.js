import { createClient } from 'redis';

const subscriber = createClient();

subscriber.on('error', (err) => console.error('שגיאת Redis:', err));

async function startRedisListener(io) {
  try {
    await subscriber.connect();
    console.log('connect & listen to redis');

    await subscriber.subscribe('alerts_channel', (message) => {
      const alertData = JSON.parse(message);
      
      console.log(`🚀 new allert: ${alertData.location} - ${alertData.title} - ${alertData.lng} - ${alertData.lat}`)

      io.emit('red_alert', alertData);
      
    });
  } catch (error) {
    console.error('redis connect failed: ', error);
  }
}

export default startRedisListener;