const request = require('supertest')

describe('Auth E2E (requires backend at http://localhost:3000)', () => {
  const base = 'http://localhost:3000'

  it('registers a new user and then logs in', async () => {
    const unique = Date.now()
    const email = `e2e+${unique}@example.com`
    const password = 'Password123!'
    const username = `e2euser${unique}`

    const reg = await request(base)
      .post('/api/v1/auth/register')
      .send({ email, password, username })
      .set('Accept', 'application/json')

    expect([200,201]).toContain(reg.status)
    expect(reg.body).toHaveProperty('id')
    expect(reg.body).toHaveProperty('email', email)

    const login = await request(base)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .set('Accept', 'application/json')

    expect([200,201]).toContain(login.status)
    expect(login.body).toHaveProperty('accessToken')
    expect(typeof login.body.accessToken).toBe('string')
  }, 20000)
})
