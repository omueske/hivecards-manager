// Simple refresh flow test script
// Usage:
//   cd frontend
//   npm install axios tough-cookie axios-cookiejar-support
//   node scripts/refresh-test.js

const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function run() {
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ baseURL: API_BASE, jar, withCredentials: true }));

  // use credentials from env or defaults (ensure these exist in your DB)
  const email = process.env.TEST_EMAIL || 'test@example.com';
  const password = process.env.TEST_PASSWORD || 'password123';

  console.log('Logging in...');
  const loginRes = await client.post('/api/v1/auth/login', { email, password });
  console.log('Login response data:', loginRes.data);
  const access = loginRes.data?.accessToken || loginRes.data?.access;
  if (!access) {
    console.error('No access token returned; abort');
    return;
  }

  console.log('Calling protected endpoint with valid token...');
  const ok = await client.get('/api/v1/hives', { headers: { Authorization: `Bearer ${access}` } });
  console.log('Protected request status:', ok.status);

  console.log('Simulating expired access token and calling protected endpoint again...');
  try {
    const fail = await client.get('/api/v1/hives', {
      headers: { Authorization: `Bearer invalid-token` },
    });
    console.log('Unexpected success', fail.status);
  } catch (e) {
    console.log('Got expected error; now calling refresh endpoint using cookie jar...');
    const refresh = await client.post('/api/v1/auth/refresh');
    console.log('Refresh response:', refresh.data);
    const newAccess = refresh.data?.accessToken || refresh.data?.access;
    if (!newAccess) {
      console.error('Refresh did not return new access token');
      return;
    }
    console.log('Retrying protected endpoint with refreshed access token...');
    const retried = await client.get('/api/v1/hives', {
      headers: { Authorization: `Bearer ${newAccess}` },
    });
    console.log('Retried request status:', retried.status);
  }
}

run().catch((err) => {
  console.error('Test failed', err?.response?.data || err.message || err);
  process.exit(1);
});
