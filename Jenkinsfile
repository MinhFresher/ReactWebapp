pipeline {
    agent any  // Use any available agent (can be Windows or Linux based on your setup)

    stages {
        // Step 1: Install dependencies
        stage('Install') {
            steps {
                bat 'npm install'  // Run npm install to fetch node modules
            }
        }

        // Step 2: Build your React project using Vite
        stage('Build') {
            steps {
                bat 'npm run build'  // Build the production-ready app into /dist
            }
        }

        // Step 3: Start the HTTP server in the background
        stage('Serve App') {
            steps {
                powershell '''
                    # Start http-server using npx, serving the 'dist' directory on port 5173
                    Start-Process "npx" `
                      -ArgumentList "http-server", "dist", "-p", "5173", "-a", "0.0.0.0" `
                      -NoNewWindow `
                      -RedirectStandardOutput "server.log" `
                      -RedirectStandardError "server.log"

                    # Give the server time to boot up
                    Start-Sleep -Seconds 6

                    # Test if the server is reachable on localhost:5173
                    if (-not (Test-NetConnection localhost -Port 5173).TcpTestSucceeded) {
                        Write-Error "❌ Server did not start."
                        exit 1
                    } else {
                        Write-Output "✅ Server is running."
                    }
                '''
            }
        }

        // Step 4: Start ngrok to expose your local server publicly
        stage('Start ngrok') {
            steps {
                powershell '''
                    # Prepare ngrok command to tunnel port 5173
                    $ngrokCmd = "npx ngrok http 127.0.0.1:5173"

                    # Launch ngrok in a new hidden PowerShell window so it stays running
                    Start-Process powershell -ArgumentList "-WindowStyle Hidden", "-Command", $ngrokCmd

                    # Try for up to 15 seconds to wait for ngrok to initialize
                    $retries = 0
                    while ($retries -lt 15) {
                        try {
                            # Hit ngrok's local API to fetch public tunnel info
                            $resp = Invoke-RestMethod http://localhost:4040/api/tunnels
                            if ($resp.tunnels[0].public_url) {
                                Write-Output "✅ ngrok tunnel is live."
                                exit 0
                            }
                        } catch {
                            # Wait 1 second between retries
                            Start-Sleep -Seconds 1
                        }
                        $retries++
                    }

                    # If ngrok didn't start in time, throw an error
                    Write-Error "❌ ngrok failed to start."
                    exit 1
                '''
            }
        }

        // Step 5: Run your test script (customizable)
        stage('Test') {
            steps {
                bat 'jenkins\\scripts\\test.bat'  // Run custom test script (modify as needed)
            }
        }

        // Step 6: Show the ngrok public URL
        stage('Show ngrok URL') {
            steps {
                powershell '''
                    # Query ngrok's local API to extract and display the public tunnel URL
                    $resp = Invoke-RestMethod http://localhost:4040/api/tunnels
                    $publicUrl = $resp.tunnels[0].public_url
                    Write-Output "🌐 App is live at: $publicUrl"
                '''
            }
        }

        // Step 7: Clean up all background processes
        stage('Cleanup') {
            steps {
                // Kill ngrok if it’s still running
                bat 'taskkill /F /IM ngrok.exe || echo ngrok not running'

                // Kill node processes (e.g. http-server)
                bat 'taskkill /F /IM node.exe || echo node not running'
            }
        }
    }
}
