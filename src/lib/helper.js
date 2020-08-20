const helper = {
    getSqlResultAsObjectsArray: (result) => {
        const { values, columns } = result;

        return values.map((values) => {
            const obj = {};

            values.forEach((value, idx) => {
                obj[columns[idx]] = value;
            });

            return obj;
        });
    }
};

module.exports = helper;
