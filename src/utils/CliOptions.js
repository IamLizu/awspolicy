const { program: commanderProgram } = require("commander");
const { version } = require("../../package.json");

/**
 * Class representing command line options.
 */
class CliOptions {
    /**
     * Create a CliOptions object.
     */
    constructor(program = commanderProgram) {
        this.program = program;
        this.configureProgram();

        this.serviceValidations = {
            s3: {
                required: ["bucket", "permission"],
                errorMessage: {
                    bucket: "Error: The --bucket option must be a non-empty string.",
                    permission:
                        "Error: The --permission option should be in binary format (e.g., 111).",
                },
                validate: {
                    bucket: (value) =>
                        typeof value === "string" && value.trim().length > 0,
                    permission: (value) => /^[01]+$/.test(value),
                },
            },
            // Add other services and their validation rules here
        };
    }

    /**
     * Configure the commander program with options and help text.
     */
    configureProgram() {
        this.program
            .option("-s, --service <type>", "AWS service (e.g., s3, ec2)")
            .option("-b, --bucket <name>", "S3 bucket name")
            .option(
                "-p, --permission <levels>",
                "Permissions in binary format (e.g., 111)"
            )
            .parse(process.argv);
    }

    /**
     * Parse command line arguments.
     * @param {string[]} args - The command line arguments.
     * @return {Object} The options set from the command line arguments.
     */
    parse(args) {
        this.program.parse(args);
        return this.program.opts();
    }

    /**
     * Validate the command line arguments.
     * @return {boolean} True if the arguments are valid, false otherwise.
     */
    validateArgs() {
        const options = this.program.opts();

        // Validate the service option
        if (!options.service) {
            console.error("Error: The --service option is required.");
            process.exit(1);
        }

        const validations =
            this.serviceValidations[options.service.toLowerCase()];

        if (!validations) {
            console.error(`Error: Unsupported service '${options.service}'.`);
            process.exit(1);
        }

        // Validate required options
        validations.required.forEach((option) => {
            if (!options[option]) {
                console.error(validations.errorMessage[option]);
                process.exit(1);
            }
        });

        // Perform custom validations
        Object.keys(validations.validate).forEach((option) => {
            const isValid = validations.validate[option](options[option]);
            if (!isValid) {
                console.error(validations.errorMessage[option]);
                process.exit(1);
            }
        });

        return true;
    }

    /**
     * Get the service name.
     *
     * @returns {string} The service name.
     */
    getServiceName() {
        return this.program.opts().service;
    }

    /**
     * Get the path to the service module.
     *
     * @returns {string} The path to the service module.
     */
    getServicePath() {
        return `./services/${this.getServiceName()}`;
    }

    /**
     * Setup parsing and validation of command line arguments.
     */
    init(args) {
        this.parse(args);
        this.validateArgs();
    }
}

module.exports = new CliOptions();
