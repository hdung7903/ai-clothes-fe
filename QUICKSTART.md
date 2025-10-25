# Quick Start Guide - Jenkins CI/CD Setup

## 🚀 Bắt Đầu Nhanh

### Bước 1: Chuẩn bị Server

```bash
# SSH vào production server
ssh your-user@your-server

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Tạo thư mục cho app
sudo mkdir -p /var/www/ai-clothes-fe
sudo chown $USER:$USER /var/www/ai-clothes-fe
```

### Bước 2: Setup Jenkins Server

```bash
# Cài đặt Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins openjdk-17-jdk -y

# Khởi động Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Lấy password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Thêm Jenkins vào Docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Bước 3: Cấu hình Jenkins (Web UI)

1. **Truy cập:** http://your-jenkins-server:8080
2. **Install Plugins:**
   - Git Plugin
   - Docker Pipeline
   - NodeJS Plugin
   - SSH Agent Plugin

3. **Thêm Credentials:**
   - `ssh-credentials`: SSH private key
   - `server-host`: Server IP
   - `server-user`: Server username

4. **Tạo Pipeline Job:**
   - New Item → Pipeline
   - Pipeline from SCM → Git
   - Repository URL: your-repo-url
   - Script Path: `Jenkinsfile`

### Bước 4: Setup SSH Key

```bash
# Trên Jenkins server
ssh-keygen -t rsa -b 4096 -C "jenkins@your-domain"
ssh-copy-id your-user@your-production-server

# Test connection
ssh your-user@your-production-server
```

### Bước 5: Deploy

Đơn giản chỉ cần:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

Jenkins sẽ tự động:
1. ✅ Pull code
2. ✅ Build Docker image
3. ✅ Deploy lên server
4. ✅ Health check

---

## 📝 Checklist Cài Đặt

- [ ] Jenkins server đã cài và chạy
- [ ] Production server có Docker & Docker Compose
- [ ] SSH key được setup giữa Jenkins và Production
- [ ] Jenkins plugins đã cài đặt
- [ ] Credentials đã thêm vào Jenkins
- [ ] Pipeline job đã tạo
- [ ] Test deployment thành công

---

## 🎯 Deployment Options

### Option A: Tự động qua Jenkins
- Push code lên GitHub → Jenkins tự động deploy

### Option B: Manual qua Jenkins
- Vào Jenkins → Click "Build Now"

### Option C: Manual trên Server
```bash
cd /var/www/ai-clothes-fe
git pull origin main
./scripts/deploy.sh
```

---

## 🔧 Useful Commands

```bash
# Xem logs
docker logs -f ai-clothes-fe-prod

# Restart app
docker restart ai-clothes-fe-prod

# Xem container đang chạy
docker ps

# Stop app
docker-compose -f docker-compose.prod.yml down

# Start app
docker-compose -f docker-compose.prod.yml up -d

# Rollback
./scripts/rollback.sh previous

# Backup
./scripts/backup.sh
```

---

## 🐛 Common Issues

### Port đã được sử dụng
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Jenkins không SSH được
```bash
# Kiểm tra kết nối
sudo -u jenkins ssh your-user@your-server
```

### Docker build failed
```bash
docker system prune -a
docker build --no-cache -t ai-clothes-fe:latest .
```

---

## 📞 Need Help?

Xem chi tiết tại: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Happy Deploying! 🚀**
