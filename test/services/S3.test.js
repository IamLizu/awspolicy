const s3 = require("../../src/services/S3");

describe("S3 Service", () => {
    let s3Service;

    beforeEach(() => {
        s3Service = s3;
    });

    describe("setOptions", () => {
        it("should throw an error if bucket or permissions are not set", () => {
            expect(() => s3Service.setOptions()).toThrowError(
                "Bucket name and permissions are require."
            );
        });

        it("should set the bucket and permissions correctly", () => {
            const options = { bucket: "my-bucket", permission: "111" };
            s3Service.setOptions(options);

            expect(s3Service.bucket).toBe("my-bucket");
            expect(s3Service.permission).toBe("111");
        });
    });

    describe("generatePolicy", () => {
        it("should generate a policy with ListBucket action if permission[0] is 1", () => {
            s3Service.setOptions({ bucket: "my-bucket", permission: "100" });
            const policy = s3Service.generatePolicy();

            expect(policy.Statement).toHaveLength(1);
            expect(policy.Statement[0].Action).toContain("s3:ListBucket");
            expect(policy.Statement[0].Resource).toContain(
                "arn:aws:s3:::my-bucket"
            );
        });

        it("should generate a policy with GetObject action if permission[1] is 1", () => {
            s3Service.setOptions({ bucket: "my-bucket", permission: "010" });
            const policy = s3Service.generatePolicy();

            expect(policy.Statement).toHaveLength(1);
            expect(policy.Statement[0].Action).toContain("s3:GetObject");
            expect(policy.Statement[0].Resource).toContain(
                "arn:aws:s3:::my-bucket/*"
            );
        });

        it("should generate a policy with PutObject and DeleteObject actions if permission[2] is 1", () => {
            s3Service.setOptions({ bucket: "my-bucket", permission: "001" });
            const policy = s3Service.generatePolicy();

            expect(policy.Statement).toHaveLength(1);
            expect(policy.Statement[0].Action).toContain("s3:PutObject");
            expect(policy.Statement[0].Action).toContain("s3:DeleteObject");
            expect(policy.Statement[0].Resource).toContain(
                "arn:aws:s3:::my-bucket/*"
            );
        });

        it("should generate a policy with all actions if permission is 111", () => {
            s3Service.setOptions({ bucket: "my-bucket", permission: "111" });
            const policy = s3Service.generatePolicy();

            expect(policy.Statement).toHaveLength(2);

            expect(policy.Statement[0].Action).toContain("s3:ListBucket");
            expect(policy.Statement[0].Resource).toContain(
                "arn:aws:s3:::my-bucket"
            );

            expect(policy.Statement[1].Action).toContain("s3:GetObject");
            expect(policy.Statement[1].Action).toContain("s3:PutObject");
            expect(policy.Statement[1].Action).toContain("s3:DeleteObject");
            expect(policy.Statement[1].Resource).toContain(
                "arn:aws:s3:::my-bucket/*"
            );
        });
    });

    describe("execute", () => {
        it("should print the generated policy to the console", () => {
            s3Service.setOptions({ bucket: "my-bucket", permission: "111" });
            console.log = jest.fn();

            s3Service.execute();

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('"s3:ListBucket"')
            );
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('"s3:GetObject"')
            );
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('"s3:PutObject"')
            );
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('"s3:DeleteObject"')
            );
        });
    });
});
