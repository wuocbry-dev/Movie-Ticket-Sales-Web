# Design Patterns trong Movie Ticket Sales Web Project

Tài liệu này mô tả các design pattern được sử dụng trong dự án, kèm lý thuyết, dẫn chứng từ code và so sánh với các phương án thay thế.

---

## Mục lục

1. [Repository Pattern](#1-repository-pattern)
2. [Service Layer Pattern](#2-service-layer-pattern)
3. [MVC / Layered Architecture](#3-mvc--layered-architecture)
4. [DTO Pattern](#4-dto-pattern)
5. [Builder Pattern](#5-builder-pattern)
6. [Singleton Pattern](#6-singleton-pattern)
7. [Factory Pattern](#7-factory-pattern)
8. [Exception Handler Pattern](#8-exception-handler-pattern)
9. [Filter / Chain of Responsibility](#9-filter--chain-of-responsibility)
10. [Template Method Pattern](#10-template-method-pattern)
11. [Adapter Pattern](#11-adapter-pattern)
12. [Strategy Pattern](#12-strategy-pattern)
13. [Dependency Injection](#13-dependency-injection)
14. [Scheduler Pattern](#14-scheduler-pattern)
15. [Wrapper / Response Pattern](#15-wrapper--response-pattern)
16. [Interceptor Pattern (Frontend)](#16-interceptor-pattern-frontend)

---

## 1. Repository Pattern

### Lý thuyết

**Repository Pattern** là một abstraction layer giữa domain model và data access layer. Nó tạo ra một interface giống như collection trong bộ nhớ, cho phép các thao tác CRUD mà không cần biết chi tiết triển khai (SQL, JPA, v.v.).

**Lợi ích:**
- Tách biệt business logic khỏi data access logic
- Dễ dàng thay đổi nguồn dữ liệu (DB, cache, API)
- Dễ test hơn nhờ mock repository
- Code sạch hơn, không phát tán SQL trong service

### Dẫn chứng trong code

```java
// CinemaRepository.java
@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Integer> {

    List<Cinema> findByChainId(Integer chainId);
    Page<Cinema> findByChainIdAndIsActiveTrue(Integer chainId, Pageable pageable);

    @Query("SELECT c FROM Cinema c WHERE c.chain.id = :chainId AND LOWER(c.cinemaName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Cinema> searchByChainIdAndName(@Param("chainId") Integer chainId, @Param("searchTerm") String searchTerm, Pageable pageable);

    Optional<Cinema> findByIdAndChainId(Integer cinemaId, Integer chainId);
}
```

### So sánh: Tại sao dùng Repository thay vì?

| Phương án | Nhược điểm | Repository |
|-----------|------------|------------|
| **Viết SQL trực tiếp trong Service** | Service lộ chi tiết DB, khó test, dễ lặp code | Tách logic truy cập dữ liệu, test dễ mock |
| **Active Record trong Entity** | Entity vừa model vừa DB logic → vi phạm SRP | Entity chỉ là data, không biết DB |
| **DAO (Data Access Object)** | Tương tự Repository nhưng thường phải viết nhiều boilerplate | Spring Data JPA Repository sinh code tự động, ít code hơn |

---

## 2. Service Layer Pattern

### Lý thuyết

**Service Layer** là tầng chứa business logic, nằm giữa Controller (presentation) và Repository (data access). Nó điều phối các thao tác, validate data, và gọi các repository.

**Lợi ích:**
- Business logic tập trung một chỗ
- Controller gọn, chỉ nhận request và trả response
- Dễ dùng transaction cho nhiều thao tác
- Có thể tái sử dụng logic giữa nhiều controller

### Dẫn chứng trong code

```java
// CinemaService.java
@Service
@AllArgsConstructor
@Slf4j
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final CinemaChainRepository cinemaChainRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public ApiResponse<PagedCinemaResponse> getAllActiveCinemas(Integer page, Integer size, String search) {
        log.info("Getting all active cinemas - page: {}, size: {}, search: {}", page, size, search);

        page = (page != null) ? page : 0;
        size = (size != null) ? size : 100;

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "cinemaName"));
            Page<Cinema> cinemaPage;

            if (search != null && !search.isEmpty()) {
                cinemaPage = cinemaRepository.searchActiveByCinemaName(search, pageable);
            } else {
                cinemaPage = cinemaRepository.findByIsActiveTrue(pageable);
            }

            List<CinemaDto> cinemaDtos = cinemaPage.getContent()
                    .stream()
                    .map(this::convertToCinemaDto)
                    .collect(Collectors.toList());

            PagedCinemaResponse response = PagedCinemaResponse.builder()
                    .totalElements(cinemaPage.getTotalElements())
                    .totalPages(cinemaPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .data(cinemaDtos)
                    .build();

            return ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Danh sách rạp được tải thành công")
                    .data(response)
                    .build();
        } catch (Exception e) {
            log.error("Error getting all active cinemas", e);
            return ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Lỗi khi tải danh sách rạp: " + e.getMessage())
                    .build();
        }
    }

    private CinemaDto convertToCinemaDto(Cinema cinema) {
        return CinemaDto.builder()
                .id(cinema.getId())
                .cinemaName(cinema.getCinemaName())
                // ...
                .build();
    }
}
```

### So sánh: Tại sao dùng Service Layer

| Phương án | Nhược điểm | Service Layer |
|-----------|------------|---------------|
| **Logic trong Controller** | Controller phình to, khó test, dễ lặp code | Tách logic, test dễ, tái sử dụng |
| **Logic trong Repository** | Repository chỉ nên truy vấn data | Service điều phối nhiều repository, validate |
| **Logic trong Entity** | Entity không nên biết business logic | Entity chỉ là data model |

---

## 3. MVC / Layered Architecture

### Lý thuyết

**MVC (Model-View-Controller)** trong REST API thường được hiểu là:
- **Controller** (View): API endpoints, nhận request, trả response
- **Service** (Controller logic): Business logic
- **Repository** (Model): Data access
- **Entity** (Model): Domain model

**Lợi ích:**
- Phân tách rõ trách nhiệm
- Dễ bảo trì và mở rộng
- Dễ onboard developer mới

### Dẫn chứng trong code

```
Controller (CinemaController) → Service (CinemaService) → Repository (CinemaRepository) → Entity (Cinema)
```

```java
// CinemaController.java - Chỉ nhận request, gọi service, trả response
@RestController
@RequestMapping("/api/cinemas")
@AllArgsConstructor
public class CinemaController {

    private final CinemaService cinemaService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedCinemaResponse>> getAllCinemas(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "100") Integer size,
            @RequestParam(required = false) String search) {

        ApiResponse<PagedCinemaResponse> response = cinemaService.getAllActiveCinemas(page, size, search);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
```

### So sánh: Tại sao dùng Layered Architecture

| Phương án | Nhược điểm | Layered |
|-----------|------------|---------|
| **Monolithic** (tất cả trong một class) | Khó test, khó sửa, dễ conflict | Mỗi layer rõ ràng, dễ thay đổi |
| **Anemic Domain** (không có logic trong domain) | Logic phát tán trong service | Có thể chấp nhận nếu dùng DTO + Service |
| **Rich Domain** (logic trong entity) | Phức tạp hơn | Project này chọn Anemic + Service để đơn giản |

---

## 4. DTO Pattern

### Lý thuyết

**Data Transfer Object (DTO)** là object chỉ chứa data, dùng để truyền dữ liệu giữa các layer hoặc qua API. Không chứa business logic.

**Lợi ích:**
- Không expose entity ra ngoài (tránh lộ cấu trúc DB, lazy loading)
- Tùy chỉnh response theo client (không cần trả tất cả field)
- Có thể validate dữ liệu đầu vào
- Tách biệt API contract và domain model

### Dẫn chứng trong code

```java
// BookingDto.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Integer bookingId;
    private String bookingCode;
    private Integer userId;
    private String username;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer showtimeId;
    private String movieTitle;
    private Integer cinemaId;
    private String cinemaName;
    private String hallName;
    private String showDate;
    private String startTime;
    private String formatType;
    private Instant bookingDate;
    private Integer totalSeats;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private StatusBooking status;
    private PaymentStatus paymentStatus;
    private List<TicketDto> tickets;
    private ConcessionOrderSummary concessionOrder;
    // ...
}
```

### So sánh: Tại sao dùng DTO

| Phương án | Nhược điểm | DTO |
|-----------|------------|-----|
| **Trả Entity trực tiếp** | Lộ cấu trúc DB, lazy loading có thể gây lỗi, không kiểm soát field | Chỉ expose những gì cần thiết |
| **Map trong Controller** | Controller phình to | Map trong Service (convertToDto) |
| **Chỉ dùng Map<String, Object>** | Không type-safe, dễ sai key | DTO có type rõ ràng, IDE hỗ trợ |

---

## 5. Builder Pattern

### Lý thuyết

**Builder Pattern** tách việc tạo object phức tạp khỏi constructor. Cho phép tạo object từng bước với nhiều tham số tùy chọn.

**Lợi ích:**
- Constructor không bị quá nhiều tham số
- Dễ đọc: `BookingDto.builder().bookingId(1).build()`
- Dễ thêm field mới mà không phá vỡ code cũ
- Lombok @Builder sinh code tự động

### Dẫn chứng trong code

```java
// BookingDto.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Integer bookingId;
    private String bookingCode;
    // ... nhiều field
}

// Sử dụng trong Service
PagedCinemaResponse response = PagedCinemaResponse.builder()
        .totalElements(cinemaPage.getTotalElements())
        .totalPages(cinemaPage.getTotalPages())
        .currentPage(page)
        .pageSize(size)
        .data(cinemaDtos)
        .build();

// S3Config.java - AWS SDK cũng dùng Builder
return S3Client.builder()
        .region(Region.of(region))
        .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
        .build();
```

### So sánh: Tại sao dùng Builder

| Phương án | Nhược điểm | Builder |
|-----------|------------|---------|
| **Constructor nhiều tham số** | Khó đọc, dễ nhầm thứ tự | Builder rõ ràng: `.bookingId(1).status("OK")` |
| **Setter** | Object có thể ở trạng thái chưa đầy đủ | Builder build() một lần, đảm bảo đầy đủ |
| **Telescoping constructor** | Nhiều overload, khó maintain | Một builder cho mọi trường hợp |

---

## 6. Singleton Pattern

### Lý thuyết

**Singleton** đảm bảo một class chỉ có một instance duy nhất trong toàn bộ ứng dụng.

**Lợi ích:**
- Tiết kiệm tài nguyên (connection pool, config)
- Điểm truy cập chung (global state)

**Trong Spring:** Mặc định `@Service`, `@Repository`, `@Component` là singleton (scope mặc định).

### Dẫn chứng trong code

```java
@Service
@AllArgsConstructor
public class CinemaService {
    private final CinemaRepository cinemaRepository;
    // Spring tạo 1 instance duy nhất, inject vào mọi nơi cần
}

@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        // ...
        return template;  // Singleton bean
    }
}
```

### So sánh: Tại sao dùng Singleton qua Spring

| Phương án | Nhược điểm | Spring Singleton |
|-----------|------------|------------------|
| **Tự viết Singleton (getInstance)** | Phải quản lý lifecycle, thread-safety | Spring quản lý, thread-safe |
| **new mỗi lần** | Tốn tài nguyên (DB connection, config) | Một instance dùng chung |
| **@Scope("prototype")** | Mỗi request một instance | Cần khi stateful, nhưng stateless service dùng singleton |

---

## 7. Factory Pattern

### Lý thuyết

**Factory Pattern** tạo object mà không cần biết chi tiết class cụ thể. Client gọi factory thay vì `new` trực tiếp.

**Lợi ích:**
- Tách logic tạo object khỏi logic sử dụng
- Dễ thay đổi implementation (ví dụ: Jedis vs Lettuce)
- Có thể cấu hình qua config

### Dẫn chứng trong code

```java
// RedisConfig.java - JedisConnectionFactory tạo connection
@Bean
public JedisConnectionFactory jedisConnectionFactory() {
    RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
    redisConfig.setHostName(redisHost);
    redisConfig.setPort(redisPort);
    if (redisPassword != null && !redisPassword.isEmpty()) {
        redisConfig.setPassword(redisPassword);
    }
    return new JedisConnectionFactory(redisConfig);
}

// S3Config.java - S3Client.builder() (Factory Method)
@Bean
public S3Client s3Client() {
    AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
    return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
            .build();
}

// SecurityConfig.java - AuthenticationManagerBuilder
return http.getSharedObject(AuthenticationManagerBuilder.class)
        .userDetailsService(userDetailsService)
        .passwordEncoder(passwordEncoder())
        .and()
        .build();
```

### So sánh: Tại sao dùng Factory

| Phương án | Nhược điểm | Factory |
|-----------|------------|---------|
| **new trực tiếp trong code** | Khó config, khó thay đổi | Factory đọc config, tạo đúng instance |
| **Hardcode connection** | Không thay đổi DB/Redis được | Factory đọc config từ application.properties |
| **Static method** | Khó test, khó mock | Có thể inject factory bean |

---

## 8. Exception Handler Pattern

### Lý thuyết

**Exception Handler Pattern** tập trung xử lý exception ở một nơi, thay vì try-catch trong từng controller. Trả về response thống nhất cho client.

**Lợi ích:**
- Không lặp code xử lý lỗi
- Response format nhất quán
- Dễ dùng logging tập trung

### Dẫn chứng trong code

```java
// GlobalExceptionHandler.java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("RuntimeException: {}", ex.getMessage());
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", Instant.now().toString());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("IllegalArgumentException: {}", ex.getMessage());
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", Instant.now().toString());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error: ", ex);
        String message = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
        // ...
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### So sánh: Tại sao dùng GlobalExceptionHandler

| Phương án | Nhược điểm | @ControllerAdvice |
|-----------|------------|-------------------|
| **try-catch trong từng controller** | Lặp code, dễ quên | Một chỗ xử lý tất cả |
| **Filter xử lý exception** | Filter không có context controller | ControllerAdvice gắn với controller layer |
| **Không xử lý** | Client nhận error 500 HTML | Trả JSON thống nhất |

---

## 9. Filter / Chain of Responsibility

### Lý thuyết

**Chain of Responsibility** cho phép nhiều handler xử lý request theo chuỗi. Mỗi handler có thể xử lý hoặc chuyển tiếp cho handler tiếp theo.

**Filter** trong Servlet là một dạng Chain of Responsibility: mỗi filter xử lý request trước khi đến controller.

**Lợi ích:**
- Tách logic cross-cutting (auth, logging, CORS)
- Dễ thêm/bớt filter mà không sửa controller
- Thứ tự thực thi rõ ràng

### Dẫn chứng trong code

```java
// JwtAuthenticationFilter.java - extends OncePerRequestFilter
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        String jwt = getJwtFromRequest(request);

        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            String email = tokenProvider.getEmailFromToken(jwt);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);  // Chuyển tiếp cho filter/controller tiếp theo
    }
}

// SecurityConfig.java - Thêm filter vào chain
.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
```

### So sánh: Tại sao dùng Filter

| Phương án | Nhược điểm | Filter |
|-----------|------------|--------|
| **Kiểm tra auth trong từng controller** | Lặp code, dễ quên | Một filter xử lý trước mọi request |
| **Interceptor** | Chạy sau khi request đã map controller | Filter chạy trước, có thể block request sớm |
| **AOP** | Phức tạp hơn cho auth | Filter đơn giản, dễ hiểu cho auth flow |

---

## 10. Template Method Pattern

### Lý thuyết

**Template Method** định nghĩa skeleton của thuật toán trong một method, để subclass triển khai các bước cụ thể.

**OncePerRequestFilter** là ví dụ: nó định nghĩa `doFilter()` gọi `doFilterInternal()`, subclass chỉ cần override `doFilterInternal()`.

### Dẫn chứng trong code

```java
// JwtAuthenticationFilter extends OncePerRequestFilter
// OncePerRequestFilter (Spring) có logic:
// - Đảm bảo filter chỉ chạy 1 lần mỗi request
// - Gọi doFilterInternal() - subclass override

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        // Logic cụ thể: JWT validation
        // ...
        filterChain.doFilter(request, response);
    }
}
```

### So sánh: Tại sao dùng Template Method

| Phương án | Nhược điểm | Template Method |
|-----------|------------|-----------------|
| **Implement Filter trực tiếp** | Phải tự xử lý "once per request" | OncePerRequestFilter đã xử lý |
| **Copy-paste logic** | Dễ sai |
| **Override toàn bộ filter** | Mất logic cha | Chỉ override phần cần thiết |

---

## 11. Adapter Pattern

### Lý thuyết

**Adapter** chuyển đổi interface của một class thành interface mà client mong đợi. Cho phép các class không tương thích làm việc cùng nhau.

**Lợi ích:**
- Kết nối code cũ với code mới
- Chuyển đổi giữa enum và giá trị DB (ví dụ: `_2D` ↔ `"2D"`)

### Dẫn chứng trong code

```java
// FormatTypeConverter.java - implements AttributeConverter
@Converter(autoApply = true)
public class FormatTypeConverter implements AttributeConverter<FormatType, String> {

    @Override
    public String convertToDatabaseColumn(FormatType attribute) {
        if (attribute == null) return null;
        return attribute.getValue();  // _2D -> "2D", _3D -> "3D"
    }

    @Override
    public FormatType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (FormatType formatType : FormatType.values()) {
            if (formatType.getValue().equals(dbData)) {
                return formatType;
            }
        }
        throw new IllegalArgumentException("Unknown database value: " + dbData);
    }
}
```

### So sánh: Tại sao dùng Adapter (AttributeConverter)

| Phương án | Nhược điểm | AttributeConverter |
|-----------|------------|---------------------|
| **Lưu enum name trực tiếp** | Java enum `_2D` không match DB "2D" | Converter chuyển đổi tự động |
| **Custom logic trong Entity** | Entity biết chi tiết DB | Converter tách riêng |
| **@Enumerated(EnumType.STRING)** | Chỉ map 1-1 | Converter cho phép custom mapping |

---

## 12. Strategy Pattern

### Lý thuyết

**Strategy** định nghĩa các thuật toán có thể thay thế, đóng gói mỗi thuật toán và cho phép chúng hoán đổi. Client dùng interface và không biết implementation cụ thể.

**Lợi ích:**
- Dễ thêm strategy mới
- Tách biệt thuật toán
- Tuân thủ Open/Closed Principle

### Dẫn chứng trong code

```java
// CustomUserDetailsService implements UserDetailsService
@Service
@AllArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email : " + email));
        var userRoles = userRoleRepository.findByUserId(user.getId());
        return CustomUserDetails.build(user, userRoles);
    }
}

// Spring Security dùng interface UserDetailsService - có thể thay implementation
// JwtAccessDeniedHandler implements AccessDeniedHandler
// JwtAuthenticationEntryPoint implements AuthenticationEntryPoint
```

### So sánh: Tại sao dùng Strategy

| Phương án | Nhược điểm | Strategy (interface) |
|-----------|------------|----------------------|
| **Hardcode trong SecurityConfig** | Khó thay đổi cách load user | CustomUserDetailsService có thể thay bằng LDAP, OAuth |
| **if-else theo loại** | Khó mở rộng | Mỗi strategy là một class riêng |
| **Không dùng interface** | Spring Security không biết cách inject | Implement interface chuẩn của Spring |

---

## 13. Dependency Injection

### Lý thuyết

**Dependency Injection (DI)** là kỹ thuật một object nhận các dependency từ bên ngoài thay vì tự tạo. Framework (Spring) quản lý việc tạo và inject.

**Lợi ích:**
- Loose coupling
- Dễ test (inject mock)
- Dễ thay đổi implementation

### Dẫn chứng trong code

```java
// Constructor injection (khuyến nghị)
@Service
@AllArgsConstructor
public class CinemaService {
    private final CinemaRepository cinemaRepository;
    private final CinemaChainRepository cinemaChainRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    // Spring tự inject
}

// Field injection (trong JwtAuthenticationFilter - không dùng constructor vì filter)
@Autowired
private JwtTokenProvider tokenProvider;

@Autowired
private UserDetailsService userDetailsService;
```

### So sánh: Tại sao dùng DI

| Phương án | Nhược điểm | DI |
|-----------|------------|-----|
| **new trong class** | Tight coupling, khó test | Inject từ bên ngoài, dễ mock |
| **Static method** | Khó test, global state | Instance method, inject được |
| **Service Locator** | Ẩn dependency | DI rõ ràng trong constructor |

---

## 14. Scheduler Pattern

### Lý thuyết

**Scheduler** thực thi task theo lịch định sẵn (cron, fixed rate). Dùng cho các tác vụ định kỳ: cleanup, sync, notification.

**Lợi ích:**
- Không cần cron job riêng ngoài ứng dụng
- Chạy trong cùng process, dùng chung DI
- Tích hợp với Spring

### Dẫn chứng trong code

```java
// BookingScheduler.java
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingScheduler {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;

    @Scheduled(fixedRate = 60000)  // Mỗi 1 phút
    @Transactional
    public void cancelExpiredBookings() {
        Instant now = Instant.now();
        List<Booking> expiredBookings = bookingRepository
                .findByStatusAndHoldExpiresAtBefore(StatusBooking.PENDING, now);
        for (Booking booking : expiredBookings) {
            booking.setStatus(StatusBooking.CANCELLED);
            // ...
        }
    }

    @Scheduled(cron = "0 0 3 * * ?")  // 3h sáng mỗi ngày
    @Transactional
    public void cleanupOldCancelledBookings() {
        // Xóa booking cũ hơn 30 ngày
    }
}
```

### So sánh: Tại sao dùng @Scheduled

| Phương án | Nhược điểm | @Scheduled |
|-----------|------------|------------|
| **Cron job OS** | Chạy ngoài app, không dùng DI | Chạy trong app, dùng repository |
| **Thread.sleep trong loop** | Khó quản lý, dễ leak | Spring quản lý lifecycle |
| **Quartz** | Phức tạp hơn cho task đơn giản | @Scheduled đủ cho task đơn giản |

---

## 15. Wrapper / Response Pattern

### Lý thuyết

**Wrapper Pattern** bọc response trong một cấu trúc chuẩn. Client luôn nhận cùng format: `{ success, message, data }`.

**Lợi ích:**
- API nhất quán
- Dễ xử lý ở frontend
- Có thể thêm metadata (pagination, timestamp)

### Dẫn chứng trong code

```java
// ApiResponse.java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private Boolean success;
    private String message;
    private T data;
}

// Sử dụng
return ApiResponse.<PagedCinemaResponse>builder()
        .success(true)
        .message("Danh sách rạp được tải thành công")
        .data(response)
        .build();
```

### So sánh: Tại sao dùng ApiResponse wrapper

| Phương án | Nhược điểm | ApiResponse |
|-----------|------------|-------------|
| **Trả data trực tiếp** | Không có message, khó phân biệt success/error | Có success, message, data |
| **Trả ResponseEntity khác nhau** | Format không thống nhất | Luôn `{ success, message, data }` |
| **Chỉ dùng HTTP status** | Không có message chi tiết | Có message lỗi tiếng Việt |

---

## 16. Interceptor Pattern (Frontend)

### Lý thuyết

**Interceptor** trong Axios là middleware chạy trước/sau mỗi request. Dùng để thêm header, xử lý lỗi tập trung.

**Lợi ích:**
- Không cần thêm token trong từng API call
- Xử lý 401 (logout) một chỗ
- Tách logic cross-cutting (auth, error handling)

### Dẫn chứng trong code

```javascript
// api.js
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - thêm token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicEndpoints = ['/api/movies', '/api/cinemas', ...];
      const requestUrl = error.config?.url || '';
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));
      if (!isPublicEndpoint) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### So sánh: Tại sao dùng Interceptor

| Phương án | Nhược điểm | Interceptor |
|-----------|------------|-------------|
| **Thêm token trong từng API call** | Lặp code, dễ quên | Một chỗ xử lý |
| **Check 401 trong từng component** | Lặp code | Interceptor xử lý tập trung |
| **Wrapper function** | Phải nhớ gọi wrapper | Interceptor tự động chạy |

---

## Tổng kết

| Pattern | Mục đích chính | Vị trí trong project |
|---------|----------------|----------------------|
| Repository | Tách data access | `repository/*` |
| Service | Business logic | `service/*` |
| MVC | Phân tầng | Controller → Service → Repository |
| DTO | Truyền data | `dto/*` |
| Builder | Tạo object phức tạp | DTO, Entity, Config |
| Singleton | Một instance | Spring beans |
| Factory | Tạo object | Config, AWS SDK |
| Exception Handler | Xử lý lỗi tập trung | `GlobalExceptionHandler` |
| Filter | Xử lý request trước controller | `JwtAuthenticationFilter` |
| Template Method | Skeleton cho filter | `OncePerRequestFilter` |
| Adapter | Chuyển đổi format | `FormatTypeConverter` |
| Strategy | Thuật toán thay thế | `UserDetailsService`, `AccessDeniedHandler` |
| DI | Inject dependency | Spring `@Autowired`, `@AllArgsConstructor` |
| Scheduler | Task định kỳ | `BookingScheduler` |
| Wrapper | Response chuẩn | `ApiResponse<T>` |
| Interceptor | Auth, error handling | `api.js` |

---

*Tài liệu được tạo bởi phân tích codebase Movie Ticket Sales Web Project.*
