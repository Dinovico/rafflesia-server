import { DataSource } from 'typeorm';

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  entities: process.env.NODE_ENV === 'development' ? ['entities/*.ts'] : ['build/entities/*.js'],
  migrations: process.env.NODE_ENV === 'development' ? ['migrations/*.ts'] : ['build/migrations/*.js'],
  extra: {
    ssl:
      {
        rejectUnauthorized: false,
      },
  },
});