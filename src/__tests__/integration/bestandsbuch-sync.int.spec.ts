import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthModule } from '../../auth/auth.module';
import { ApiariesModule } from '../../apiaries/apiaries.module';
import { HiveModule } from '../../hives/hives.module';
import { InspectionsModule } from '../../inspections/inspections.module';
import { BestandsbuchModule } from '../../bestandsbuch/bestandsbuch.module';
import { MailService } from '../../mail/mail.service';
import { UserDocument } from '../../auth/schemas/user.schema';

jest.setTimeout(20000);

describe('Bestandsbuch sync integration', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        AuthModule,
        ApiariesModule,
        HiveModule,
        InspectionsModule,
        BestandsbuchModule,
      ],
    })
      .overrideProvider(MailService)
      .useValue({
        sendVerificationEmail: jest.fn().mockResolvedValue(null),
        sendPasswordResetEmail: jest.fn().mockResolvedValue(null),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const email = `bestandsbuch+${Date.now()}@example.com`;
    const password = 'pass1234';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, username: 'Test Imker' })
      .expect(201);

    const userModel = app.get<Model<UserDocument>>(getModelToken('User'));
    await userModel.updateOne({ email }, { emailVerified: true }).exec();

    const loginRes: any = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);

    token = loginRes.body.accessToken;
    expect(token).toBeTruthy();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('syncs treatment entries in both directions', async () => {
    const apiaryRes: any = await request(app.getHttpServer())
      .post('/api/v1/apiaries')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Stand-${Date.now()}` })
      .expect(201);

    const hiveRes: any = await request(app.getHttpServer())
      .post('/api/v1/hives')
      .set('Authorization', `Bearer ${token}`)
      .send({ hiveNumber: `V-${Date.now()}`, apiaryId: apiaryRes.body.id, status: 'active' })
      .expect(201);

    const inspectionRes: any = await request(app.getHttpServer())
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hiveId: hiveRes.body.id,
        date: '2026-03-03',
        type: 'treatment',
        treatmentAgent: 'Ameisensäure 60%',
        treatmentAmount: '150 ml',
        notes: 'Frühjahrsbehandlung',
      })
      .expect(201);

    expect(inspectionRes.body.id).toBeTruthy();

    const bestandsbuchFromInspection: any = await request(app.getHttpServer())
      .get('/api/v1/bestandsbuch?year=2026')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(bestandsbuchFromInspection.body)).toBe(true);
    const syncedEntry = bestandsbuchFromInspection.body.find(
      (entry: any) => entry.inspectionId === inspectionRes.body.id,
    );
    expect(syncedEntry).toBeTruthy();
    expect(syncedEntry.medicineName).toBe('Ameisensäure 60%');
    expect(syncedEntry.amount).toBe('150 ml');
    expect(syncedEntry.hiveLabel).toBe(hiveRes.body.hiveNumber);
    expect(syncedEntry.apiaryName).toBe(apiaryRes.body.name);

    const manualBestandsbuchRes: any = await request(app.getHttpServer())
      .post('/api/v1/bestandsbuch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hiveId: hiveRes.body.id,
        applicationDate: '2026-03-04',
        medicineName: 'Oxuvar',
        amount: '30 ml',
        administrationType: 'träufeln',
        notes: 'Nachkontrolle',
      })
      .expect(201);

    expect(manualBestandsbuchRes.body.id).toBeTruthy();

    const bestandsbuchAfterManual: any = await request(app.getHttpServer())
      .get('/api/v1/bestandsbuch?year=2026')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const manualEntryReloaded = bestandsbuchAfterManual.body.find(
      (entry: any) => entry.id === manualBestandsbuchRes.body.id,
    );
    expect(manualEntryReloaded).toBeTruthy();
    expect(manualEntryReloaded.inspectionId).toBeTruthy();

    await request(app.getHttpServer())
      .delete(`/api/v1/inspections/${manualEntryReloaded.inspectionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const bestandsbuchAfterInspectionDelete: any = await request(app.getHttpServer())
      .get('/api/v1/bestandsbuch?year=2026')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deletedEntry = bestandsbuchAfterInspectionDelete.body.find(
      (entry: any) => entry.id === manualBestandsbuchRes.body.id,
    );
    expect(deletedEntry).toBeUndefined();
  });
});
