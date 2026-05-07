import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DemoModule } from './demo/demo.module';
import { StoreModule } from './store/store.module';
import { AuthModule } from './auth/auth.module';
import { PatientController } from './patient/patient.controller';
import { QRController } from './qr/qr.controller';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    StoreModule,
    AuthModule,
    DemoModule,
    TypeOrmModule.forRoot(databaseConfig),
  ],
  controllers: [PatientController, QRController],
  providers: [],
})
export class AppModule {}