# Hướng dẫn CI/CD - Deploy tự động bằng Docker

## Tổng quan

Pipeline CI/CD dùng **GitHub Actions** để:
1. Build Docker image cho Backend (Spring Boot) và Frontend (React)
2. Push image lên **GitHub Container Registry (ghcr.io)**
3. Deploy lên server qua SSH: pull image và chạy `docker compose up`

## Cấu trúc

- **`.github/workflows/deploy.yml`**: Workflow build + push + deploy
- **`BE/.../Dockerfile`**: Multi-stage build Backend (Maven → JRE)
- **`FE/my-app/Dockerfile`**: Multi-stage build Frontend (Node build → Nginx)
- **`docker-compose.yml`**: Chạy local / build từ source
- **`docker-compose.deploy.yml`**: Chạy trên server, dùng image từ GHCR

## Cấu hình GitHub Secrets

Vào **Settings → Secrets and variables → Actions**, thêm:

| Secret | Bắt buộc | Mô tả |
|--------|----------|--------|
| `DEPLOY_HOST` | Có | IP hoặc hostname server (vd: `123.45.67.89`) |
| `DEPLOY_USER` | Có | User SSH (vd: `root`, `ubuntu`) |
| `DEPLOY_SSH_KEY` | Có | Private key SSH (nội dung file, không dùng passphrase) |
| `DEPLOY_PATH` | Có | Thư mục trên server chứa compose (vd: `/opt/movie-ticket`) |
| `DEPLOY_PORT` | Không | Port SSH, mặc định 22 |
| `GHCR_PAT` | Khuyến nghị | GitHub PAT với quyền `read:packages` để server pull image từ GHCR (nếu repo/package private) |

### Tạo SSH key và cấu hình server

```bash
# Trên máy local: tạo key (không passphrase)
ssh-keygen -t ed25519 -C "github-actions" -f deploy_key -N ""

# Copy public key lên server
ssh-copy-id -i deploy_key.pub user@server

# Nội dung deploy_key (private) → paste vào secret DEPLOY_SSH_KEY
```

### Trên server

1. Cài Docker và Docker Compose (v2):
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

2. Tạo thư mục deploy và file `.env`:
   ```bash
   sudo mkdir -p /opt/movie-ticket
   sudo chown $USER:$USER /opt/movie-ticket
   cd /opt/movie-ticket
   ```

3. Tạo file `.env` (không commit vào git) với nội dung ví dụ:
   ```env
   BACKEND_IMAGE=ghcr.io/YOUR_GITHUB_USER/movie-ticket-backend:latest
   FRONTEND_IMAGE=ghcr.io/YOUR_GITHUB_USER/movie-ticket-frontend:latest

   SPRING_DATASOURCE_URL=jdbc:mysql://IP_MYSQL:3306/movie_ticket_sales?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&useUnicode=true&characterEncoding=utf8
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=your_db_password

   SPRING_REDIS_HOST=redis
   SPRING_REDIS_PORT=6379
   SPRING_REDIS_PASSWORD=

   APP_JWT_SECRET=mySecretKeyForJWTTokenGenerationAndValidationMustBeAtLeast32CharsLong

   # Tùy chọn: AWS S3, Mail, Gemini (nếu dùng)
   AWS_S3_ACCESS_KEY=
   AWS_S3_SECRET_KEY=
   AWS_S3_BUCKET_NAME=
   AWS_S3_REGION=
   SPRING_MAIL_USERNAME=
   SPRING_MAIL_PASSWORD=
   GEMINI_API_KEY=
   ```

   **Lưu ý:** Thay `YOUR_GITHUB_USER` bằng tên user/org GitHub của bạn (lowercase). Workflow sẽ set `BACKEND_IMAGE` và `FRONTEND_IMAGE` khi chạy; nếu bạn đặt sẵn trong `.env` trên server thì có thể dùng giá trị đó.

4. Cho phép workflow copy `docker-compose.deploy.yml` vào đúng thư mục (workflow dùng SCP với `target: DEPLOY_PATH`). File `.env` bạn tạo thủ công trên server.

## Cách chạy

- **Push lên branch `main` hoặc `master`**: workflow chạy build → push image → deploy.
- **Chạy tay**: Tab **Actions** → chọn workflow **CI/CD - Build and Deploy** → **Run workflow**.

