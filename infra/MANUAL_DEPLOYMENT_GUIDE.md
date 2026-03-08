# Hướng Dẫn Triển Khai Movie Ticket Sales - AWS (KHÔNG dùng CloudFormation)

## 📋 Thông Tin Dự Án

| Component | Công nghệ | Version |
|-----------|-----------|---------|
| **Backend** | Spring Boot | 3.5.6 |
| **Java** | Amazon Corretto | 21 |
| **Database** | MySQL | 8.0 |
| **Frontend** | React | 19.1.1 |
| **Storage** | AWS S3 | - |
| **Build Tool** | Maven | 3.x |

## 🏗️ Kiến Trúc Đơn Giản

```
                    Internet
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                      VPC (10.0.0.0/16)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Public Subnet (10.0.1.0/24)            │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │              EC2 Instance                   │  │  │
│  │  │  ┌─────────────┐    ┌─────────────────────┐│  │  │
│  │  │  │ Spring Boot │    │ Nginx (React Build) ││  │  │
│  │  │  │   :8080     │    │      :80/:443       ││  │  │
│  │  │  └─────────────┘    └─────────────────────┘│  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │          Private Subnet (10.0.2.0/24)             │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         RDS MySQL (db.t4g.micro)            │  │  │
│  │  │         movie_ticket_sales:3306             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   S3 Bucket     │
              │ movie-ticket-   │
              │    images       │
              └─────────────────┘
```

**KHÔNG sử dụng:**
- ❌ ALB (Application Load Balancer)
- ❌ Route 53
- ❌ ElastiCache (Redis) - *sẽ disable trong production*
- ❌ Lambda
- ❌ SES/SNS
- ❌ CloudFront

---

## 💰 Chi Phí Ước Tính

| Service | Instance | Chi phí/tháng |
|---------|----------|---------------|
| EC2 | t2.micro / t3.micro | ~$0 (Free Tier) hoặc ~$8-10 |
| RDS | db.t4g.micro (20GB) | ~$12-15 |
| S3 | 5GB storage | ~$0.12 |
| Data Transfer | ~10GB | ~$1 |
| **Tổng** | | **~$12-30/tháng** |

---

## 🚀 BƯỚC 1: Tạo VPC và Network

### 1.1 Tạo VPC
1. **AWS Console** → **VPC** → **Create VPC**
2. Cấu hình:
   - **Name tag**: `movie-ticket-vpc`
   - **IPv4 CIDR block**: `10.0.0.0/16`
   - **Tenancy**: Default
3. Click **Create VPC**

### 1.2 Tạo Internet Gateway
1. **VPC Console** → **Internet Gateways** → **Create internet gateway**
2. **Name tag**: `movie-ticket-igw`
3. Click **Create internet gateway**
4. Chọn IGW vừa tạo → **Actions** → **Attach to VPC** → Chọn `movie-ticket-vpc`

### 1.3 Tạo Public Subnet (cho EC2)
1. **VPC Console** → **Subnets** → **Create subnet**
2. Cấu hình:
   - **VPC**: `movie-ticket-vpc`
   - **Subnet name**: `public-subnet-az1`
   - **Availability Zone**: Chọn 1 AZ (ví dụ: `ap-southeast-1a`)
   - **IPv4 CIDR block**: `10.0.1.0/24`
3. Click **Create subnet**
4. **Quan trọng**: Chọn subnet → **Actions** → **Edit subnet settings** → ✅ **Enable auto-assign public IPv4 address**

### 1.4 Tạo Private Subnets (cho RDS)
> ⚠️ **Lưu ý**: AWS RDS yêu cầu ít nhất 2 subnets trong các AZ khác nhau cho DB Subnet Group

**Private Subnet 1:**
- **Subnet name**: `private-subnet-az1`
- **Availability Zone**: `ap-southeast-1a` (cùng AZ với EC2)
- **IPv4 CIDR block**: `10.0.2.0/24`

**Private Subnet 2:**
- **Subnet name**: `private-subnet-az2`
- **Availability Zone**: `ap-southeast-1b` (khác AZ)
- **IPv4 CIDR block**: `10.0.3.0/24`

