/**
 * See http://docs.sequelizejs.com/manual/migrations.html
 */
module.exports = {
  development: {
    storage: 'db/data/database.sqlite',
    dialect: 'sqlite'
  },
  test: {
    storage: ':memory:',
    dialect: 'sqlite',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres'
  }
}
