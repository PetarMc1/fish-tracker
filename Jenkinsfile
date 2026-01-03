pipeline {
    agent any

    environment {
        BACKEND_IMAGE_NAME = 'petarmc/fish-tracker-backend'
        FRONTEND_IMAGE_NAME = 'petarmc/fish-tracker-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Parallel Build') {
            parallel {

                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            script {
                                docker.build("${BACKEND_IMAGE_NAME}:${IMAGE_TAG}")
                            }
                            sh "docker save ${BACKEND_IMAGE_NAME}:${IMAGE_TAG} | gzip > ../backend-docker-${IMAGE_TAG}.tar.gz"
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                            script {
                                docker.build("${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}")
                            }
                            sh "docker save ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} | gzip > ../frontend-docker-${IMAGE_TAG}.tar.gz"
                        }
                    }
                }

            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '*.tar.gz'
            cleanWs()
        }
    }
}