### 1.5 Cấu hình Route Table cho Public Subnet
1. **VPC Console** → **Route Tables**
2. Tìm Route Table của `movie-ticket-vpc` (Main)
3. Tab **Routes** → **Edit routes** → **Add route**:
   - **Destination**: `0.0.0.0/0`
   - **Target**: Internet Gateway → `movie-ticket-igw`
4. Click **Save changes**
5. Tab **Subnet associations** → **Edit subnet associations** → Chọn `public-subnet-az1`

---

## 🔒 BƯỚC 2: Tạo Security Groups

### 2.1 Security Group cho EC2
1. **VPC Console** → **Security Groups** → **Create security group**
2. Cấu hình:
   - **Security group name**: `movie-ticket-ec2-sg`
   - **Description**: Security group for Movie Ticket EC2
   - **VPC**: `movie-ticket-vpc`

3. **Inbound rules** - Click **Add rule** cho mỗi rule:

| Type | Protocol | Port | Source | Mô tả |
|------|----------|------|--------|-------|
| SSH | TCP | 22 | My IP | SSH access từ IP của bạn |
| HTTP | TCP | 80 | 0.0.0.0/0 | Nginx/Frontend |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Nginx HTTPS |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Spring Boot API |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | React Dev Server (optional) |

4. **Outbound rules**: Giữ mặc định (All traffic)

### 2.2 Security Group cho RDS
1. **Create security group**:
   - **Name**: `movie-ticket-rds-sg`
   - **Description**: Security group for Movie Ticket RDS MySQL
   - **VPC**: `movie-ticket-vpc`

2. **Inbound rules**:

| Type | Protocol | Port | Source | Mô tả |
|------|----------|------|--------|-------|
| MySQL/Aurora | TCP | 3306 | movie-ticket-ec2-sg | Chỉ EC2 được kết nối |

> 🔐 **Bảo mật**: RDS chỉ cho phép traffic từ EC2 Security Group, không expose ra internet

---

## 🗄️ BƯỚC 3: Tạo RDS MySQL Database

### 3.1 Tạo DB Subnet Group
1. **RDS Console** → **Subnet groups** → **Create DB subnet group**
2. Cấu hình:
   - **Name**: `movie-ticket-db-subnet-group`
   - **Description**: Subnet group for Movie Ticket RDS
   - **VPC**: `movie-ticket-vpc`
3. **Add subnets**:
   - Availability Zones: Chọn cả 2 AZ
   - Subnets: Chọn `private-subnet-az1` và `private-subnet-az2`
4. Click **Create**

### 3.2 Tạo RDS Instance
1. **RDS Console** → **Databases** → **Create database**

2. **Engine options**:
   - **Engine type**: MySQL
   - **Version**: MySQL 8.0.x (chọn version mới nhất)

3. **Templates**: 
   - Chọn **Free tier** (nếu eligible) hoặc **Dev/Test**

4. **Settings**:
   - **DB instance identifier**: `movie-ticket-db`
   - **Master username**: `admin`
   - **Master password**: `YourSecurePassword123!` (ghi nhớ lại!)

5. **Instance configuration**:
   - **DB instance class**: `db.t4g.micro` (Burstable classes)

6. **Storage**:
   - **Storage type**: General Purpose SSD (gp2)
   - **Allocated storage**: `20` GB
   - ❌ Disable **Storage autoscaling** (để tiết kiệm)

7. **Connectivity**:
   - **VPC**: `movie-ticket-vpc`
   - **DB subnet group**: `movie-ticket-db-subnet-group`
   - **Public access**: **No** ⚠️ Quan trọng!
   - **VPC security group**: Chọn existing → `movie-ticket-rds-sg`
   - **Availability Zone**: `ap-southeast-1a` (cùng AZ với EC2)

8. **Database authentication**: Password authentication

9. **Additional configuration**:
   - **Initial database name**: `movie_ticket_sales`
   - ❌ Disable **Automated backups** (để tiết kiệm, enable lại cho production)
   - ❌ Disable **Performance Insights**
   - ❌ Disable **Enhanced monitoring**
   - ❌ Disable **Deletion protection** (cho testing)

10. Click **Create database** (mất 5-10 phút)

### 3.3 Lấy Endpoint RDS
Sau khi RDS khởi tạo xong:
1. Click vào database `movie-ticket-db`
2. Tab **Connectivity & security**
3. Copy **Endpoint**: `movie-ticket-db.xxxxxxxxxxxx.ap-southeast-1.rds.amazonaws.com`

