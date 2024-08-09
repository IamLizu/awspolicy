#! /usr/bin/env node

const { cliOptions } = require("./utils");

async function main() {
    try {
        cliOptions.init(process.argv);

        /**
         * Loading the service module dynamically,
         * based on the command line arguments.
         *
         * For example, if the user specifies --service s3,
         * the service module at src/services/S3.js will be loaded.
         * (The service name is case-insensitive.)
         *
         * The service module must have an execute method.
         */
        const serviceModule = require(cliOptions.getServicePath());

        /**
         * Set the options for the service module.
         * The options are the parsed command line arguments.
         *
         * It should have the required options a specific service that has been called with.
         * So, we simply pass the options to the service module.
         */
        serviceModule.setOptions(cliOptions.getOptions());

        serviceModule.execute();
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
