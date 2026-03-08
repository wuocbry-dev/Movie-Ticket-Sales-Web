# Hướng dẫn Upload Ảnh Phim lên AWS S3

## Cấu hình AWS S3

### 1. Tạo S3 Bucket

```bash
# Đăng nhập AWS Console
# Tạo bucket mới: movie-ticket-sales
# Region: ap-southeast-1 (Singapore) hoặc region gần nhất
# Bỏ chặn Public Access cho bucket
# Thêm Bucket Policy:
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::movie-ticket-sales/*"
        }
    ]
}
```

### 2. Tạo IAM User cho Application

```bash
# Tạo IAM User: movie-ticket-sales-app
# Attach policy: AmazonS3FullAccess hoặc custom policy:
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::movie-ticket-sales",
                "arn:aws:s3:::movie-ticket-sales/*"
            ]
        }
    ]
}
```

### 3. Lấy Access Key và Secret Key

- Vào IAM User → Security credentials
- Tạo Access Key mới
- Lưu Access Key ID và Secret Access Key

### 4. Cấu hình Application

Thêm vào file `.env` hoặc environment variables:

```properties
AWS_ACCESS_KEY=AKIA...
AWS_SECRET_KEY=wJalr...
AWS_S3_BUCKET=movie-ticket-sales
AWS_REGION=ap-southeast-1
```

Hoặc sửa trực tiếp trong `application.properties`:

```properties
aws.s3.access-key=AKIA...
aws.s3.secret-key=wJalr...
aws.s3.bucket-name=movie-ticket-sales
aws.s3.region=ap-southeast-1
```

## Sử dụng Upload API

### Backend Endpoints

#### 1. Upload Poster
```http
POST /api/upload/poster
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data

file: [image file]
```

Response:
```json
{
    "success": true,
    "message": "Poster uploaded successfully",
    "data": {
        "url": "https://movie-ticket-sales.s3.ap-southeast-1.amazonaws.com/movies/posters/uuid.jpg"
    }
}
```

#### 2. Upload Backdrop
```http
POST /api/upload/backdrop
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data

file: [image file]
```

### Frontend Integration

Thêm vào `movieService.js`:

```javascript
// Upload poster
uploadPoster: async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/poster', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},

// Upload backdrop
uploadBackdrop: async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/backdrop', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},
```

Trong MovieForm component:

```javascript
const handlePosterUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    setUploading(true);
    const response = await movieService.uploadPoster(file);
    
    if (response.success) {
      setFormData({
        ...formData,
        posterUrl: response.data.url
      });
      toast.success('Upload poster thành công!');
    }
  } catch (error) {
    toast.error('Lỗi upload poster!');
  } finally {
    setUploading(false);
  }
};
```

JSX:

```jsx
<div className="form-group">
  <label>Poster</label>
  <input
    type="file"
    accept="image/*"
    onChange={handlePosterUpload}
    disabled={uploading}
  />
  {formData.posterUrl && (
    <img src={formData.posterUrl} alt="Preview" className="preview" />
  )}
</div>
```

## Cấu trúc Thư mục trên S3

```
movie-ticket-sales/
├── movies/
│   ├── posters/
│   │   ├── uuid-1.jpg
│   │   ├── uuid-2.jpg
│   │   └── ...
│   └── backdrops/
│       ├── uuid-1.jpg
│       ├── uuid-2.jpg
│       └── ...
```

## Giới hạn Upload

- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/jpg, image/gif
- Chỉ SYSTEM_ADMIN mới có quyền upload

## Troubleshooting

### Lỗi 403 Forbidden
- Kiểm tra Access Key và Secret Key
- Kiểm tra IAM User có đủ quyền
- Kiểm tra Bucket Policy

### Lỗi File quá lớn
- Tăng `spring.servlet.multipart.max-file-size` trong application.properties
- Hoặc resize image trước khi upload

### Ảnh upload lên nhưng không hiển thị
- Kiểm tra Bucket Policy cho phép public read
- Kiểm tra CORS configuration trên S3 bucket