---

## 💻 BƯỚC 4: Launch EC2 Instance

### 4.1 Tạo EC2 Instance
1. **EC2 Console** → **Instances** → **Launch instances**

2. **Name**: `movie-ticket-server`

3. **Application and OS Images (AMI)**:
   - **Quick Start**: Amazon Linux
   - **AMI**: Amazon Linux 2023 AMI (64-bit x86)

4. **Instance type**: 
   - `t2.micro` (Free tier) hoặc `t3.micro` (tốt hơn)

5. **Key pair**:
   - Click **Create new key pair**
   - **Name**: `movie-ticket-key`
   - **Key pair type**: RSA
   - **Private key format**: .pem
   - Click **Create key pair** (file sẽ tự download)
   - ⚠️ **Lưu file này cẩn thận!**

6. **Network settings** - Click **Edit**:
   - **VPC**: `movie-ticket-vpc`
   - **Subnet**: `public-subnet-az1`
   - **Auto-assign public IP**: Enable
   - **Firewall**: Select existing security group → `movie-ticket-ec2-sg`

7. **Configure storage**:
   - **Size**: `20` GiB
   - **Type**: gp3

8. Click **Launch instance**

### 4.2 SSH vào EC2
```powershell
# Windows PowerShell - Di chuyển đến thư mục chứa key
cd C:\Users\YourName\Downloads

# SSH vào EC2
ssh -i "movie-ticket-key.pem" ec2-user@<EC2-PUBLIC-IP>
```

Hoặc dùng **EC2 Instance Connect** từ AWS Console.

---

## 📦 BƯỚC 5: Cài đặt môi trường trên EC2

### 5.1 Cập nhật hệ thống
```bash
sudo yum update -y
```

### 5.2 Cài đặt Java 21 (Amazon Corretto)
```bash
# Cài đặt Java 21
sudo yum install java-21-amazon-corretto-devel -y

# Kiểm tra
java -version
# Kết quả: openjdk version "21.x.x"
```

### 5.3 Cài đặt MySQL Client
```bash
sudo yum install mariadb105 -y
```

### 5.4 Test kết nối RDS
```bash
mysql -h movie-ticket-db1.cx82iycucox6.ap-southeast-1.rds.amazonaws.com-u admin -p
# Nhập password đã tạo

# Trong MySQL prompt:
SHOW DATABASES;
USE movie_ticket_sales;
# Ctrl+D để thoát
```

### 5.5 Import Database Schema
```bash
# Tạo thư mục project
mkdir -p /home/ec2-user/movie-ticket
cd /home/ec2-user/movie-ticket

# Upload file database.sql từ máy local (chạy trên Windows)
# scp -i "movie-ticket-key.pem" docs/database.sql ec2-user@<EC2-IP>:/home/ec2-user/movie-ticket/

# Import schema
mysql -h movie-ticket-db.xxxxxxxxxxxx.ap-southeast-1.rds.amazonaws.com \
      -u admin -p movie_ticket_sales < database.sql
```

### 5.6 Cài đặt Node.js (cho Frontend build)
```bash
# Cài đặt Node.js 18 LTS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# Kiểm tra
node -v
npm -v
```

### 5.7 Cài đặt Nginx
```bash
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.8 Cài đặt Git
```bash
sudo yum install git -y
```

---

## 🔧 BƯỚC 6: Deploy Backend (Spring Boot)

### 6.1 Clone source code
```bash
cd /home/ec2-user
git clone https://github.com/Hikari2004-dev/Movie-Ticket-Sales-Web-Project.git
cd Movie-Ticket-Sales-Web-Project
```

### 6.2 Tạo file cấu hình Production
```bash
cd BE/Movie\ Ticket\ Sales\ Web\ Project/src/main/resources/

# Backup file gốc
cp application-prod.properties application-prod.properties.bak

# Chỉnh sửa file production
nano application-prod.properties
```

**Nội dung `application-prod.properties`:**
```properties
# ========================================
# PRODUCTION CONFIGURATION
# Movie Ticket Sales Web Project
# ========================================

# Database Configuration - RDS MySQL
spring.datasource.url=jdbc:mysql://movie-ticket-db.xxxxxxxxxxxx.ap-southeast-1.rds.amazonaws.com:3306/movie_ticket_sales?useSSL=true&requireSSL=true&serverTimezone=Asia/Ho_Chi_Minh&useUnicode=true&characterEncoding=utf8
spring.datasource.username=admin
spring.datasource.password=YourSecurePassword123!

