import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [StoreModule],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
