const ecrActions = require("../lib/ecrActions");

/**
 * Class representing the ECR service for generating IAM policies.
 */
class ECRService {
    constructor() {
        this.repository = null;
        this.permission = null;
        this.region = null;
        this.accountId = null;

        this.actions = ecrActions;
    }

    /**
     * Set the repository, permissions, region, and account ID based on the provided options.
     *
     * @param {Object} options - The options object containing the repository, permissions, region, and account ID.
     * @param {string} options.repository - The ECR repository name.
     * @param {string} options.permission - The comma-separated list of permissions.
     * @param {string} options.region - The AWS region.
     * @param {string} options['account-id'] - The AWS account ID.
     */
    setOptions(options) {
        this.setRepository(options.repository);
        this.setPermissions(options.permission);
        this.setRegion(options.region);
        this.setAccountId(options.accountId);
    }

    /**
     * Set the repository name.
     * @param {string} repository - The ECR repository name.
     */
    setRepository(repository) {
        this.repository = repository;
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
     * Generate IAM policy based on the repository name, permissions, region, and account ID.
     * @return {Object} The generated IAM policy.
     */
    /**
     * Generate IAM policy based on the repository name, permissions, region, and account ID.
     * @return {Object} The generated IAM policy.
     */
    generatePolicy() {
        if (
            !this.repository ||
            !Array.isArray(this.permissions) ||
            this.permissions.length === 0 ||
            !this.region ||
            !this.accountId
        ) {
            throw new Error(
                "Repository name, permissions, region, and account ID must be set before generating policy."
            );
        }

        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Action: "ecr:GetAuthorizationToken",
                    Resource: "*",
                },
                {
                    Effect: "Allow",
                    Action: this.permissions,
                    Resource: `arn:aws:ecr:${this.region}:${this.accountId}:repository/${this.repository}`,
                },
            ],
        };

        return policy;
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
