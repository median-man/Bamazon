/* Runs sql statements to set up a test database and seed it */
// const fs = require('fs');
const execsql = require('execsql');
const testConfig = require('../db/config.json').test;

// path to sql script to drop, create, and seed the test db
const sqlPath = `${__dirname}\\..\\db\\createTestDB.sql`;
console.log(sqlPath);

function createTestDb({
  user, password, port, host, database,
}) {
  return new Promise((resolve, reject) => {
    execsql
      .config({
        user, password, port, host, database,
      })
      .execFile(sqlPath, (err, results) => {
        if (err) return reject(err);
        return resolve(results);
      });
  });
}

// run script
createTestDb(testConfig).then(console.log).catch(console.error);
