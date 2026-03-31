# Run script với Java 21
$env:JAVA_HOME = 'C:\Users\QuocBry\.vscode\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64'
Write-Host "Using Java 21: $env:JAVA_HOME" -ForegroundColor Green
.\mvnw spring-boot:run
