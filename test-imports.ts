// Импортируем из JS файла в TS файл
import { redis } from './lib/redis-client';

// Тестовая функция
async function testRedisConnection() {
  try {
    // Пробуем выполнить простую операцию
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    console.log('Redis connection successful:', value);
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
}

// Запускаем тест
testRedisConnection().then(result => {
  console.log('Test completed with result:', result);
});