# JPA Configuration
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate

# Server Configuration
server.port=8080
server.address=0.0.0.0

# Disable Redis (không dùng ElastiCache)
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration

# JWT Configuration (thay đổi secret cho production!)
app.jwt.secret=YourProductionSecretKeyMustBeAtLeast32CharactersLongAndSecure!
app.jwt.expiration=3600000
app.jwt.refresh-expiration=86400000

# AWS S3 Configuration (giữ nguyên hoặc tạo mới)
aws.s3.access-key=YOUR_S3_ACCESS_KEY
aws.s3.secret-key=YOUR_S3_SECRET_KEY
aws.s3.bucket-name=movie-ticket-image
aws.s3.region=ap-southeast-1

# File upload
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.root=INFO
logging.level.aws.movie_ticket_sales_web_project=INFO

# CORS - cho phép frontend domain
# Thêm vào nếu cần
```

### 6.3 Build ứng dụng
```bash
cd /home/ec2-user/Movie-Ticket-Sales-Web-Project/BE/Movie\ Ticket\ Sales\ Web\ Project/

# Cấp quyền cho Maven wrapper
chmod +x mvnw

# Build (bỏ qua tests để nhanh hơn)
./mvnw clean package -DskipTests -Pprod

# File JAR sẽ ở: target/Movie_Ticket_Sales_Web_Project-0.0.1-SNAPSHOT.jar
```

### 6.4 Tạo Systemd Service
```bash
sudo nano /etc/systemd/system/movie-ticket-api.service
```

**Nội dung:**
```ini
[Unit]
Description=Movie Ticket Sales API - Spring Boot Application
After=network.target

[Service]
User=ec2-user
Type=simple
WorkingDirectory=/home/ec2-user/Movie-Ticket-Sales-Web-Project/BE/Movie Ticket Sales Web Project

ExecStart=/usr/bin/java -jar \
    -Dspring.profiles.active=prod \
    -Xms256m -Xmx512m \
    /home/ec2-user/Movie-Ticket-Sales-Web-Project/BE/Movie\ Ticket\ Sales\ Web\ Project/target/Movie_Ticket_Sales_Web_Project-0.0.1-SNAPSHOT.jar

SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

# Environment variables (optional - thay cho properties file)
# Environment="SPRING_DATASOURCE_URL=jdbc:mysql://..."
# Environment="SPRING_DATASOURCE_USERNAME=admin"
# Environment="SPRING_DATASOURCE_PASSWORD=xxx"

[Install]
WantedBy=multi-user.target
```

### 6.5 Start Backend Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (tự khởi động khi reboot)
sudo systemctl enable movie-ticket-api

# Start service
sudo systemctl start movie-ticket-api

# Kiểm tra status
sudo systemctl status movie-ticket-api

# Xem logs
sudo journalctl -u movie-ticket-api -f
```

sudo systemctl restart movie-ticket-api


### 6.6 Test Backend API
```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Từ bên ngoài (thay <EC2-IP>)
curl http://<EC2-PUBLIC-IP>:8080/api/health
```

---

## 🎨 BƯỚC 7: Deploy Frontend (React)

### 7.1 Cấu hình Environment

> ⚠️ **QUAN TRỌNG**: Phải thay `<EC2-PUBLIC-IP>` bằng IP thực của EC2 instance!
> Nếu không, frontend sẽ gọi `localhost` và gây lỗi CORS.

```bash
cd /home/ec2-user/Movie-Ticket-Sales-Web-Project/FE/my-app

# Xóa file .env cũ nếu có
rm -f .env .env.production

# Tạo file .env.production MỚI
nano .env.production
```

**Nội dung `.env.production`** (thay `13.250.62.179` bằng IP EC2 của bạn):
```env
# ⚠️ THAY IP THỰC CỦA EC2 VÀO ĐÂY!
# Dùng port 80 vì Nginx đã proxy /api đến localhost:8080
REACT_APP_API_URL=http://13.250.62.179/api

# App name
REACT_APP_NAME=Movie Ticket Sales

# Disable source maps
GENERATE_SOURCEMAP=false
```

