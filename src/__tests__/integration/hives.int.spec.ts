import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { HiveModule } from '../../hives/hives.module';
import { MailService } from '../../mail/mail.service';
import { Model } from 'mongoose';
import { UserDocument } from '../../auth/schemas/user.schema';

jest.setTimeout(20000);

describe('Hives integration (auth + hives)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AuthModule, HiveModule],
    })
      .overrideProvider(MailService)
      .useValue({ sendVerificationEmail: jest.fn().mockResolvedValue(null), sendPasswordResetEmail: jest.fn().mockResolvedValue(null) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('registers, logs in, creates and lists a hive', async () => {
    const email = `tester+${Date.now()}@example.com`;
    const password = 'pass1234';

    // register
    const reg: any = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);
    expect(reg.body).toHaveProperty('id');

    // mark email verified so login succeeds
    const userModel = app.get<Model<UserDocument>>(getModelToken('User'));
    await userModel.updateOne({ email }, { emailVerified: true }).exec();

    // login
    const login: any = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);
    expect(login.body).toHaveProperty('accessToken');
    const token = login.body.accessToken;

    // create hive
    const apiaryId = new (require('mongoose').Types.ObjectId)().toHexString();
    const create: any = await request(app.getHttpServer())
      .post('/api/v1/hives')
      .set('Authorization', `Bearer ${token}`)
      .send({ hiveNumber: 'H-1', apiaryId, status: 'active' })
      .expect(201);
    expect(create.body).toHaveProperty('id');

    // list hives
    const list: any = await request(app.getHttpServer())
      .get('/api/v1/hives')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(list.body).toHaveProperty('items');
    expect(Array.isArray(list.body.items)).toBe(true);
    expect(list.body.items.length).toBeGreaterThanOrEqual(1);

    const created = create.body;

    // update hive
    const updated = await request(app.getHttpServer())
      .put(`/api/v1/hives/${created.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'Updated note' })
      .expect(200);
    expect(updated.body).toHaveProperty('notes', 'Updated note');

    // delete (soft)
    await request(app.getHttpServer()).delete(`/api/v1/hives/${created.id}`).set('Authorization', `Bearer ${token}`).expect(200);

    // fetch one and ensure status changed to archived
    const one = await request(app.getHttpServer()).get(`/api/v1/hives/${created.id}`).set('Authorization', `Bearer ${token}`).expect(200);
    expect(one.body).toHaveProperty('status');
    expect(one.body.status).toBe('archived');
  });
});
