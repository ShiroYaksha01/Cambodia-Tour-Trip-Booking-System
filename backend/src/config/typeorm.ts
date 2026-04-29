import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: '.env' });

const commonConfig = {
    type: 'postgres' as const,
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
}

const config: DataSourceOptions = process.env.DATABASE_URL
    ? {
        ...commonConfig,
        url: process.env.DATABASE_URL,
    }
    : {
        ...commonConfig,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT ?? 5432),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    }

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config);
