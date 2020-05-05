const { fetchGlobalValues } = require('./utils');

async function dataDumper() {

    let globalStats = await fetchGlobalValues;

    return 'poo';
};

module.exports = {
    dataDumper
};