> 💡 **Lưu ý**: 
> - Dùng `http://IP/api` (port 80) thay vì `http://IP:8080/api` vì Nginx đã cấu hình proxy
> - KHÔNG dùng `localhost` - phải dùng IP public của EC2

### 7.2 Build React App
```bash
# Install dependencies
npm install

# Build production - React sẽ đọc từ .env.production
npm run build

# Kiểm tra API URL đã được inject đúng chưa
grep -r "REACT_APP_API_URL" build/static/js/*.js | head -1
# Nếu thấy localhost -> sai, cần xóa build và làm lại

# Folder build/ sẽ chứa static files
```

### 7.3 Cấu hình Nginx
```bash
sudo nano /etc/nginx/conf.d/movie-ticket.conf
```

**Nội dung:**
```nginx
server {
    listen 80;
    server_name _;  # Hoặc domain của bạn

    # Frontend - React SPA
    location / {
        root /home/ec2-user/Movie-Ticket-Sales-Web-Project/FE/my-app/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Static uploads
    location /uploads {
        alias /home/ec2-user/Movie-Ticket-Sales-Web-Project/uploads;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

### 7.4 Cấp quyền và restart Nginx
```bash
# Cấp quyền cho nginx user đọc files
sudo chmod -R 755 /home/ec2-user
sudo chown -R ec2-user:ec2-user /home/ec2-user/Movie-Ticket-Sales-Web-Project

# Test cấu hình nginx
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 7.5 Cập nhật Frontend API URL (sau khi có IP)
```bash
cd /home/ec2-user/Movie-Ticket-Sales-Web-Project/FE/my-app

# Cập nhật .env.production với IP thực
nano .env.production

# Rebuild
npm run build
```

---

## ☁️ BƯỚC 8: Setup S3 cho Image Uploads

### 8.1 Tạo S3 Bucket (nếu chưa có)
1. **S3 Console** → **Create bucket**
2. Cấu hình:
   - **Bucket name**: `movie-ticket-image` (phải unique globally)
   - **Region**: `ap-southeast-1` (Singapore)
   - ❌ **Block all public access**: Uncheck (để cho phép public read)
     - ✅ Acknowledge warning

3. Click **Create bucket**

