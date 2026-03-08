# Test SNS Topic
$testMessage = @{
    emailType = "PASSWORD_RESET"
    toEmail = "khanhkhoi08@gmail.com"
    subject = "Test Email"
    templateData = @{
        fullName = "Test User"
        resetCode = "123456"
    }
} | ConvertTo-Json -Depth 3

Set-Content -Path "test_message.json" -Value $testMessage -NoNewline

# Gửi test message
aws sns publish `
  --topic-arn arn:aws:sns:ap-southeast-1:024958414130:movie-ticket-email-service-email-topic-prod `
  --message file://test_message.json `
  --region ap-southeast-1

# Kiểm tra Lambda logs
aws logs describe-log-streams `
  --log-group-name /aws/lambda/movie-ticket-email-service-email-handler-prod `
  --order-by LastEventTime `
  --descending --limit 1 `
  --region ap-southeast-1

# Xem log chi tiết (thay LOG_STREAM_NAME)
aws logs get-log-events `
  --log-group-name /aws/lambda/movie-ticket-email-service-email-handler-prod `
  --log-stream-name "LOG_STREAM_NAME" `
  --region ap-southeast-1