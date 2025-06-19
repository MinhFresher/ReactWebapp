pipeline {
    agent any
    stages {
        stage('Install') { 
            steps {
                bat 'npm install'
            }
        }
        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
        stage('Serve App') {
            steps {
                bat 'npm install -g http-server'
                bat 'dir dist'
                bat 'start http-server dist -p 5000'
            }
        }
        stage('Start ngrok') {
            steps {
                // Run ngrok on the same port
                bat 'start ngrok http 5000'
            }
        }
        stage('Test') {
            steps {
                bat 'jenkins\\scripts\\test.bat'
            }
        }
        stage('Show ngrok URL') {
            steps {
                // This calls ngrok's local API to get the public URL
                bat 'curl http://localhost:4040/api/tunnels'
            }
        }
    }
}
