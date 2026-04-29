import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";
import { join } from 'path';

dotenvConfig({ path: '.env' });

const config: DataSourceOptions = {
    type: 'postgres',
    host: `${process.env.DATABASE_HOST}`,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: `${process.env.DATABASE_USER}`,
    password: `${process.env.DATABASE_PASSWORD}`,
    database: `${process.env.DATABASE_NAME}`,
    entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '/../database/migrations/*{.ts,.js}')],
    synchronize: false,
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config);