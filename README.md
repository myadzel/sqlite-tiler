sqlite-tiler
================


About
-------

Module **sqlite-tiler** read sqlite tiles database and returns tiles data.

This module is being developed to work in a browser environment, not just a Node, so NPM module sql.js instead of sqlite3 was chosen to work with the databases.


Install
-------
>$ npm install sql-tiler


API
-------
Module accept buffer of SQLite database file as argument in read() method and returns (tiler) object with the following methods:

tiler.getTiles()
    returns array of tiles

tiler.getTileFormat()
    returns tile image format string (jpg, png, pbf, etc)

tiler.getMinZoom()
    returns minimal zoom of tileset

tiler.getMaxZoom()
    returns maximal zoom of tileset

tiler.getTileByCoord(lat, lon, z)
    returns tile

Each tile object contains tile image data, zoom and x, y values as tile coordinates.


Usage example
-------

```js
const fs = require('fs');

const sqliteTiler = require('sqlite-tiler');

const buffer = fs.readFileSync('./countries-raster.mbtiles');

sqliteTiler.read(buffer).then((tiler) => {
    console.log([tiler.getTileFormat(), tiler.getMinZoom(), tiler.getMaxZoom(), tiler.getTiles()]);
}).catch((err) => {
    console.error(err);
});
```

License
-------

MIT
