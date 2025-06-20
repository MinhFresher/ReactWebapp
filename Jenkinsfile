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
                // Start http-server on port 8080 in background
                bat 'start /B node_modules\\.bin\\http-server dist -p 8080 > server.log 2>&1'
                // Wait for server to boot up
                bat 'ping 127.0.0.1 -n 4 >nul'
                // Optionally confirm it’s listening
                bat 'powershell "if (-not (Test-NetConnection localhost -Port 8080).TcpTestSucceeded) { Write-Error \\"Server not running\\"; exit 1 }"'
            }
        }

        stage('Start ngrok') {
            steps {
                // Start ngrok tunnel on port 8080 in background
                bat 'start /B ngrok http 8080 > ngrok.log 2>&1'
                // Wait for ngrok to initialize
                bat 'ping 127.0.0.1 -n 5 >nul'
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

        stage('Cleanup') {
            steps {
                // Kill ngrok and node processes
                bat 'taskkill /F /IM ngrok.exe || echo ngrok not running'
                bat 'taskkill /F /IM node.exe || echo node not running'
            }
        }
    }
}
