import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { HiveModule } from '../../hives/hives.module';
import { ApiariesModule } from '../../apiaries/apiaries.module';
import { InspectionsModule } from '../../inspections/inspections.module';
import { MailService } from '../../mail/mail.service';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { UserDocument } from '../../auth/schemas/user.schema';

jest.setTimeout(20000);

describe('Required fields integration (auth + resources)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AuthModule, HiveModule, ApiariesModule, InspectionsModule],
    })
      .overrideProvider(MailService)
      .useValue({
        sendVerificationEmail: jest.fn().mockResolvedValue(null),
        sendPasswordResetEmail: jest.fn().mockResolvedValue(null),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const email = `required+${Date.now()}@example.com`;
    const password = 'pass1234';

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({ email, password }).expect(201);

    const userModel = app.get<Model<UserDocument>>(getModelToken('User'));
    await userModel.updateOne({ email }, { emailVerified: true }).exec();

    const login: any = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);

    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('rejects creating apiary without required name', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/apiaries')
      .set('Authorization', `Bearer ${token}`)
      .send({ color: '#FFCA28' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/apiaries')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ' })
      .expect(400);
  });

  it('rejects creating hive without required apiaryId', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/hives')
      .set('Authorization', `Bearer ${token}`)
      .send({ hiveNumber: 'H-REQ-1' })
      .expect(400);
  });

  it('rejects creating inspection without required hiveId/date', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-02-26', type: 'note' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${token}`)
      .send({ hiveId: new mongoose.Types.ObjectId().toHexString(), type: 'note' })
      .expect(400);
  });

  it('accepts creating apiary, hive and inspection with valid required fields', async () => {
    const createdApiary: any = await request(app.getHttpServer())
      .post('/api/v1/apiaries')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Apiary-${Date.now()}` })
      .expect(201);
    expect(createdApiary.body).toHaveProperty('id');

    const createdHive: any = await request(app.getHttpServer())
      .post('/api/v1/hives')
      .set('Authorization', `Bearer ${token}`)
      .send({ hiveNumber: `H-${Date.now()}`, apiaryId: createdApiary.body.id, status: 'active' })
      .expect(201);
    expect(createdHive.body).toHaveProperty('id');

    const createdInspection: any = await request(app.getHttpServer())
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${token}`)
      .send({ hiveId: createdHive.body.id, date: '2026-02-26', type: 'note' })
      .expect(201);
    expect(createdInspection.body).toHaveProperty('id');
  });
});
