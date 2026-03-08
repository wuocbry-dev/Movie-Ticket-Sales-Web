# ✅ Lombok Issue - FIXED

## Vấn đề
Project không compile được vì incompatibility giữa Java 25 và Lombok 1.18.34.

## Nguyên nhân
- Hệ thống đang dùng Java 25 (mới nhất)
- Lombok 1.18.34 chưa hỗ trợ đầy đủ Java 25
- Project cần Java 21 (theo pom.xml)

## Giải pháp
Sử dụng Java 21 cho build và run

### Cách 1: Dùng script có sẵn (ĐỀ XUẤT)
```powershell
# Build project
cd "BE\Movie Ticket Sales Web Project"
.\build.ps1

# Run server
.\run.ps1
```

### Cách 2: Set JAVA_HOME thủ công
```powershell
$env:JAVA_HOME = 'C:\Users\QuocBry\.vscode\extensions\redhat.java-1.47.0-win32-x64\jre\21.0.8-win32-x86_64'
.\mvnw clean compile
.\mvnw spring-boot:run
```

### Cách 3: Set JAVA_HOME global (permanent)
1. Mở System Properties > Environment Variables
2. Set JAVA_HOME = `C:\Users\QuocBry\.vscode\extensions\redhat.java-1.47.0-win32-x64\jre\21.0.8-win32-x86_64`
3. Restart terminal

## Xác nhận fix thành công
```
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Compiling 89 source files with javac [debug parameters release 21] to target\classes
```

## Các file đã sửa
- `pom.xml`: Cập nhật Lombok version 1.18.34, config maven-compiler-plugin
- `build.ps1`: Script build với Java 21
- `run.ps1`: Script run server với Java 21