### 8.2 Cấu hình Bucket Policy (Public Read)
1. Click vào bucket → **Permissions** tab
2. **Bucket policy** → **Edit**
3. Paste policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::movie-ticket-image/*"
        }
    ]
}
```

### 8.3 Tạo IAM User cho S3 Access (Optional - nếu tạo mới)
1. **IAM Console** → **Users** → **Create user**
2. **User name**: `movie-ticket-s3-user`
3. **Permissions**: Attach `AmazonS3FullAccess` (hoặc policy hẹp hơn)
4. **Create access key**: Application running outside AWS
5. Copy **Access Key ID** và **Secret Access Key**

### 8.4 Cập nhật S3 credentials trong application
```bash
# Cập nhật application-prod.properties
nano /home/ec2-user/Movie-Ticket-Sales-Web-Project/BE/Movie\ Ticket\ Sales\ Web\ Project/src/main/resources/application-prod.properties

# Sửa các dòng:
# aws.s3.access-key=YOUR_NEW_ACCESS_KEY
# aws.s3.secret-key=YOUR_NEW_SECRET_KEY
# aws.s3.bucket-name=movie-ticket-image
# aws.s3.region=ap-southeast-1

# Rebuild và restart
cd /home/ec2-user/Movie-Ticket-Sales-Web-Project/BE/Movie\ Ticket\ Sales\ Web\ Project/
./mvnw clean package -DskipTests
sudo systemctl restart movie-ticket-api
```

---

## ✅ BƯỚC 9: Kiểm Tra Hoàn Tất

### 9.1 Checklist
- [ ] VPC và Subnets đã tạo
- [ ] Internet Gateway đã attach
- [ ] Route Table đã cấu hình
- [ ] Security Groups đã tạo đúng rules
- [ ] RDS MySQL đang chạy
- [ ] EC2 instance đang chạy
- [ ] Java 21 đã cài
- [ ] Spring Boot service đang chạy
- [ ] Nginx đang serve React app
- [ ] S3 bucket có thể upload/download

### 9.2 Test Endpoints
```bash
# Backend Health Check
curl http://<EC2-PUBLIC-IP>/api/healthc

# Frontend
# Mở browser: http://<EC2-PUBLIC-IP>

# Test đăng nhập API
curl -X POST http://<EC2-PUBLIC-IP>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 9.3 Xem Logs
```bash
# Backend logs
sudo journalctl -u movie-ticket-api -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 Troubleshooting

### ❌ Lỗi CORS / Frontend gọi localhost thay vì IP EC2

**Triệu chứng:**
```
Error: Failed to parse URL from http://<EC2-PUBLIC-IP>:8080/api/...
CORS policy: The request client is not a secure context
GET http://localhost:8080/api/... net::ERR_FAILED
```

**Nguyên nhân**: File `.env.production` chưa được cấu hình đúng hoặc chưa rebuild sau khi sửa.

**Cách sửa:**
```bash
# 1. SSH vào EC2
ssh -i "movie-ticket-key.pem" ec2-user@<EC2-IP>

# 2. Kiểm tra file .env hiện tại
cd /home/ec2-user/Movie-Ticket-Sales-Web-Project/FE/my-app
cat .env.production

# 3. Nếu thấy localhost hoặc <EC2-PUBLIC-IP> -> CẦN SỬA!
rm -f .env .env.production
nano .env.production

# Nội dung (thay IP thực):
# REACT_APP_API_URL=http://13.250.62.179/api
# REACT_APP_NAME=Movie Ticket Sales
# GENERATE_SOURCEMAP=false

# 4. Xóa build cũ và rebuild
rm -rf build node_modules/.cache
npm run build

# 5. Restart nginx
sudo systemctl restart nginx

# 6. Clear browser cache hoặc mở Incognito mode
```

### EC2 không kết nối được RDS
```bash
# Kiểm tra Security Group
# - RDS SG phải cho phép port 3306 từ EC2 SG

# Test connection từ EC2
mysql -h <RDS-ENDPOINT> -u admin -p

# Nếu timeout: Kiểm tra RDS có public access = No và SG đúng
```

### Spring Boot không start
```bash
# Xem chi tiết lỗi
sudo journalctl -u movie-ticket-api --no-pager -n 100

# Kiểm tra port đang dùng
sudo netstat -tlnp | grep 8080

# Test chạy thủ công
cd /home/ec2-user/Movie-Ticket-Sales-Web-Project/BE/Movie\ Ticket\ Sales\ Web\ Project/
java -jar -Dspring.profiles.active=prod target/Movie_Ticket_Sales_Web_Project-0.0.1-SNAPSHOT.jar
```

### Frontend không load được API
```bash
# Kiểm tra CORS trong Spring Boot
# Kiểm tra Nginx proxy config
# Kiểm tra REACT_APP_API_URL trong .env.production

# Test API trực tiếp
curl http://localhost:8080/api/health
```

### Không upload được file lên S3
```bash
# Kiểm tra AWS credentials
# Kiểm tra bucket policy
# Kiểm tra IAM user permissions

# Test với AWS CLI
aws s3 ls s3://movie-ticket-image/
```

---

## 📚 Lệnh Hữu Ích

```bash
# Restart tất cả services
sudo systemctl restart movie-ticket-api nginx

# Check tất cả services
sudo systemctl status movie-ticket-api nginx

# Xem resource usage
htop  # Cài: sudo yum install htop -y

# Disk usage
df -h

# Memory
free -m

# Update source code
cd /home/ec2-user/Movie-Ticket-Sales-Web-Project
git pull origin main

# Rebuild Backend
cd BE/Movie\ Ticket\ Sales\ Web\ Project/
./mvnw clean package -DskipTests
sudo systemctl restart movie-ticket-api

# Rebuild Frontend
cd ../../FE/my-app
npm install
npm run build
sudo systemctl restart nginx
```

---

## 🔒 Bảo Mật Production (Khuyến nghị)

1. **Thay đổi SSH port**: Sửa `/etc/ssh/sshd_config`
2. **Enable HTTPS**: Cài SSL certificate với Let's Encrypt
3. **Secure Environment Variables**: Dùng AWS Secrets Manager hoặc Parameter Store
4. **Enable RDS Backups**: Trong RDS settings
5. **Setup CloudWatch Alarms**: Monitoring CPU, Memory
6. **Restrict SSH access**: Chỉ cho phép IP cụ thể trong Security Group
