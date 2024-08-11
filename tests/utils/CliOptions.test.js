const cliOptions = require("../../src/utils/CliOptions");
const { program } = require("commander");
const path = require("path");

// Mock the commander program
jest.mock("commander", () => {
    const mCommander = {
        version: jest.fn().mockReturnThis(),
        option: jest.fn().mockReturnThis(),
        addHelpText: jest.fn().mockReturnThis(),
        parse: jest.fn(),
        opts: jest.fn(),
        help: jest.fn(), // Mock help method
    };
    return { program: mCommander };
});

const mockArgs = [
    "node",
    "awspolicy",
    "--service",
    "s3",
    "--bucket",
    "my-bucket",
    "--permission",
    "111",
];

describe("CliOptions", () => {
    /**
     * Intentionally storing the original serviceValidations object
     * to restore it after each test.
     *
     * We could also reimport the module in each test, requesting to create issue if change needed.
     */
    let tempValidations;

    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error
        jest.spyOn(process, "exit").mockImplementation(() => {
            throw new Error("process.exit was called");
        }); // Mock process.exit

        tempValidations = cliOptions.serviceValidations.s3;
    });

    afterEach(() => {
        jest.clearAllMocks();
        cliOptions.serviceValidations.s3 = tempValidations;
    });

    it("should configure the program with options and help texts", () => {
        cliOptions.configureProgram();

        expect(program.version).toHaveBeenCalledWith(
            expect.any(String),
            "-v, --version"
        );
        expect(program.option).toHaveBeenCalledWith(
            "-s, --service <type>",
            "AWS service (e.g., s3, ecr)"
        );
        expect(program.option).toHaveBeenCalledWith(
            "-b, --bucket <name>",
            "S3 bucket name (required for S3)"
        );
        expect(program.option).toHaveBeenCalledWith(
            "-rp, --repository <name>",
            "ECR repository name (required for ECR)"
        );
        expect(program.option).toHaveBeenCalledWith(
            "-rg, --region <region>",
            "AWS region (e.g., ap-southeast-2)"
        );
        expect(program.option).toHaveBeenCalledWith(
            "-a, --account-id <accountId>",
            "AWS account ID (e.g., 021704626424)"
        );
        expect(program.option).toHaveBeenCalledWith(
            "-p, --permission <levels>",
            "Permissions for the selected service. \nFor S3: binary format (e.g., 111). \nFor ECR: comma-separated list of actions (e.g., ListImages,PutImage)"
        );
        expect(program.option).toHaveBeenCalledWith(
            "-t, --template <name>",
            "Template for predefined permissions (e.g., generic for ECR)"
        );
    });

    it("should exit with an error if the service option is missing", () => {
        try {
            cliOptions.validateArgs({});
        } catch (error) {
            expect(console.error).toHaveBeenCalledWith(
                "Error: The --service option is required."
            );
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }
    });

    it("should exit with an error if the service is unsupported", () => {
        try {
            cliOptions.validateArgs({ service: "some-other-service" });
        } catch (error) {
            expect(console.error).toHaveBeenCalledWith(
                "Error: Unsupported service 'some-other-service'."
            );
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }
    });

    it("should exit with an error if a required option is missing", () => {
        const validations = {
            required: ["bucket"],
            errorMessage: {
                bucket: "Error: The --bucket option is required.",
            },
        };

        cliOptions.serviceValidations.s3 = validations;

        try {
            cliOptions.validateArgs({
                service: "s3",
                permission: "111",
            });
        } catch (error) {
            expect(console.error).toHaveBeenCalledWith(
                validations.errorMessage.bucket
            );
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }
    });

    it("should exit with an error if a custom validation fails", () => {
        const validations = {
            required: ["permission"],
            errorMessage: {
                permission: "Error: Incorrect permission.",
            },
            validate: {
                permission: (value) => value === "111",
            },
        };

        cliOptions.serviceValidations.s3 = validations;

        try {
            cliOptions.validateArgs({
                service: "s3",
                bucket: "my-bucket",
                permission: "000",
            });
        } catch (error) {
            expect(console.error).toHaveBeenCalledWith(
                validations.errorMessage.permission
            );
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }
    });

    it("should exit with an error if bucket name is valid string", () => {
        try {
            cliOptions.validateArgs({
                service: "s3",
                permission: "111",
            });
        } catch (error) {
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }
    });

    it("should exit with an error if permission is not in binary format", () => {
        try {
            cliOptions.validateArgs({
                service: "s3",
                bucket: "my-bucket",
                permission: "123",
            });
        } catch (error) {
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }
    });

    it("should validate the bucket name as a non-empty string", () => {
        // Test invalid bucket name (empty string)
        try {
            cliOptions.validateArgs({
                service: "s3",
                bucket: "",
                permission: "111",
            });
        } catch (error) {
            expect(console.error).toHaveBeenCalledWith(
                "Error: The --bucket option must be a non-empty string."
            );
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }

        // Test valid bucket name
        expect(() => {
            cliOptions.validateArgs({
                service: "s3",
                bucket: "my-bucket",
                permission: "111",
            });
        }).not.toThrow();
    });

    it("should validate the permission as a binary format string", () => {
        // Test invalid permission format
        try {
            cliOptions.validateArgs({
                service: "s3",
                bucket: "my-bucket",
                permission: "123",
            });
        } catch (error) {
            expect(console.error).toHaveBeenCalledWith(
                "Error: The --permission option should be in binary format (e.g., 111)."
            );
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(error.message).toBe("process.exit was called");
        }

        // Test valid permission format
        expect(() => {
            cliOptions.validateArgs({
                service: "s3",
                bucket: "my-bucket",
                permission: "111",
            });
        }).not.toThrow();
    });

    it("should initialize and call parse, validateArgs", () => {
        program.parse.mockImplementation(() => {
            program.opts.mockReturnValue({
                service: "s3",
                bucket: "my-bucket",
                permission: "111",
            });
        });

        jest.spyOn(cliOptions, "parse");
        jest.spyOn(cliOptions, "validateArgs");

        cliOptions.init(mockArgs);

        expect(cliOptions.parse).toHaveBeenCalledWith(mockArgs);
        expect(cliOptions.validateArgs).toHaveBeenCalled();
    });

    it("it should return service name when getServiceName is called", () => {
        program.opts.mockReturnValue({ service: "S3" });

        const serviceName = cliOptions.getServiceName();

        expect(serviceName).toBe("S3");
    });

    it("it should return service path when getServicePath is called", () => {
        program.opts.mockReturnValue({ service: "s3" });

        const servicePath = cliOptions.getServicePath();
        const expectedPath = path.join(
            __dirname,
            "..",
            "..",
            "src",
            "services",
            "S3"
        );

        expect(servicePath).toBe(expectedPath);
    });
});
