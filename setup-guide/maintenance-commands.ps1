# Update Lambda function code
aws lambda update-function-code `
  --function-name movie-ticket-email-service-email-handler-prod `
  --zip-file fileb://email_handler.zip `
  --region ap-southeast-1

# Update CloudFormation stack
aws cloudformation update-stack `
  --stack-name movie-ticket-email-service `
  --template-body file://email-service-complete.yaml `
  --parameters ParameterKey=Environment,ParameterValue=prod ParameterKey=FromEmail,ParameterValue=q2kcinema@gmail.com `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1

# Delete stack (cleanup)
aws cloudformation delete-stack --stack-name movie-ticket-email-service --region ap-southeast-1

# Monitor stack deletion
aws cloudformation describe-stacks --stack-name movie-ticket-email-service --region ap-southeast-1

# Backup Lambda function code
aws lambda get-function --function-name movie-ticket-email-service-email-handler-prod --region ap-southeast-1 --query 'Code.Location'

# List all email identities
aws ses list-identities --region ap-southeast-1

# Check sending statistics
aws ses get-account-sending-enabled --region ap-southeast-1
aws ses get-send-statistics --region ap-southeast-1