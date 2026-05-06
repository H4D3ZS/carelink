import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [StoreModule],
  controllers: [AuthController],
})
export class AuthModule {}
