export const config = {
  postgres: {
    client: 'postgres',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'admin',
      database: 'test',
      port: 5432
    }
  },
  firebird: {
    client: 'firebird',
    connection: {
      host: '127.0.0.1',
      user: 'sysdba',
      password: 'masterkey',
      database: 'C:\\Users\\Familia\\Documents\\Jesus\\firebird\\TEST.FDB',
      port: 3050
    }
  }
}