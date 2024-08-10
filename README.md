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

-   S3 IAM Policies

## Usage

```console
Options:
  -v, --version              output the version number
  -s, --service <type>       AWS service (e.g., s3, ec2)
  -b, --bucket <name>        S3 bucket name
  -p, --permission <levels>  Permissions in binary format (e.g., 111)
  -h, --help                 display help for command
```

### Examples

```console
$ awspolicy -s s3 -b my-bucket -p 111
```

## Contributing

Feel free to open an issue or submit a pull request. Adding other AWS services such as EC2, ECR etc is highly encouraged.

[iam-policy]: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html
[policy-gen]: https://awspolicygen.s3.amazonaws.com/policygen.html
