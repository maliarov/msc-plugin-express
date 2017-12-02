const util = require('util');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

module.exports = pluginFactory;


function pluginFactory({
    suppressDefaultOnStart = false,
    suppressDefaultOnStop = false,
    suppressDefaultBodyParser = false
} = {}) {

    return {
        onPreInit,
        onInit,
        onStart,
        onStop
    };


    function onPreInit(context) {
        context.express = {};
        context.express.app = express();

        if (!suppressDefaultBodyParser) {
            context.express.app.use(bodyParser.json({ type: 'application/json' }));
        }

        context.http = context.http || {};
        context.http.server = http.createServer(context.express.app);
    }

    function onInit(context) {

        Object
            .keys(context.call)
            .filter((key) => util.isFunction(context.call[key]) && context.call[key].meta && context.call[key].meta.express)
            .forEach(register);

        function register(key) {
            const method = context.call[key];
            const meta = method.meta.express;
            const verb = meta.verb || 'get';
            const route = meta.route || `/${key}`;

            switch (verb) {
                case 'get':
                case 'post':
                case 'put':
                case 'patch':
                case 'delete':
                    return context.express.app[verb](route, handler);
                case '*':
                    return context.express.app.use(route, handler);
                default:
                    throw new Error(`not supported verb [${verb}]`);
            }


            function handler(req, res, next) {

                method(Object.assign({}, req.params, req.query, { data: req.body }))
                    .then(onSuccess, next);


                function onSuccess(value) {
                    if (!value) {
                        return res.status(200).end();
                    }

                    return res.json(value).end();
                }

            }
        }

    }

    async function onStart(context) {
        if (suppressDefaultOnStart) {
            return;
        }

        const port = await context.get('http.port');

        return new Promise((resolve, reject) => {
            context.http.server
                .listen(port, resolve)
                .on('error', reject);
        });
    }

    function onStop(context) {
        if (suppressDefaultOnStop) {
            return;
        }

        return new Promise((resolve, reject) => {
            context.http.server
                .close(resolve)
                .on('error', reject);
        });
    }

}