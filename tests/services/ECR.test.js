const ECRService = require("../../src/services/ECR");

describe("ECRService", () => {
    beforeEach(() => {
        // Reset the ECRService before each test
        ECRService.setRepository(null);
        ECRService.setPermissions(null);
        ECRService.setRegion(null);
        ECRService.setAccountId(null);
    });

    describe("setOptions", () => {
        it("should set repository, permissions, region, and accountId correctly", () => {
            const options = {
                repository: "test-repo",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "021704626424",
            };

            ECRService.setOptions(options);

            expect(ECRService.repository).toBe("test-repo");
            expect(ECRService.permissions).toEqual([
                "ecr:BatchCheckLayerAvailability",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
            ]);
            expect(ECRService.region).toBe("ap-southeast-2");
            expect(ECRService.accountId).toBe("021704626424");
        });
    });

    describe("generatePolicy", () => {
        it("should generate a valid IAM policy when all options are set", () => {
            const options = {
                repository: "test-repo",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "021704626424",
            };

            ECRService.setOptions(options);
            const policy = ECRService.generatePolicy();

            expect(policy).toEqual({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: "ecr:GetAuthorizationToken",
                        Resource: "*",
                    },
                    {
                        Effect: "Allow",
                        Action: [
                            "ecr:BatchCheckLayerAvailability",
                            "ecr:InitiateLayerUpload",
                            "ecr:UploadLayerPart",
                        ],
                        Resource:
                            "arn:aws:ecr:ap-southeast-2:021704626424:repository/test-repo",
                    },
                ],
            });
        });

        it("should throw an error if repository is not set", () => {
            const options = {
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "021704626424",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository name, permissions, region, and account ID must be set before generating policy."
            );
        });

        it("should throw an error if permissions are not set", () => {
            const options = {
                repository: "test-repo",
                region: "ap-southeast-2",
                accountId: "021704626424",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository name, permissions, region, and account ID must be set before generating policy."
            );
        });

        it("should throw an error if region is not set", () => {
            const options = {
                repository: "test-repo",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                accountId: "021704626424",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository name, permissions, region, and account ID must be set before generating policy."
            );
        });

        it("should throw an error if accountId is not set", () => {
            const options = {
                repository: "test-repo",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository name, permissions, region, and account ID must be set before generating policy."
            );
        });
    });

    describe("execute", () => {
        it("should generate and print the IAM policy", () => {
            const options = {
                repository: "test-repo",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "021704626424",
            };

            ECRService.setOptions(options);

            const consoleSpy = jest
                .spyOn(console, "log")
                .mockImplementation(() => {});

            ECRService.execute();

            expect(consoleSpy).toHaveBeenCalledWith(
                JSON.stringify(
                    {
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Effect: "Allow",
                                Action: "ecr:GetAuthorizationToken",
                                Resource: "*",
                            },
                            {
                                Effect: "Allow",
                                Action: [
                                    "ecr:BatchCheckLayerAvailability",
                                    "ecr:InitiateLayerUpload",
                                    "ecr:UploadLayerPart",
                                ],
                                Resource:
                                    "arn:aws:ecr:ap-southeast-2:021704626424:repository/test-repo",
                            },
                        ],
                    },
                    null,
                    2
                )
            );

            consoleSpy.mockRestore();
        });
    });
});
