import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';

/**
 * Ensures all necessary database indexes are created for optimal query performance.
 * This script runs at application startup to guarantee indexes exist.
 * 
 * Index Strategy:
 * - Single field indexes for frequently queried fields (userId, email, etc.)
 * - Compound indexes for common filter combinations
 * - Unique indexes where data integrity requires it
 * - Indexes on sort fields for performance
 */
export async function ensureIndexes(connection: Connection): Promise<void> {
  const logger = new Logger('EnsureIndexes');
  logger.log('Starting index creation/verification...');

  try {
    // ========================================
    // User Collection
    // ========================================
    const userCollection = connection.collection('users');
    await Promise.all([
      // Email must be unique for authentication
      userCollection.createIndex({ email: 1 }, { unique: true, name: 'idx_user_email' }),
      // Email verification token lookup during registration flow
      userCollection.createIndex({ emailVerificationToken: 1 }, { sparse: true, name: 'idx_user_verification_token' }),
      // Password reset token lookup during password reset flow
      userCollection.createIndex({ passwordResetToken: 1 }, { sparse: true, name: 'idx_user_reset_token' }),
    ]);
    logger.log('✓ User indexes created');

    // ========================================
    // Apiary Collection
    // ========================================
    const apiaryCollection = connection.collection('apiaries');
    await Promise.all([
      // List all apiaries for a user (findAll query)
      apiaryCollection.createIndex({ userId: 1 }, { name: 'idx_apiary_userId' }),
    ]);
    logger.log('✓ Apiary indexes created');

    // ========================================
    // Hive Collection
    // ========================================
    const hiveCollection = connection.collection('hives');
    await Promise.all([
      // List all hives for a user
      hiveCollection.createIndex({ userId: 1 }, { name: 'idx_hive_userId' }),
      // Filter hives by apiary
      hiveCollection.createIndex({ userId: 1, apiaryId: 1 }, { name: 'idx_hive_userId_apiaryId' }),
      // Filter hives by status (active/archived)
      hiveCollection.createIndex({ userId: 1, status: 1 }, { name: 'idx_hive_userId_status' }),
    ]);
    logger.log('✓ Hive indexes created');

    // ========================================
    // Queen Collection
    // ========================================
    const queenCollection = connection.collection('queens');
    await Promise.all([
      // List all queens for a user
      queenCollection.createIndex({ userId: 1 }, { name: 'idx_queen_userId' }),
      // Find queens by current/past hive assignment
      queenCollection.createIndex({ userId: 1, 'hiveHistory.hiveId': 1 }, { name: 'idx_queen_userId_hiveHistory' }),
      // List queens sorted by creation date (most recent first)
      queenCollection.createIndex({ userId: 1, createdAt: -1 }, { name: 'idx_queen_userId_createdAt' }),
    ]);
    logger.log('✓ Queen indexes created');

    // ========================================
    // Inspection Collection
    // ========================================
    const inspectionCollection = connection.collection('inspections');
    await Promise.all([
      // List all inspections for a hive (sorted by date)
      inspectionCollection.createIndex({ hiveId: 1, date: -1 }, { name: 'idx_inspection_hiveId_date' }),
      // List all inspections for a user (sorted by date)
      inspectionCollection.createIndex({ userId: 1, date: -1 }, { name: 'idx_inspection_userId_date' }),
      // User-specific query
      inspectionCollection.createIndex({ userId: 1 }, { name: 'idx_inspection_userId' }),
      // Hive-specific query (with user check)
      inspectionCollection.createIndex({ hiveId: 1 }, { name: 'idx_inspection_hiveId' }),
    ]);
    logger.log('✓ Inspection indexes created');

    // ========================================
    // Treatment Agent Collection
    // ========================================
    const treatmentAgentCollection = connection.collection('treatmentagents');
    await Promise.all([
      // Prevent duplicate agents per user and category
      treatmentAgentCollection.createIndex(
        { userId: 1, category: 1, name: 1 }, 
        { unique: true, name: 'idx_treatmentagent_userId_category_name' }
      ),
      // List agents by user and category (with sorting by name)
      treatmentAgentCollection.createIndex({ userId: 1, category: 1 }, { name: 'idx_treatmentagent_userId_category' }),
    ]);
    logger.log('✓ TreatmentAgent indexes created');

    logger.log('All indexes created/verified successfully');
  } catch (error: any) {
    // Duplicate key errors (code 11000) during index creation are acceptable
    // They mean the index already exists with those specifications
    if (error.code === 11000 || error.message?.includes('already exists')) {
      logger.debug('Some indexes already exist, continuing...');
    } else {
      logger.error(`Failed to create indexes: ${error.message}`, error.stack);
      throw error;
    }
  }
}
