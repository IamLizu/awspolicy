const { program: commanderProgram } = require("commander");
const { version } = require("../../package.json");
const path = require("path");
const { ecrActions, actionTemplates } = require("../lib");

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

        this.ecrActions = ecrActions;
        this.templates = actionTemplates;

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
            ecr: {
                required: ["repositories", "permission", "region", "accountId"],
                errorMessage: {
                    repositories:
                        "Error: The --repositories option must be a comma-separated list of non-empty strings.",
                    permission:
                        "Error: The --permission option must be a comma-separated list of valid ECR actions.",
                    region: "Error: The --region option is required for ECR service.",
                    accountId:
                        "Error: The --account-id option is required for ECR service.",
                },
                validate: {
                    repositories: (value) =>
                        typeof value === "string" && value.trim().length > 0,
                    permission: (value) => {
                        const actions = value
                            .split(",")
                            .map((action) => action.trim());
                        return actions.every((action) =>
                            this.ecrActions.includes(action)
                        );
                    },
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
            .version(version, "-v, --version")
            .option("-s, --service <type>", "AWS service (e.g., s3, ecr)")
            .option("-b, --bucket <name>", "S3 bucket name (required for S3)")
            .option(
                "-rp, --repositories <name>",
                "Comma-separated list of ECR repository names (required for ECR)"
            )
            .option(
                "-rg, --region <region>",
                "AWS region (e.g., ap-southeast-2)"
            )
            .option(
                "-a, --account-id <accountId>",
                "AWS account ID (e.g., 021704626424)"
            )
            .option(
                "-p, --permission <levels>",
                "Permissions for the selected service. \nFor S3: binary format (e.g., 111). \nFor ECR: comma-separated list of actions (e.g., ListImages,PutImage)"
            )
            .option(
                "-t, --template <name>",
                "Template for predefined permissions (e.g., generic for ECR)"
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
     *
     * @param {Object} options - The parsed options from the command line arguments.
     * @return {boolean} True if the arguments are valid, false otherwise.
     */
    validateArgs(options) {
        if (!options.service) {
            console.error("Error: The --service option is required.");
            process.exit(1);
        }

        const service = options.service.toLowerCase();
        const validations = this.serviceValidations[service];

        if (!validations) {
            console.error(`Error: Unsupported service '${options.service}'.`);
            process.exit(1);
        }

        // Only require region and account ID for ECR service
        if (service === "ecr") {
            if (!options.region) {
                console.error(
                    "Error: The --region option is required for ECR service."
                );
                process.exit(1);
            }

            if (!options.accountId) {
                console.error(
                    "Error: The --account-id option is required for ECR service."
                );
                process.exit(1);
            }
        }

        // If a template is provided, skip permission validation
        if (options.template) {
            if (
                !this.templates[service] ||
                !this.templates[service][options.template]
            ) {
                console.error(
                    `Error: Template '${options.template}' not found for service '${service}'.`
                );
                process.exit(1);
            }
            options.permission =
                this.templates[service][options.template].join(",");
            return true;
        }

        // Validate required options
        validations.required.forEach((option) => {
            if (!options[option]) {
                console.error(validations.errorMessage[option]);
                process.exit(1);
            }
        });

        // Perform custom validations
        if (validations.validate) {
            Object.keys(validations.validate).forEach((option) => {
                const isValid = validations.validate[option](options[option]);
                if (!isValid) {
                    console.error(validations.errorMessage[option]);
                    process.exit(1);
                }
            });
        }

        return true;
    }

    /**
     * Get the service name.
     *
     * @returns {string} The service name.
     */
    getServiceName() {
        return this.program.opts().service.toUpperCase();
    }

    /**
     * Get the path to the service module.
     *
     * @returns {string} The path to the service module.
     */
    getServicePath() {
        const serviceName = this.getServiceName();
        return path.join(__dirname, "..", "services", serviceName);
    }

    /**
     * Retrieve the parsed command line options.
     *
     * @return {Object} The parsed options from the command line arguments.
     */
    getOptions() {
        return this.program.opts();
    }

    /**
     * Setup parsing and validation of command line arguments.
     */
    init(args) {
        this.parse(args);

        const options = this.getOptions();
        this.validateArgs(options);
    }
}

module.exports = new CliOptions();
