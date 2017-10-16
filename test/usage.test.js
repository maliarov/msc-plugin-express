process.env.NODE_CONFIG_DIR = 'test/config';

const fetch = require('node-fetch');
const msc = require('msc-core');
const express = require('../source/index.js');


describe('use plugin', () => {
    let microservice;

    const responseData = {
        defaults1: null,
        defaults2: null,

        all: null,

        get: null,
        post: null,
        pull: null,
        patch: null,
        delete: null
    }

    beforeAll(async () => {
        microservice = await msc({
            plugins: [express()]
        });

        await microservice
            .use.method('defaults1', () => 'defaults1')
            .use.method('defaults2', () => 'defaults2', { express: {} })
            .use.method('all', ({ }) => { }, { express: { verb: '*', route: '/api/all' } })
            .use.method('get', ({ params }) => ({ id: Number(params.id) }), { express: { verb: 'get', route: '/api/entities/:id' } })
            .use.method('post', ({ params }) => ({ id: 'new', ...params.data }), { express: { verb: 'post', route: '/api/entities' } })
            .use.method('put', ({ params }) => ({ id: Number(params.id), ...params.data }), { express: { verb: 'put', route: '/api/entities/:id' } })
            .use.method('patch', ({ params }) => ({ id: Number(params.id), ...params.data }), { express: { verb: 'patch', route: '/api/entities/:id' } })
            .use.method('delete', () => { }, { express: { verb: 'delete', route: '/api/entities/:id' } })
            .start();
    });

    beforeAll(async () => {
        responseData.defaults1 = await fetch('http://localhost:3100/defaults1', { method: 'GET' });
        responseData.defaults2 = await fetch('http://localhost:3100/defaults2', { method: 'GET' });

        responseData.all = await fetch('http://localhost:3100/api/all', { method: 'PUT' });
        
        responseData.get = await (await fetch('http://localhost:3100/api/entities/1', {
            method: 'GET'
        })).json();

        responseData.post = await (await fetch('http://localhost:3100/api/entities', {
            method: 'POST', body: JSON.stringify({ a: 1 }), headers: { ['content-type']: 'application/json' }
        })).json();

        responseData.put = await (await fetch('http://localhost:3100/api/entities/2', {
            method: 'PUT', body: JSON.stringify({ a: 2 }), headers: { ['content-type']: 'application/json' }
        })).json();

        responseData.patch = await (await fetch('http://localhost:3100/api/entities/3', {
            method: 'PATCH', body: JSON.stringify({ a: 3 }), headers: { ['content-type']: 'application/json' }
        })).json();

        responseData.delete = await fetch('http://localhost:3100/api/entities/4', { method: 'DELETE' });
    });


    afterAll(async () => {
        await microservice.stop();
    });

    it('should extend context', () => {
        expect(microservice).toHaveProperty('express.app');
        expect(microservice).toHaveProperty('http.server');
    });

    it('', () => {
        expect(responseData.defaults1).toMatchObject({ status: 404 });
        expect(responseData.defaults2).toMatchObject({ status: 200 });

        expect(responseData.all).toMatchObject({ status: 200 });

        expect(responseData.get).toMatchObject({ id: 1 });
        expect(responseData.post).toMatchObject({ id: 'new', a: 1 });
        expect(responseData.put).toMatchObject({ id: 2, a: 2 });
        expect(responseData.patch).toMatchObject({ id: 3, a: 3 });
        expect(responseData.delete).toMatchObject({ status: 200 });
    });
});