const express = require('express');

module.exports = plugin;

function plugin({ suppressDefaultOnHost } = {}) {

    return {
        onPreInit,
        onHost
    };

    function onPreInit(context) {
        context.web = context.web || {};
        context.web.express = {};
        context.web.express.app = express();
    }

    async function onHost(context) {
        if (suppressDefaultOnHost) {
            return;
        }

        const port = await context.get('web.port');

        return new Promise((resolve, reject) => {
            context.web.express.app
                .listen(port, resolve)
                .on('error', reject);
        });
    }

}