const ecrActions = require("../lib/ecrActions");

/**
 * Class representing the ECR service for generating IAM policies.
 */
class ECRService {
    constructor() {
        this.repository = null;
        this.permission = null;

        this.actions = ecrActions;
    }

    /**
     * Set the repository and permissions based on the provided options.
     *
     * @param {Object} options - The options object containing the repository and permissions.
     * @param {string} options.repository - The S3 repository.
     * @param {string} options.permission - The comma separated list of permissions.
     */
    setOptions(options) {
        this.setRepository(options.repository);
        this.setPermissions(options.permission);
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
        this.permissions = permissions
            .split(",")
            .map((permission) => `ecr:${permission.trim()}`);
    }

    /**
     * Generate IAM policy based on the repository name and permissions.
     * @return {Object} The generated IAM policy.
     */
    generatePolicy() {
        if (!this.repository || !this.permissions) {
            throw new Error(
                "Repository name and permissions must be set before generating policy."
            );
        }

        // Create the IAM policy
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Action: this.permissions,
                    Resource: `arn:aws:ecr:::${this.repository}`,
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
