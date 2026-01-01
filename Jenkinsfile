pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'https://index.docker.io/v1/'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        BACKEND_IMAGE_NAME = 'petarmc/fish-tracker-backend'
        FRONTEND_IMAGE_NAME = 'petarmc/fish-tracker-frontend'
        IMAGE_TAG = ""
        IS_RELEASE = false
    }

    stages {
        stage('Determine Build Type') {
            steps {
                script {
                    if (env.GITHUB_EVENT_NAME == 'release') {
                        env.IS_RELEASE = true

                        env.IMAGE_TAG = sh(
                            script: "git describe --tags --exact-match",
                            returnStdout: true
                        ).trim()
                    } else {
                        echo "Push/commit webhook detected"
                        env.IS_RELEASE = false
                        env.IMAGE_TAG = "build-${env.BUILD_NUMBER}"
                    }

                    echo "IMAGE_TAG set to: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Parallel Build') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'npm run lint'
                            script {
                                docker.build("${BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}")
                            }
                            script {
                                if (env.IS_RELEASE == "true") {
                                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                                        docker.image("${BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}").push()
                                        docker.image("${BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}").push('latest')
                                    }
                                } else {
                                    echo "Skipping backend Docker push (not a release)."
                                }
                            }
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run lint'
                            sh 'npm run build'
                            script {
                                docker.build("${FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}")
                            }
                            script {
                                if (env.IS_RELEASE == "true") {
                                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                                        docker.image("${FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}").push()
                                        docker.image("${FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}").push('latest')
                                    }
                                } else {
                                    echo "Skipping frontend Docker push (not a release)."
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
