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
                bat 'npx http-server dist -p 5000 > server.log 2>&1 &'
            }
        }
        stage('Start ngrok') {
            steps {
                bat 'ngrok http 5000 > ngrok.log 2>&1 &'
                bat 'timeout /T 5 >nul'
            }
        }
        stage('Test') {
            steps {
                bat 'jenkins\\scripts\\test.bat'
            }
        }
        stage('Show ngrok URL') {
            steps {
                powershell '''
                    $resp = Invoke-RestMethod http://localhost:4040/api/tunnels
                    $publicUrl = $resp.tunnels[0].public_url
                    Write-Output "🌐 App is live at: $publicUrl"
                '''
            }
        }
    }
}
