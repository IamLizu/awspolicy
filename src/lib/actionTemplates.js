const templates = {
    ecr: {
        generic: [
            "GetAuthorizationToken",
            "BatchCheckLayerAvailability",
            "InitiateLayerUpload",
            "UploadLayerPart",
            "CompleteLayerUpload",
            "PutImage",
            "BatchGetImage",
            "GetDownloadUrlForLayer",
        ],
    },
    // Add templates for other services like S3 here later
};

module.exports = templates;
