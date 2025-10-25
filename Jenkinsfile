pipeline {
    agent any
    
    environment {
        // Cấu hình Docker
        DOCKER_IMAGE = 'ai-clothes-fe'
        DOCKER_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = '' // Để trống nếu dùng Docker Hub, hoặc điền registry URL
        
        // Cấu hình server
        SERVER_HOST = credentials('server-host') // Thêm credential trong Jenkins
        SERVER_USER = credentials('server-user')
        SERVER_PATH = '/var/www/ai-clothes-fe'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling source code from repository...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                echo 'Docker sẽ tự động install dependencies và build app trong quá trình build image'
                script {
                    // Build Docker image - Dockerfile đã bao gồm npm install và build
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main' // Chỉ push khi merge vào main
            }
            steps {
                echo 'Pushing Docker image to registry...'
                script {
                    // Nếu sử dụng Docker registry
                    if (env.DOCKER_REGISTRY) {
                        docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                            docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                            docker.image("${DOCKER_IMAGE}:latest").push()
                        }
                    } else {
                        echo 'Skipping push to registry (local deployment)'
                    }
                }
            }
        }
        
        stage('Deploy to Server') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production server...'
                script {
                    // Sử dụng SSH để deploy
                    sshagent(['ssh-credentials']) {
                        sh """
                            # Copy toàn bộ code lên server
                            echo "Copying code to server..."
                            ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"
                            rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' \
                                -e "ssh -o StrictHostKeyChecking=no" \
                                ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
                            
                            # SSH vào server và deploy
                            ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} '
                                cd ${SERVER_PATH}
                                
                                echo "Stopping old containers..."
                                docker-compose down || true
                                
                                echo "Building and starting services with docker-compose..."
                                docker-compose up -d --build nextjs-app nginx
                                
                                echo "Cleaning up old images..."
                                docker image prune -f
                                
                                echo "Deployment completed successfully!"
                            '
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo 'Performing health check...'
                script {
                    sleep 15 // Đợi service khởi động
                    // Health check qua domain với HTTPS
                    sh """
                        curl -f -k https://teecraft.com.vn || curl -f http://${SERVER_HOST}:3000 || exit 1
                    """
                    echo 'Health check passed! ✅'
                    echo 'App is running at https://teecraft.com.vn'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully! 🎉'
            echo 'Deployment finished. App is running on production server.'
            // Có thể thêm notification (Slack, Email, etc.)
        }
        failure {
            echo 'Pipeline failed! ❌'
            echo 'Check the console output for error details.'
            // Notification về lỗi
        }
        always {
            echo 'Cleaning up workspace...'
            // Clean up - Chỉ xóa temporary files, giữ lại Docker images
            script {
                try {
                    sh 'docker system prune -f --volumes || true'
                } catch (Exception e) {
                    echo "Cleanup warning: ${e.message}"
                }
            }
        }
    }
}
