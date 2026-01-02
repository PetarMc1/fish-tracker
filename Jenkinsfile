pipeline {
    agent any

    environment {
        BACKEND_IMAGE_NAME = 'petarmc/fish-tracker-backend'
        FRONTEND_IMAGE_NAME = 'petarmc/fish-tracker-frontend'
        IMAGE_TAG = "build-${env.BUILD_NUMBER}"
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
                                sh "docker save -o ${BACKEND_IMAGE_NAME}-${IMAGE_TAG}.tar ${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                            }
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
                                sh "docker save -o ${FRONTEND_IMAGE_NAME}-${IMAGE_TAG}.tar ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/*.tar', allowEmptyArchive: true
            cleanWs()
        }
    }
}
