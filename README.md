# awspolicy

`awspolicy` is a command-line tool for generating custom [AWS IAM policies][iam-policy] with ease. Specify services, resources, and permissions through simple commands to create tailored security policies for your AWS projects.

**Disclaimer**: Not affiliated with AWS and is not an official AWS product. It is a personal project created to simplify the process of generating IAM policies for AWS services with a command-line interface. For a more user-friendly policy generator, consider using the [Policy Generator][policy-gen] of AWS.

## Installation

```bash
$ npm install awspolicy -g
```

## Features

-   Generate IAM policies for AWS services with ease
-   Specify services, resources, and permissions through simple commands
-   Create tailored security policies for your AWS projects
-   Most importantly, it's _offline_.

### Currently Supported Services

#### IAM Policies

-   S3
-   ECR

## Usage

```console
Options:
  -v, --version                 output the version number
  -s, --service <type>          AWS service (e.g., s3, ecr)
  -b, --bucket <name>           S3 bucket name (required for S3)
  -rp, --repository <name>      ECR repository name (required for ECR)
  -rg, --region <region>        AWS region (e.g., ap-southeast-2)
  -a, --account-id <accountId>  AWS account ID (e.g., 021704626424)
  -p, --permission <levels>     Permissions for the selected service
                                For S3: binary format (e.g., 111)
                                For ECR: comma-separated list of actions (e.g., ListImages,PutImage)
  -t, --template <name>         Template for predefined permissions (e.g., generic for ECR)
  -h, --help                    display help for command

```

### Examples

#### S3

```console
$ awspolicy -s s3 -b my-bucket -p 111
```

#### ECR

We have a predefined template called `generic` which provides the following permissions,

-   `BatchCheckLayerAvailability`
-   `InitiateLayerUpload`
-   `UploadLayerPart`
-   `CompleteLayerUpload`
-   `PutImage`
-   `BatchGetImage`
-   `GetDownloadUrlForLayer`

`GetAuthorizationToken` is added separately to the policy to allow the user to authenticate, no need to specify it.

```console
$ awspolicy -s ecr -rg ap-southeast-2 -a 12345678 -rp my-repo -t generic
```

Permissions can be manually specified as well

```console
$ awspolicy -s ecr -rg ap-southeast-2 -a 12345678 -rp my-repo -p BatchCheckLayerAvailability,InitiateLayerUpload,UploadLayerPart,CompleteLayerUpload,PutImage,BatchGetImage,GetDownloadUrlForLayer
```

## Contributing

Feel free to open an issue or submit a pull request. Adding other AWS services such as EC2, SES etc is highly encouraged.

[iam-policy]: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html
[policy-gen]: https://awspolicygen.s3.amazonaws.com/policygen.html
