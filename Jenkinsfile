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
                            # Copy docker-compose file to server
                            scp -o StrictHostKeyChecking=no docker-compose.yml ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
                            
                            # SSH vào server và chạy deployment
                            ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} '
                                cd ${SERVER_PATH}
                                
                                # Pull latest code hoặc image
                                docker-compose pull || echo "Skipping pull for local images"
                                
                                # Stop old containers
                                docker-compose down
                                
                                # Start new containers
                                docker-compose up -d
                                
                                # Clean up old images
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
                    sleep 10 // Đợi service khởi động
                    sh """
                        curl -f http://${SERVER_HOST}:3000 || exit 1
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully! 🎉'
            // Có thể thêm notification (Slack, Email, etc.)
        }
        failure {
            echo 'Pipeline failed! ❌'
            // Notification về lỗi
        }
        always {
            // Clean up
            cleanWs()
        }
    }
}
