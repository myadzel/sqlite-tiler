// MBTiles

// https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md

const Sqlite = require('./sqlite');

class Mbtiles extends Sqlite {
    constructor(database) {
        super(database);
    }

    readDatabase() {
        const p1 = new Promise((resolve, reject) => {
            this.query('SELECT * FROM metadata', (err, rows) => {
                if (err) {
                    reject(err);
                }

                const getRowValueByName = (name) => {
                    const row = rows.find((row) => row.name === name);

                    return row && row.value;
                };

                this.setMinZoom(getRowValueByName('minzoom'));
                this.setMaxZoom(getRowValueByName('maxzoom'));

                this.setTileFormat(getRowValueByName('format'));

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
                        image: row.tile_data,
                        zoom: this.normalizeZoomValue(row.zoom_level),
                        x: row.tile_column,
                        y: this.normalizeYValue(row.tile_row, row.zoom_level),
                    };
                });

                this.setTiles(tiles);

                resolve();
            });
        });

        return Promise.all([p1, p2]);
    }

    normalizeZoomValue(z) {
        return z;
    }

    normalizeYValue(y, z) {
        // https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md
        //
        // Note that in the TMS tiling scheme, the Y axis is reversed from the "XYZ"
        // coordinate system commonly used in the URLs to request individual tiles,
        // so the tile commonly referred to as 11/327/791 is inserted as zoom_level 11,
        // tile_column 327, and tile_row 1256, since 1256 is 2^11 - 1 - 791.

        return Math.pow(2, z) - 1 - y;
    }
}

module.exports = Mbtiles;
