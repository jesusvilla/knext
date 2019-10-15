export const config = {
  postgres: {
    client: 'postgres',
    connection: {
      adapter: 'postgresql',
      host: '127.0.0.1',
      user: 'postgres',
      password: 'admin',
      database: 'test',
      port: 5432
    }
  }
}