import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { MailService } from '../../mail/mail.service';
import { Model } from 'mongoose';
import { UserDocument } from '../../auth/schemas/user.schema';

jest.setTimeout(20000);

describe('Auth edges integration', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AuthModule],
    })
      .overrideProvider(MailService)
      .useValue({
        sendVerificationEmail: jest.fn().mockResolvedValue(null),
        sendPasswordResetEmail: jest.fn().mockResolvedValue(null),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = app.get<Model<UserDocument>>(getModelToken('User'));
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('covers register duplicate and unverified-login branches', async () => {
    const email = `dup+${Date.now()}@example.com`;
    const password = 'pass1234';

    const first: any = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);
    expect(first.body).toEqual(expect.objectContaining({ role: 'user' }));

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(400);
  });

  it('covers verify-email, forgot/reset validation and refresh/logout branches', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/verify-email').expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: `missing+${Date.now()}@example.com` })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ token: 'x', password: 'short' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .expect(204);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['hc_refresh=invalid.token.value'])
      .expect(204);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .expect(201);
  });

  it('covers forgot/reset success path and login with new password', async () => {
    const email = `reset+${Date.now()}@example.com`;
    const oldPassword = 'pass1234';
    const newPassword = 'newpass123';

    const reg: any = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: oldPassword })
      .expect(201);

    await userModel.updateOne({ _id: reg.body.id }, { emailVerified: true }).exec();

    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email })
      .expect(201);

    const user = await userModel.findOne({ email }).lean().exec();
    const token = (user as any)?.passwordResetToken;
    expect(token).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ token, password: newPassword })
      .expect(201);

    const login: any = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: newPassword })
      .expect(201);

    expect(login.body).toHaveProperty('accessToken');
  });
});
