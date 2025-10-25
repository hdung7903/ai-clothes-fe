# AI Clothes Frontend - CI/CD Setup

> Hệ thống tự động triển khai ứng dụng Next.js lên server production với Jenkins

## 📚 Tài Liệu

- **[🚀 Quick Start](./QUICKSTART.md)** - Hướng dẫn nhanh để bắt đầu
- **[📖 Deployment Guide](./DEPLOYMENT.md)** - Hướng dẫn chi tiết đầy đủ

## 🎯 Tính Năng CI/CD

### ✅ Automated Pipeline
- 🔄 Tự động build khi push code
- 🐳 Build Docker image
- 🚀 Deploy lên production server
- ✅ Health check sau khi deploy
- 📧 Thông báo kết quả (success/failure)

### 🔧 Manual Operations
- 🎮 Deploy thủ công qua Jenkins UI
- 📦 Backup & Rollback scripts
- 🔍 Health check script
- 📊 Log monitoring

## 📦 Files Được Tạo

```
ai-clothes-fe/
├── Jenkinsfile                    # Jenkins pipeline configuration
├── .dockerignore                  # Docker build exclusions
├── docker-compose.prod.yml        # Production compose file
├── .env.example                   # Environment template
├── DEPLOYMENT.md                  # Chi tiết deployment guide
├── QUICKSTART.md                  # Hướng dẫn nhanh
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions (alternative)
└── scripts/
    ├── deploy.sh                 # Manual deployment script
    ├── backup.sh                 # Backup script
    ├── rollback.sh               # Rollback script
    └── health-check.sh           # Health check script
```

## 🚀 Quick Start

### 1. Cài đặt Jenkins (trên Jenkins Server)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk -y

# Add Jenkins repository và cài đặt
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Chuẩn bị Production Server

```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Tạo thư mục app
sudo mkdir -p /var/www/ai-clothes-fe
sudo chown $USER:$USER /var/www/ai-clothes-fe
```

### 3. Cấu hình Jenkins

1. Truy cập: `http://your-jenkins-server:8080`
2. Cài đặt plugins: Git, Docker Pipeline, NodeJS, SSH Agent
3. Thêm credentials:
   - SSH key để connect đến production server
   - Server host và user
4. Tạo Pipeline job trỏ đến repository này

### 4. Deploy

Đơn giản chỉ cần push code:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Jenkins sẽ tự động deploy! 🎉

## 🔧 Manual Deployment

Nếu muốn deploy thủ công trên server:

```bash
cd /var/www/ai-clothes-fe
git pull origin main

# Make scripts executable (chỉ cần lần đầu)
chmod +x scripts/*.sh

# Deploy
./scripts/deploy.sh
```

## 📊 Monitoring

### Xem logs

```bash
# Logs của container
docker logs -f ai-clothes-fe-prod

# Logs của nginx (nếu có)
sudo tail -f /var/log/nginx/access.log
```

### Check status

```bash
# Container status
docker ps

# Health check
./scripts/health-check.sh http://localhost:3000
```

## 🔄 Backup & Rollback

### Backup

```bash
./scripts/backup.sh
```

Backup sẽ được lưu tại: `/var/backups/ai-clothes-fe/`

### Rollback

```bash
# Rollback về version trước đó
./scripts/rollback.sh previous

# Hoặc rollback về specific tag
./scripts/rollback.sh backup-20240125-120000
```

## 🌐 Environment Variables

Copy `.env.example` thành `.env.local` và cấu hình:

```bash
cp .env.example .env.local
nano .env.local
```

Các biến quan trọng:
- `NEXT_PUBLIC_API_URL` - API endpoint
- `NODE_ENV` - Environment (production/development)
- Các API keys và secrets khác

## 🔐 Security Checklist

- [ ] SSH keys được cấu hình đúng
- [ ] Credentials được quản lý trong Jenkins
- [ ] `.env` files không được commit vào Git
- [ ] Firewall được cấu hình (chỉ mở port cần thiết)
- [ ] SSL/TLS được cài đặt (HTTPS)
- [ ] Backup được setup tự động
- [ ] Log rotation được cấu hình

## 🐛 Troubleshooting

### Jenkins không connect được đến server

```bash
# Test SSH connection
ssh -v your-user@your-server

# Check Jenkins user có thể SSH không
sudo -u jenkins ssh your-user@your-server
```

### Port conflict

```bash
# Tìm process đang dùng port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Docker issues

```bash
# Clean Docker
docker system prune -a

# Restart Docker
sudo systemctl restart docker

# Check Docker logs
sudo journalctl -u docker
```

## 📈 Pipeline Flow

```
┌─────────────┐
│   Push Code │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ GitHub Webhook  │
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│  Jenkins Checkout   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Install Dependencies│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Build & Lint      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Build Docker Image  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Deploy to Server   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Health Check      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│      Success! 🎉    │
└─────────────────────┘
```

## 🎓 Tài Nguyên Học Tập

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [CI/CD Best Practices](https://www.jenkins.io/doc/book/pipeline/syntax/)

## 🤝 Support

Nếu gặp vấn đề:

1. Kiểm tra **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Troubleshooting section
2. Xem logs của Jenkins: Console Output
3. Xem logs của Docker: `docker logs ai-clothes-fe-prod`
4. Check system logs: `journalctl -u docker`

## 📄 License

MIT License - Free to use and modify

---

**Made with ❤️ for AI Clothes Frontend Team**

🚀 Happy Deploying!
