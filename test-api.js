// Тестовый скрипт для проверки API
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🚀 Тестируем API...');

    // 1. Получить пользователей
    console.log('\n1️⃣ Получение пользователей:');
    const usersResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET'
    });
    console.log('Статус:', usersResult.status);
    console.log('Пользователи:', usersResult.data);

    // 2. Создать задачу с email
    console.log('\n2️⃣ Создание задачи с email:');
    const taskResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/todos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': 'test@example.com'
      }
    }, { text: 'Тестовая задача' });
    console.log('Статус:', taskResult.status);
    console.log('Создана задача:', taskResult.data);

    // 3. Получить пользователей снова
    console.log('\n3️⃣ Получение пользователей после создания задачи:');
    const usersResult2 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET'
    });
    console.log('Статус:', usersResult2.status);
    console.log('Пользователи:', usersResult2.data);

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testAPI();
