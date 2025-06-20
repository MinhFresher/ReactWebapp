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
                // Start the server on port 5173
                bat 'start /B node_modules\\.bin\\http-server dist -p 5173 > server.log 2>&1'
                // Wait a bit for the server to boot
                bat 'ping 127.0.0.1 -n 4 >nul'
                // Check if it's running
                bat 'powershell "if (-not (Test-NetConnection localhost -Port 5173).TcpTestSucceeded) { Write-Error \\"Server not running\\"; exit 1 }"'
            }
        }

        stage('Start ngrok') {
            steps {
                // Launch ngrok tunnel in background
                bat 'start /B ngrok http 5173 > ngrok.log 2>&1'
                // Wait until ngrok local API is up (port 4040)
                bat '''
                powershell -Command "
                $retries = 0;
                while ($retries -lt 10) {
                    try {
                        Invoke-RestMethod http://localhost:4040/api/tunnels | Out-Null
                        Write-Output '✅ ngrok started.'
                        exit 0
                    } catch {
                        Start-Sleep -Seconds 1
                        $retries++
                    }
                }
                Write-Error '❌ ngrok failed to start.';
                exit 1
                "
                '''
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
                // Kill ngrok and any node (http-server) processes
                bat 'taskkill /F /IM ngrok.exe || echo ngrok not running'
                bat 'taskkill /F /IM node.exe || echo node not running'
            }
        }
    }
}
