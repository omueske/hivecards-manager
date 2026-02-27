import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { BreedingBookController } from './breeding-book.controller';
import { BreedingBookService } from './breeding-book.service';
import { BreedingBookEntry, BreedingBookEntrySchema } from './schemas/breeding-book-entry.schema';
import { Queen, QueenSchema } from '../queens/schemas/queen.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BreedingBookEntry.name, schema: BreedingBookEntrySchema },
      { name: Queen.name, schema: QueenSchema },
    ]),
    AuthModule,
  ],
  controllers: [BreedingBookController],
  providers: [BreedingBookService],
  exports: [BreedingBookService],
})
export class BreedingBookModule {}
