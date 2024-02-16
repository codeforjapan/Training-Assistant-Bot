import { Module } from '@nestjs/common';
import { LINEController } from './line.controller';
import { LineService } from './line.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineEvent } from '../../entities/line-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LineEvent])],
  controllers: [LINEController],
  providers: [LineService],
})
export class LineModule {}
