// OsmAnd, RMaps, Locus, OruxMaps, etc.

const fileType = require('file-type');

const helper = require('../lib/helper');

class Sqlite {
    constructor(database) {
        this.database = database;

        this.minZoom = undefined;
        this.maxZoom = undefined;

        this.tileFormat = undefined;

        this.tiles = [];

        return this.getPublicInterfaceThru();
    }

    readDatabase() {
        const p1 = new Promise((resolve, reject) => {
            this.query('SELECT * FROM info', (err, rows) => {
                if (err) {
                    reject(err);
                }

                const row = rows.shift();

                // invert back max/min here for correct values
                this.setMinZoom(this.normalizeZoomValue(row.maxzoom));
                this.setMaxZoom(this.normalizeZoomValue(row.minzoom));

                resolve();
            });
        });

        const p2 = new Promise((resolve, reject) => {
            this.query('SELECT * FROM tiles', (err, rows) => {
                if (err) {
                    reject(err);
                }

                const tiles = rows.map((row) => {
                    return {
                        image: row.image,
                        zoom: this.normalizeZoomValue(row.z),
                        x: row.x,
                        y: row.y,
                    };
                });

                this.setTiles(tiles);

                (async () => {
                    const image = rows.find((row) => row.image).image;
                    const type = await fileType.fromBuffer(image);

                    this.setTileFormat(type.ext);
                })();

                resolve();

            });
        });

        return Promise.all([p1, p2]);
    }

    query(query, callback) {
        let err = null;

        const results = this.database.exec(query);
        const objects = helper.getSqlResultAsObjectsArray(results.shift());

        callback(err, objects);
    }

    getPublicInterfaceThru() {
        return this.readDatabase().then(() => this.getPublicInterface()).catch((err) => {
            throw err;
        });
    }

    getPublicInterface() {
        return {
            getTiles: this.getTiles.bind(this),
            getTileFormat: this.getTileFormat.bind(this),
            getMinZoom: this.getMinZoom.bind(this),
            getMaxZoom: this.getMaxZoom.bind(this),
            getTileByCoord: this.getTileByCoord.bind(this),
        };
    }

    normalizeYValue(y) {
        return y;
    }

    normalizeZoomValue(z) {
        return (17 - z);
    }

    getTileFormat() {
        return this.tileFormat;
    }

    setTileFormat(format) {
        this.tileFormat = format;
    }

    setTiles(tiles) {
        this.tiles = tiles;
    }

    getTiles() {
        return this.tiles;
    }

    getTileByCoord(lat, lon, z) {
        const zxyObject = this.getTileZxy(lat, lon, z);

        const tile = this.tiles.find((tile) => {
            return tile.x === zxyObject.x && tile.y === zxyObject.y && tile.zoom === zxyObject.z;
        });

        return tile;
    }

    setMinZoom(value) {
        this.minZoom = parseInt(value, 10);
    }

    getMinZoom() {
        return this.minZoom;
    }

    setMaxZoom(value) {
        this.maxZoom = parseInt(value, 10);
    }

    getMaxZoom() {
        return this.maxZoom;
    }

    getTileZxy(lat, lon, z) {
        const toRad = (value) => {
            return value * Math.PI / 180;
        };

        const x = parseInt(Math.floor((lon + 180) / 360 * (1 << z)), 10);
        const y = parseInt(Math.floor((1 - Math.log(Math.tan(toRad(lat)) + 1 / Math.cos(toRad(lat))) / Math.PI) / 2 * (1 << z)), 10);

        return {
            z, x, y
        };
    }
}

module.exports = Sqlite;
