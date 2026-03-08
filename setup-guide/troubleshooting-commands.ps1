# Kiểm tra SES verification status
aws ses get-identity-verification-attributes --identities q2k.click q2kcinema@gmail.com --region ap-southeast-1

# Kiểm tra SNS Topic
aws sns get-topic-attributes --topic-arn arn:aws:sns:ap-southeast-1:024958414130:movie-ticket-email-service-email-topic-prod --region ap-southeast-1

# Kiểm tra Lambda function
aws lambda get-function --function-name movie-ticket-email-service-email-handler-prod --region ap-southeast-1

# Kiểm tra CloudFormation stack
aws cloudformation describe-stacks --stack-name movie-ticket-email-service --region ap-southeast-1

# Xem SES sending limits
aws ses describe-account-sending-enabled --region ap-southeast-1
aws ses get-send-quota --region ap-southeast-1

# Update Lambda environment variables
aws lambda update-function-configuration `
  --function-name movie-ticket-email-service-email-handler-prod `
  --environment Variables='{FROM_EMAIL=q2kcinema@gmail.com,ENVIRONMENT=prod}' `
  --region ap-southeast-1