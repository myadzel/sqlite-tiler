const initSqlJs = require('sql.js');

const helper = require('./lib/helper');

const drivers = require('./drivers');

const getDriverName = (database) => {
    let matchedDriver;

    const throwError = (err) => {
        let message = 'Can not detect sqlite tile format';

        if (err && err.message) {
            message = err.message;
        }

        throw new Error(message);
    };

    try {
        // list of mandatory tables for the driver
        const driverTables = {
            sqlite: ['tiles', 'info'],
            mbtiles: ['tiles', 'metadata'],
        };

        const results = database.exec('SELECT name FROM sqlite_master WHERE type = "table" OR type = "view"');
        const objects = helper.getSqlResultAsObjectsArray(results.shift());

        const tablesInDatabase = objects.map((row => row.name.toLowerCase()));

        if (tablesInDatabase.length) {
            for (let driver in driverTables) {
                const tables = driverTables[driver];

                const matchedTables = tables.filter((name) => tablesInDatabase.includes(name));

                if (matchedTables.length === tables.length) {
                    matchedDriver = driver;

                    break;
                }
            }
        }
    } catch (err) {
        throwError(err);
    }

    if (!matchedDriver) {
        throwError();
    }

    return matchedDriver;
};

module.exports = {
    read: (buffer) => {
        return new Promise((resolve, reject) => {
            initSqlJs().then((sql) => {
                const database = new sql.Database(buffer);

                const Driver = drivers[getDriverName(database)];

                resolve(new Driver(database));
            }).catch((err) => {
                reject(err);
            });
        });
    }
};
