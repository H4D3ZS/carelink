import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Determine database configuration based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const useSQLite = process.env.USE_SQLITE === 'true' || (isDevelopment && !process.env.DATABASE_URL);

@Module({
  imports: [
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
  controllers: [],
  providers: [],
})
export class AppModule {}