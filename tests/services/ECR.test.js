const ECRService = require("../../src/services/ECR");

describe("ECRService", () => {
    beforeEach(() => {
        // Reset the ECRService before each test
        ECRService.setRepositories(null);
        ECRService.setPermissions(null);
        ECRService.setRegion(null);
        ECRService.setAccountId(null);
    });

    describe("setOptions", () => {
        it("should set repositories, permissions, region, and accountId correctly", () => {
            const options = {
                repositories: "test-repo1,test-repo2",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "12345789101",
            };

            ECRService.setOptions(options);

            expect(ECRService.repositories).toEqual([
                "ecr:test-repo1",
                "ecr:test-repo2",
            ]);
            expect(ECRService.permissions).toEqual([
                "ecr:BatchCheckLayerAvailability",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
            ]);
            expect(ECRService.region).toBe("ap-southeast-2");
            expect(ECRService.accountId).toBe("12345789101");
        });
    });

    describe("generatePolicy", () => {
        it("should generate a valid IAM policy when all options are set", () => {
            const options = {
                repositories: "test-repo1,test-repo2",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "12345789101",
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
                        Resource: [
                            "arn:aws:ecr:ap-southeast-2:12345789101:repository/ecr:test-repo1",
                            "arn:aws:ecr:ap-southeast-2:12345789101:repository/ecr:test-repo2",
                        ],
                    },
                ],
            });
        });

        it("should throw an error if repositories are not set", () => {
            const options = {
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "12345789101",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository names, permissions, region, and account ID must be set before generating policy."
            );
        });

        it("should throw an error if permissions are not set", () => {
            const options = {
                repositories: "test-repo1,test-repo2",
                region: "ap-southeast-2",
                accountId: "12345789101",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository names, permissions, region, and account ID must be set before generating policy."
            );
        });

        it("should throw an error if region is not set", () => {
            const options = {
                repositories: "test-repo1,test-repo2",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                accountId: "12345789101",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository names, permissions, region, and account ID must be set before generating policy."
            );
        });

        it("should throw an error if accountId is not set", () => {
            const options = {
                repositories: "test-repo1,test-repo2",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
            };

            ECRService.setOptions(options);

            expect(() => ECRService.generatePolicy()).toThrow(
                "Repository names, permissions, region, and account ID must be set before generating policy."
            );
        });
    });

    describe("execute", () => {
        it("should generate and print the IAM policy", () => {
            const options = {
                repositories: "test-repo1,test-repo2",
                permission:
                    "BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart",
                region: "ap-southeast-2",
                accountId: "12345789101",
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
                                Resource: [
                                    "arn:aws:ecr:ap-southeast-2:12345789101:repository/ecr:test-repo1",
                                    "arn:aws:ecr:ap-southeast-2:12345789101:repository/ecr:test-repo2",
                                ],
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
