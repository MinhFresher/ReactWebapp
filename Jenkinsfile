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
                bat 'node_modules\\.bin\\http-server dist -p 5000 > server.log 2>&1 &'
                bat 'timeout /T 3 >nul' // wait for server to start
            }
        }
        stage('Start ngrok') {
            steps {
                // Run ngrok on the same port
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
            // This calls ngrok's local API to get the public URL
                powershell '''
                    $resp = Invoke-RestMethod http://localhost:4040/api/tunnels
                    $publicUrl = $resp.tunnels[0].public_url
                    Write-Output "🌐 App is live at: $publicUrl"
                '''
            }
        }
        stage('Cleanup') {
            // Kill node.exe (stop server)
            steps {
                bat 'taskkill /IM http-server.exe /F'
                bat 'taskkill /IM ngrok.exe /F'
            }
        }
    }
}
