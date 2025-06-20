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
                bat 'start /B npx http-server dist -p 5173 -a 0.0.0.0 > server.log 2>&1'
                powershell '''
                    $max = 10; $i = 0
                    while ($i -lt $max) {
                        if ((Test-NetConnection -ComputerName 127.0.0.1 -Port 5173).TcpTestSucceeded) {
                            Write-Host "✅ Server running"
                            exit 0
                        }
                        Start-Sleep -Seconds 1
                        $i++
                    }
                    Write-Error "❌ Server not responding on port 5173"
                    exit 1
                '''
            }
        }
        stage('Start ngrok') {
            steps {
                bat 'start /B npx ngrok http 127.0.0.1:5173 > ngrok.log 2>&1'

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
                bat 'taskkill /F /IM ngrok.exe || exit 0'
                bat 'taskkill /F /IM node.exe || exit 0'
            }
        }
    }
}
