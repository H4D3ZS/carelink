import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoModule } from './demo/demo.module';
import { StoreModule } from './store/store.module';
import { AuthModule } from './auth/auth.module';
import { PatientController } from './patient/patient.controller';
import { QRController } from './qr/qr.controller';

// Determine database configuration based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const useSQLite = process.env.USE_SQLITE === 'true' || (isDevelopment && !process.env.DATABASE_URL);

@Module({
  imports: [
    StoreModule,
    AuthModule,
    DemoModule,
    TypeOrmModule.forRoot(
      useSQLite
        ? {
            type: 'sqlite',
            database: 'carelink-dev.db',
            entities: [],
            synchronize: true,
            logging: false,
          }
        : {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'carelink',
            entities: [],
            synchronize: process.env.NODE_ENV !== 'production',
          },
    ),
  ],
  controllers: [PatientController, QRController],
  providers: [],
})
export class AppModule {}