## Chạy local bằng Docker

```bash
# Từ thư mục gốc repo
cd "d:\git\Movie-Ticket-Sales-Web-Project"

# Tạo .env (copy từ docs trên, điền DB/Redis thật)
cp docs/env.example .env   # nếu có, hoặc tạo .env thủ công

# Build và chạy (backend + frontend + redis)
docker compose up -d --build

# Frontend: http://localhost
# Backend API: http://localhost:8080
```

## Image trên GHCR

- Backend: `ghcr.io/<owner>/movie-ticket-backend:latest` (và tag theo commit SHA)
- Frontend: `ghcr.io/<owner>/movie-ticket-frontend:latest` (và tag theo commit SHA)

Nếu repo private, cần thêm secret `GHCR_PAT` và trên server đăng nhập GHCR (workflow đã có bước login khi có `GHCR_PAT`).

---

## Server không có public IP (dùng Cloudflare Tunnel)

Khi server **chỉ ra internet qua Cloudflare Tunnel** (không có IP public), GitHub Actions (chạy trên internet) **không thể SSH/SCP** tới IP nội bộ (vd `192.168.1.120`) → lỗi **dial tcp ... i/o timeout**.

Có **2 cách**:

### Cách 1: Self-Hosted Runner (khuyến nghị – không cần mở SSH ra internet)

Deploy job chạy **ngay trên server** (hoặc máy trong cùng mạng), không dùng SSH từ GitHub.

1. **Trên server** (hoặc máy có Docker và có thể chạy `docker` tới server):
   - Cài [GitHub Actions Runner](https://docs.github.com/en/actions/self-hosted-runners) (self-hosted).
   - Đăng ký runner cho repo: **Settings → Actions → Runners → New self-hosted runner**; chạy các lệnh họ đưa (chọn Linux, download, config, run).
   - Đảm bảo user chạy runner có quyền Docker: `sudo usermod -aG docker <user>`.

2. **Trong repo**: dùng workflow **"CI/CD - Build and Deploy (Self-Hosted)"** (file `deploy-selfhosted.yml`).
   - Build + push image vẫn chạy trên GitHub (ubuntu-latest).
   - Job **deploy** chạy trên runner **self-hosted** (không SSH): copy `docker-compose.deploy.yml` vào `DEPLOY_PATH`, chạy `docker compose pull` và `up -d`.

3. **Secrets**: chỉ cần **`DEPLOY_PATH`** (vd `/opt/movie-ticket`) và **`GHCR_PAT`** (nếu package private). **Không cần** `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.

4. **Trên server**: tạo sẵn thư mục và file `.env` (vd `/opt/movie-ticket/.env` từ `.env.example`). Workflow sẽ copy `docker-compose.deploy.yml` vào đó và chạy compose.

**Lưu ý:** Mặc định workflow dùng **`deploy.yml`** (SSH). Để dùng self-hosted, bạn cần **chọn workflow "CI/CD - Build and Deploy (Self-Hosted)"** khi chạy (Actions → chọn workflow đó → Run workflow), hoặc tắt workflow `deploy.yml` (đổi `on` / xóa file) và chỉ dùng `deploy-selfhosted.yml`.

### Cách 2: Expose SSH qua Cloudflare Tunnel (TCP)

Nếu vẫn muốn dùng **deploy.yml** (SSH/SCP từ GitHub):

1. Trong **Cloudflare Zero Trust / Dashboard** tạo **TCP Tunnel** (hoặc dùng `cloudflared`) để expose **SSH (port 22)** của server ra một hostname + port do Cloudflare cấp.
2. Trong **GitHub Secrets** đặt:
   - **DEPLOY_HOST** = hostname Cloudflare cấp (vd `ssh-xxx.trycloudflare.com` hoặc subdomain bạn cấu hình).
   - **DEPLOY_PORT** = port TCP mà Cloudflare gán (thường không phải 22).
   - Giữ **DEPLOY_USER**, **DEPLOY_SSH_KEY**, **DEPLOY_PATH** như bình thường.

Chi tiết cấu hình TCP tunnel tùy vào cách bạn dùng Cloudflare (Zero Trust, cloudflared, v.v.).
