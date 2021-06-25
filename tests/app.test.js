const request = require('supertest')
const app = require('../app')

describe('All Characters ID API', () => {
  it('Should return all characters ID', async () => {
    const res = await request(app)
      .get('/characters')
    expect(res.statusCode).toEqual(200)
    expect(res.length).not.toBe(0);

  })
})

describe('Character Details API', () => {
  it('Should return details of a character', async () => {
    const res = await request(app)
      .get('/characters/1017100')
    expect(res.statusCode).toEqual(200)
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String)
    })

  })
})

