process.env.NODE_CONFIG_DIR = 'test/config';

const msc = require('msc-core');
const mscpExpress = require('../source/index.js');

describe('', () => {
    let microservice;

    beforeAll(async () => {
        microservice = await msc({
            plugins: [mscpExpress()]
        });

        await microservice.host();
    });

    it('', () => {

    });

});
