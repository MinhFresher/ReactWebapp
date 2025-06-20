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
                powershell '''
                    Start-Process "npx" `
                      -ArgumentList "http-server", "dist", "-p", "5173", "-a", "0.0.0.0" `
                      -NoNewWindow `
                      -RedirectStandardOutput "server.log" `
                      -RedirectStandardError "server.log"
                '''
                Start-Sleep -Seconds 4
                if (-not (Test-NetConnection localhost -Port 5173).TcpTestSucceeded) {
                    Write-Error "❌ Server did not start."
                    exit 1
                }
            }
        }
        stage('Start ngrok') {
            steps {
                powershell '''
                    # Start ngrok process
                    $ngrokCmd = "npx ngrok http 127.0.0.1:5173"
                    Start-Process powershell -ArgumentList "-NoExit", "-Command", $ngrokCmd -WindowStyle Hidden
        
                    # Wait for ngrok API to respond
                    $retries = 0
                    while ($retries -lt 15) {
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
                bat 'taskkill /F /IM ngrok.exe || exit 0'
                bat 'taskkill /F /IM node.exe || exit 0'
            }
        }
    }
}
