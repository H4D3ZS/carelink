import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use Supabase PostgreSQL in production
  if (isProduction && process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase
      },
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false, // Use migrations in production
      logging: false,
      extra: {
        // Connection pool settings for serverless
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }

  // Local development fallback
  return {
    type: 'sqlite',
    database: 'carelink-dev.db',
    entities: [],
    synchronize: true,
    logging: false,
  };
};

export const databaseConfig = getDatabaseConfig();
