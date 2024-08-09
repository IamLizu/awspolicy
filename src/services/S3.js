/**
 * Class representing the S3 service for generating IAM policies.
 */
class S3 {
    constructor() {
        this.bucket = null;
        this.permission = null;
    }

    /**
     * Set the bucket name and permissions based on the provided options.
     *
     * @param {Object} options - The options object containing the bucket name and permissions.
     * @param {string} options.bucket - The S3 bucket name.
     * @param {string} options.permission - The permission string in binary format (e.g., "111").
     */
    setOptions(options) {
        this.bucket = options.bucket;
        this.permission = options.permission;
    }

    /**
     * Generate IAM policy based on the bucket name and permissions.
     * @return {Object} The generated IAM policy.
     */
    generatePolicy() {
        if (!this.bucket || !this.permission) {
            throw new Error(
                "Bucket name and permissions must be set before generating policy."
            );
        }

        const statements = [];

        // Interpret the permission string (e.g., 111)
        if (this.permission[0] === "1") {
            statements.push({
                Effect: "Allow",
                Action: ["s3:ListBucket"],
                Resource: [`arn:aws:s3:::${this.bucket}`],
            });
        }
        if (this.permission[1] === "1" || this.permission[2] === "1") {
            const objectActions = [];
            if (this.permission[1] === "1") {
                objectActions.push("s3:GetObject");
            }
            if (this.permission[2] === "1") {
                objectActions.push("s3:PutObject", "s3:DeleteObject");
            }
            statements.push({
                Effect: "Allow",
                Action: objectActions,
                Resource: [`arn:aws:s3:::${this.bucket}/*`],
            });
        }

        // Create the IAM policy
        const policy = {
            Version: "2012-10-17",
            Statement: statements,
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

module.exports = new S3();
