process.env.NODE_CONFIG_DIR = 'test/config';

const msc = require('msc-core');
const mscpExpress = require('../source/index.js');

describe('use plugin', () => {
    let microservice;

    beforeAll(async () => {
        microservice = await msc({
            plugins: [mscpExpress()]
        });

        await microservice.start();
    });

    afterAll(async () => {
        await microservice.stop();
    });

    it('should extend context', () => {
        expect(microservice).toHaveProperty('express.app');
        expect(microservice).toHaveProperty('http.server');
    });

});