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
                // Start the server on port 5173 and bind to all interfaces
                bat 'start /B node_modules\\.bin\\http-server dist -p 5173 -a 0.0.0.0 > server.log 2>&1'
                
                // Wait for the server to start
                bat 'ping 127.0.0.1 -n 4 >nul'
                
                // Validate that the server is running
                powershell '''
                    if (-not (Test-NetConnection localhost -Port 5173).TcpTestSucceeded) {
                        Write-Error "❌ Server not running on port 5173"
                        exit 1
                    }
                '''
            }
        }

        stage('Start ngrok') {
            steps {
                // Start ngrok in background via npx
                bat 'start /B npx ngrok http 127.0.0.1:5173 > ngrok.log 2>&1'

                // Wait for ngrok to initialize
                bat 'ping 127.0.0.1 -n 5 >nul'

                // Verify that the ngrok tunnel is live
                powershell '''
                    $retries = 0
                    while ($retries -lt 10) {
                        try {
                            $resp = Invoke-RestMethod http://localhost:4040/api/tunnels
                            if ($resp.tunnels[0].public_url) {
                                Write-Output "✅ ngrok tunnel is live."
                                exit 0
                            }
                        } catch {
                            Start-Sleep -Seconds 1
                        }
                        $retries++
                    }
                    Write-Error "❌ ngrok failed to start after waiting."
                    exit 1
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
                bat 'taskkill /F /IM ngrok.exe || echo ngrok not running'
                bat 'taskkill /F /IM node.exe || echo http-server not running'
            }
        }
    }
}
