# Minimal CloudFormation for Movie Ticket Sales

This stack aims for the lowest possible AWS cost while meeting your constraints:

- No ALB, Route53, SES, SNS, ElastiCache, Lambda
- EC2 in a public subnet
- Optional RDS MySQL `db.t4g.micro`
- Single Availability Zone for EC2 and public subnet

Important note about RDS: AWS requires an RDS DB Subnet Group to include subnets in at least two different AZs within a region. Because you requested “only one AZ”, the template makes RDS creation optional (`CreateRDS=false` by default). If you want to enable RDS, you must provide/modify a DB Subnet Group with two subnets across two AZs.

## Files
- `infra/cloudformation/minimal.yaml`: CloudFormation template

## Parameters
- `StackName`: Prefix for resource names
- `AvailabilityZone`: Single AZ name (e.g., `ap-southeast-1a`)
- `VpcCidr`: VPC CIDR (default `10.0.0.0/16`)
- `PublicSubnetCidr`: Public subnet CIDR (default `10.0.0.0/24`)
- `KeyPairName`: Existing EC2 Key Pair
- `InstanceType`: EC2 type (default `t4g.micro`)
- `AmiId`: AMI ID compatible with instance type (Amazon Linux 2023 ARM recommended)
- `CreateRDS`: `true|false` (default `false`)
- `DBUsername`, `DBPassword`, `DBName`: RDS settings (used only if `CreateRDS=true`)

## Deploy

1) Package not required (no transforms). Deploy directly:

```powershell
$StackName = "movie-ticket-minimal";
$Region = "ap-southeast-1";
$AZ = "ap-southeast-1a";
$KeyPair = "your-keypair";
$AMI = "ami-xxxxxxxxxxxxxxxxx"; # Amazon Linux 2023 ARM for Graviton

aws cloudformation deploy `
  --stack-name $StackName `
  --template-file infra/cloudformation/minimal.yaml `
  --capabilities CAPABILITY_NAMED_IAM `
  --region $Region `
  --parameter-overrides `
    StackName=$StackName `
    AvailabilityZone=$AZ `
    KeyPairName=$KeyPair `
    AmiId=$AMI `
    CreateRDS=false
```

2) If you want RDS, prepare a DB Subnet Group in 2 AZs, then update the stack with `CreateRDS=true` and replace the placeholder in the template or modify it to use your existing `DBSubnetGroupName`.

## Post-deploy
- Get the EC2 public DNS/IP from stack outputs and open port `8080` (already allowed by SG). Access: `http://<EC2PublicDns>:8080`
- The user-data expects a JAR at `/opt/app/app.jar`. Update user-data to fetch your built Spring Boot JAR from a secure source (e.g., private S3 bucket or CodeDeploy) and include environment variables (DB URL, credentials) as needed.

## Cost tips
- Use Graviton (`t4g.micro`) and Amazon Linux 2023 ARM AMI
- Keep EBS size low (default from AMI). Consider gp3 with minimal IOPS if customizing volumes
- Disable backups for dev/test RDS to minimize cost (already `BackupRetentionPeriod=0`) — not recommended for prod
- Consider Lightsail for the absolute cheapest single-node setup if CloudFormation/VPC overhead isn’t required

## Security reminders
- Do not hardcode AWS keys or email passwords in `application.properties`. Use SSM Parameter Store or Secrets Manager and environment variables.
- Restrict SSH (`22`) to your IP ranges instead of `0.0.0.0/0` for production.
