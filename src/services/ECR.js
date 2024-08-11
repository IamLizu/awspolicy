const ecrActions = require("../lib/ecrActions");

/**
 * Class representing the ECR service for generating IAM policies.
 */
class ECRService {
    constructor() {
        this.repositories = [];
        this.permission = null;
        this.region = null;
        this.accountId = null;

        this.actions = ecrActions;
    }

    /**
     * Set the repository, permissions, region, and account ID based on the provided options.
     *
     * @param {Object} options - The options object containing the repository, permissions, region, and account ID.
     * @param {string} options.repositories - Comma-separated list of ECR repository names.
     * @param {string} options.permission - The comma-separated list of permissions.
     * @param {string} options.region - The AWS region.
     * @param {string} options.accountId - The AWS account ID.
     */
    setOptions(options) {
        this.setRepositories(options.repositories);
        this.setPermissions(options.permission);
        this.setRegion(options.region);
        this.setAccountId(options.accountId);
    }

    /**
     * Set the repository names.
     * @param {string} repositories - Comma-separated list of ECR repository names.
     */
    setRepositories(repositories) {
        if (typeof repositories === "string") {
            this.repositories = repositories
                .split(",")
                .map((permission) => `ecr:${permission.trim()}`);
        } else {
            this.repositories = [];
        }
    }

    /**
     * Set the permissions list.
     * @param {string} permissions - Comma-separated list of permissions (e.g., "ListImages,GetDownloadUrlForLayer").
     */
    setPermissions(permissions) {
        if (typeof permissions === "string") {
            this.permissions = permissions
                .split(",")
                .map((permission) => `ecr:${permission.trim()}`);
        } else {
            this.permissions = [];
        }
    }

    /**
     * Set the AWS region.
     * @param {string} region - The AWS region.
     */
    setRegion(region) {
        this.region = region;
    }

    /**
     * Set the AWS account ID.
     * @param {string} accountId - The AWS account ID.
     */
    setAccountId(accountId) {
        this.accountId = accountId;
    }

    /**
     * Generate IAM policy based on the repository names, permissions, region, and account ID.
     * @return {Object} The generated IAM policy.
     */
    generatePolicy() {
        if (
            this.repositories.length === 0 ||
            !Array.isArray(this.permissions) ||
            this.permissions.length === 0 ||
            !this.region ||
            !this.accountId
        ) {
            throw new Error(
                "Repository names, permissions, region, and account ID must be set before generating policy."
            );
        }

        const policyStatements = [
            {
                Effect: "Allow",
                Action: "ecr:GetAuthorizationToken",
                Resource: "*",
            },
            {
                Effect: "Allow",
                Action: this.permissions,
                Resource: this.repositories.map(
                    (repository) =>
                        `arn:aws:ecr:${this.region}:${this.accountId}:repository/${repository}`
                ),
            },
        ];

        return {
            Version: "2012-10-17",
            Statement: policyStatements,
        };
    }

    /**
     * Execute the generation of the IAM policy and print it.
     */
    execute() {
        const policy = this.generatePolicy();
        console.log(JSON.stringify(policy, null, 2));
    }
}

module.exports = new ECRService();
