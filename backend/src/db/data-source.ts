import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const commonOptions = {
  type: 'postgres' as const,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
};

export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      ...commonOptions,
      url: process.env.DATABASE_URL,
    }
  : {
      ...commonOptions,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    };

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
