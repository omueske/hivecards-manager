import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ensureIndexes } from '../../common/ensure-indexes';

describe('ensureIndexes', () => {
  let connection: Connection;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    connection = module.get<Connection>(getConnectionToken());
  }, 30000); // 30 second timeout for module initialization

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
  });

  it('creates all required indexes without errors', async () => {
    await expect(ensureIndexes(connection)).resolves.not.toThrow();
  });

  it('creates indexes on User collection', async () => {
    await ensureIndexes(connection);
    const indexes = await connection.collection('users').indexes();
    
    const indexNames = indexes.map((idx) => idx.name);
    expect(indexNames).toContain('idx_user_email');
    expect(indexNames).toContain('idx_user_verification_token');
    expect(indexNames).toContain('idx_user_reset_token');
    
    // Verify email index is unique
    const emailIndex = indexes.find((idx) => idx.name === 'idx_user_email');
    expect(emailIndex?.unique).toBe(true);
  });

  it('creates indexes on Apiary collection', async () => {
    await ensureIndexes(connection);
    const indexes = await connection.collection('apiaries').indexes();
    
    const indexNames = indexes.map((idx) => idx.name);
    expect(indexNames).toContain('idx_apiary_userId');
  });

  it('creates indexes on Hive collection', async () => {
    await ensureIndexes(connection);
    const indexes = await connection.collection('hives').indexes();
    
    const indexNames = indexes.map((idx) => idx.name);
    expect(indexNames).toContain('idx_hive_userId');
    expect(indexNames).toContain('idx_hive_userId_apiaryId');
    expect(indexNames).toContain('idx_hive_userId_status');
  });

  it('creates indexes on Queen collection', async () => {
    await ensureIndexes(connection);
    const indexes = await connection.collection('queens').indexes();
    
    const indexNames = indexes.map((idx) => idx.name);
    expect(indexNames).toContain('idx_queen_userId');
    expect(indexNames).toContain('idx_queen_userId_hiveHistory');
    expect(indexNames).toContain('idx_queen_userId_createdAt');
  });

  it('creates indexes on Inspection collection', async () => {
    await ensureIndexes(connection);
    const indexes = await connection.collection('inspections').indexes();
    
    const indexNames = indexes.map((idx) => idx.name);
    expect(indexNames).toContain('idx_inspection_hiveId_date');
    expect(indexNames).toContain('idx_inspection_userId_date');
    expect(indexNames).toContain('idx_inspection_userId');
    expect(indexNames).toContain('idx_inspection_hiveId');
  });

  it('creates indexes on TreatmentAgent collection', async () => {
    await ensureIndexes(connection);
    const indexes = await connection.collection('treatmentagents').indexes();
    
    const indexNames = indexes.map((idx) => idx.name);
    expect(indexNames).toContain('idx_treatmentagent_userId_category_name');
    expect(indexNames).toContain('idx_treatmentagent_userId_category');
    
    // Verify compound unique index
    const uniqueIndex = indexes.find((idx) => idx.name === 'idx_treatmentagent_userId_category_name');
    expect(uniqueIndex?.unique).toBe(true);
  });

  it('can be called multiple times without errors (idempotent)', async () => {
    await expect(ensureIndexes(connection)).resolves.not.toThrow();
    await expect(ensureIndexes(connection)).resolves.not.toThrow();
    await expect(ensureIndexes(connection)).resolves.not.toThrow();
  });
});
