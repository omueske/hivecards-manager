import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { MailService } from '../../mail/mail.service';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { UserDocument } from '../../auth/schemas/user.schema';

jest.setTimeout(20000);

describe('Roles integration (auth + users)', () => {
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

  it('uses default user role and allows admin to assign roles', async () => {
    const adminEmail = `admin+${Date.now()}@example.com`;
    const userEmail = `user+${Date.now()}@example.com`;
    const password = 'pass1234';

    const adminReg: any = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: adminEmail, password })
      .expect(201);

    const userReg: any = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: userEmail, password })
      .expect(201);

    const createdUser = await userModel.findById(userReg.body.id).lean().exec();
    expect((createdUser as any)?.role).toBe('user');

    await userModel.updateMany(
      { email: { $in: [adminEmail, userEmail] } },
      { emailVerified: true },
    ).exec();

    await userModel.updateOne({ email: adminEmail }, { role: 'admin' }).exec();

    const adminLogin: any = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password })
      .expect(201);

    const userLogin: any = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: userEmail, password })
      .expect(201);

    const myProfile: any = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${userLogin.body.accessToken}`)
      .expect(200);
    expect(myProfile.body).toEqual(
      expect.objectContaining({
        id: userReg.body.id,
        email: userEmail,
        role: 'user',
      }),
    );

    const updatedMe: any = await request(app.getHttpServer())
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${userLogin.body.accessToken}`)
      .send({ username: 'updated-name' })
      .expect(200);
    expect(updatedMe.body).toEqual(
      expect.objectContaining({
        id: userReg.body.id,
        username: 'updated-name',
        role: 'user',
      }),
    );

    await request(app.getHttpServer())
      .put(`/api/v1/users/${adminReg.body.id}/role`)
      .set('Authorization', `Bearer ${userLogin.body.accessToken}`)
      .send({ role: 'admin' })
      .expect(403);

    const promoted: any = await request(app.getHttpServer())
      .put(`/api/v1/users/${userReg.body.id}/role`)
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .send({ role: 'admin' })
      .expect(200);

    expect(promoted.body).toEqual(
      expect.objectContaining({
        id: userReg.body.id,
        role: 'admin',
      }),
    );

    await request(app.getHttpServer())
      .put(`/api/v1/users/${userReg.body.id}/role`)
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .send({ role: 'owner' })
      .expect(400);

    const missingId = new mongoose.Types.ObjectId().toHexString();
    await request(app.getHttpServer())
      .put(`/api/v1/users/${missingId}/role`)
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .send({ role: 'user' })
      .expect(400);
  });
});
