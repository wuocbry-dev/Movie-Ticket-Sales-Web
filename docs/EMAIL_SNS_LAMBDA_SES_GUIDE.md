# Email Service Architecture: SNS → Lambda → SES

## Tổng quan

Kiến trúc email mới thay thế JavaMailSender bằng AWS managed services:

```
┌─────────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Spring Boot   │─────▶│  Amazon SNS │─────▶│ AWS Lambda  │─────▶│  Amazon SES │
│   (Backend)     │      │   (Topic)   │      │  (Handler)  │      │   (Email)   │
└─────────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

## Lợi ích

| Aspect | JavaMail (cũ) | SNS→Lambda→SES (mới) |
|--------|---------------|----------------------|
| **Scaling** | Phụ thuộc app server | Auto-scaling với Lambda |
| **Reliability** | Single point of failure | Highly available, retry built-in |
| **Cost** | SMTP server costs | Pay-per-use |
| **Monitoring** | Manual logging | CloudWatch integration |
| **Async** | Thread-based | Event-driven |
| **Maintenance** | Manage SMTP credentials | AWS managed |

## Các thành phần

### 1. Backend Java (`EmailService.java`)

Thay vì gửi email trực tiếp qua SMTP, service publish message lên SNS Topic:

```java
@Service
public class EmailService {
    private SnsClient snsClient;
    
    @Value("${aws.sns.email-topic-arn}")
    private String emailTopicArn;
    
    public void sendBookingConfirmation(Booking booking) {
        EmailRequest request = EmailRequest.builder()
            .emailType(EmailType.BOOKING_CONFIRMATION)
            .toEmail(booking.getCustomerEmail())
            .templateData(templateData)
            .build();
        
        publishToSns(request);
    }
}
```

### 2. Lambda Function (`email_handler.py`)

Python Lambda xử lý SNS messages và gửi email qua SES:

- Nhận message từ SNS
- Parse email request JSON
- Build HTML template based on email type
- Gửi email qua SES API

### 3. CloudFormation Template (`email-service.yaml`)

Tạo toàn bộ infrastructure:
- SNS Topic
- Lambda Function
- IAM Roles/Policies
- CloudWatch Logs
- Monitoring Alarms

## Hướng dẫn Deploy

### Bước 1: Verify SES Email/Domain

```bash
# Verify email address (for sandbox)
aws ses verify-email-identity --email-address noreply@movieticket.com

# Or verify domain (for production)
aws ses verify-domain-identity --domain q2k.click
```

### Bước 2: Deploy CloudFormation Stack

```bash
cd infra/cloudformation

# Deploy email service stack
aws cloudformation deploy \
    --template-file email-service.yaml \
    --stack-name movie-ticket-email-service \
    --parameter-overrides \
        Environment=prod \
        FromEmail=noreply@movieticket.com \
    --capabilities CAPABILITY_NAMED_IAM

# Get outputs
aws cloudformation describe-stacks \
    --stack-name movie-ticket-email-service \
    --query 'Stacks[0].Outputs'
```

### Bước 3: Cấu hình Backend

Thêm vào `application.properties`:

```properties
# AWS SNS Email Configuration
aws.sns.email-topic-arn=arn:aws:sns:ap-southeast-1:123456789:movie-ticket-email-topic-prod
aws.region=ap-southeast-1
email.service.enabled=true

# Remove old mail configuration (optional - keep for fallback)
# spring.mail.host=...
# spring.mail.port=...
```

Hoặc sử dụng environment variables:

```bash
export AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:123456789:movie-ticket-email-topic-prod
export AWS_REGION=ap-southeast-1
export EMAIL_SERVICE_ENABLED=true
```

### Bước 4: Deploy Lambda Code (Full Version)

Nếu muốn deploy Lambda code đầy đủ từ S3:

```bash
# Create deployment package
cd infra/lambda
zip email_handler.zip email_handler.py

# Upload to S3
aws s3 cp email_handler.zip s3://your-deployment-bucket/lambda/email_handler.zip

# Update stack with S3 code
aws cloudformation update-stack `
    --stack-name movie-ticket-email-service `
    --template-body file://email-service.yaml `
    --parameters `
        ParameterKey=LambdaCodeS3Bucket,ParameterValue=your-deployment-bucket \
        ParameterKey=LambdaCodeS3Key,ParameterValue=lambda/email_handler.zip \
    --capabilities CAPABILITY_NAMED_IAM
```

## Testing

### Test SNS → Lambda → SES Flow

```bash
# Publish test message to SNS
aws sns publish \
    --topic-arn arn:aws:sns:ap-southeast-1:024958414130:movie-ticket-email-service-email-topic-prod \
    --message '{
        "emailType": "PASSWORD_RESET",
        "toEmail": "khanhkhoi08@gmail.com",
        "subject": "Test Email",
        "templateData": {
            "fullName": "Test User",
            "resetCode": "123456"
        }
    }'
```

### Check Lambda Logs

```bash
aws logs tail /aws/lambda/movie-ticket-email-handler-prod --follow
```

## Cấu trúc Files

```
infra/
├── cloudformation/
│   ├── minimal.yaml              # Main infrastructure
│   ├── email-service.yaml        # Email service (SNS+Lambda+SES)
│   └── README.md
└── lambda/
    └── email_handler.py          # Lambda function code

BE/Movie Ticket Sales Web Project/src/main/java/aws/movie_ticket_sales_web_project/
├── dto/
│   └── EmailRequest.java         # DTO for SNS messages
└── service/
    ├── EmailService.java         # New SNS-based service
    └── EmailService_JavaMail_Backup.java  # Old SMTP-based (backup)
```

## SES Production Access

Mặc định SES ở chế độ Sandbox, chỉ gửi được tới verified emails. Để gửi tới mọi địa chỉ:

1. Vào AWS Console → SES → Account Dashboard
2. Request Production Access
3. Chờ AWS approve (thường 24h)

## Monitoring & Troubleshooting

### CloudWatch Metrics

- **Lambda Invocations**: Số lần Lambda được gọi
- **Lambda Errors**: Số lỗi xảy ra
- **Lambda Duration**: Thời gian xử lý
- **SES Bounces/Complaints**: Email bị từ chối

### Common Issues

| Issue | Solution |
|-------|----------|
| Email not verified | Verify email/domain trong SES |
| Lambda timeout | Tăng timeout trong CFN template |
| Permission denied | Kiểm tra IAM policy cho SES |
| SNS not receiving | Kiểm tra SNS topic ARN config |

## Rollback to JavaMail

Nếu cần rollback về JavaMail:

1. Đổi tên files:
```bash
mv EmailService.java EmailService_SNS.java
mv EmailService_JavaMail_Backup.java EmailService.java
```

2. Cập nhật `application.properties`:
```properties
email.service.enabled=false
spring.mail.host=smtp.gmail.com
spring.mail.port=587
...
```

3. Rebuild và deploy backend.
