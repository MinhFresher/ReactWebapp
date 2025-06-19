pipeline {
    agent any
    stages {
        stage('Build') { 
            steps {
                bat 'npm install' 
            }
            
        }
        stage('Test') {
            steps {
                bat './jenkins/scripts/test.bat'
            }
        }
    }
}
