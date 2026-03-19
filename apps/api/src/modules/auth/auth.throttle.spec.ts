import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../app.module'
import { ThrottlerExceptionFilter } from '../../common/filters/throttler-exception.filter'

describe('Auth Rate Limiting', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalFilters(new ThrottlerExceptionFilter())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('bloque après 5 tentatives de login en 1 minute', async () => {
    const loginPayload = {
      email: 'test@example.com',
      password: 'wrongpassword',
    }

    // 5 premières tentatives → pas de 429
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginPayload)
      expect(res.status).not.toBe(429)
    }

    // 6ème tentative → 429
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginPayload)

    expect(res.status).toBe(429)
    expect(res.body.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(res.headers['retry-after']).toBeDefined()
  })
})
