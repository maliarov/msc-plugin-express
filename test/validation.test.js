const msc = require('msc-core');
const express = require('../source/index.js');

describe('basic plugin initialization validation', () => {
    let microservice;

    beforeAll(async () => {
        microservice = await msc({
            plugins: [express()]
        });
    });

    it('should throw error', async () => {
        try {
            await microservice
                .use.method('hello', ({ params }) => null, { express: { verb: 'test', route: '/api/hello' } })
                .start();
        } catch (e) {
            expect(e).toMatchObject(new Error('not supported verb'));
        }
    })

});