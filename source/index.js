const express = require('express');
const http = require('http');

module.exports = pluginFactory;


function pluginFactory({ suppressDefaultOnStart, suppressDefaultOnStop } = {}) {

    return {
        onPreInit,
        onStart,
        onStop
    };


    function onPreInit(context) {
        context.express = {};
        context.express.app = express();

        context.http = context.http || {};
        context.http.server = http.createServer(context.express.app);
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