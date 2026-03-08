package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.MembershipStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user
     */
    @Transactional
    public ApiResponse<RegisterResponse> register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.<RegisterResponse>builder()
                    .success(false)
                    .message("Email already registered")
                    .build();
        }

        // Check if phone number already exists
        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            return ApiResponse.<RegisterResponse>builder()
                    .success(false)
                    .message("Phone number already registered")
                    .build();
        }

        try {
            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setDateOfBirth(request.getDateOfBirth());
            user.setGender(request.getGender());
            user.setIsActive(true);
            user.setIsEmailVerified(false);
            user.setPrivacyPolicyAccepted(request.getPrivacyPolicyAccepted() != null ? request.getPrivacyPolicyAccepted() : false);
            user.setPrivacyPolicyVersion(request.getPrivacyPolicyVersion());
            user.setPrivacyPolicyAcceptedAt(Instant.now());
            user.setTermsOfServiceAccepted(request.getTermsOfServiceAccepted() != null ? request.getTermsOfServiceAccepted() : false);
            user.setTermsOfServiceVersion(request.getTermsOfServiceVersion());
            user.setTermsOfServiceAcceptedAt(Instant.now());
            user.setCreatedAt(Instant.now());
            user.setUpdatedAt(Instant.now());

            User savedUser = userRepository.save(user);

            // Assign CUSTOMER role
            Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setRoleName("CUSTOMER");
                        role.setDescription("Customer role");
                        role.setCreatedAt(Instant.now());
                        return roleRepository.save(role);
                    });

            UserRole userRole = new UserRole();
            userRole.setUser(savedUser);
            userRole.setRole(customerRole);
            userRole.setAssignedAt(Instant.now());
            userRoleRepository.save(userRole);

            // Create membership with BRONZE tier
            MembershipTier bronzeTier = membershipTierRepository.findByTierLevel(1)
                    .orElseGet(() -> {
                        MembershipTier tier = new MembershipTier();
                        tier.setTierName("BRONZE");
                        tier.setTierNameDisplay("Bronze Member");
                        tier.setTierLevel(1);
                        tier.setMinAnnualSpending(BigDecimal.ZERO);
                        tier.setMinVisitsPerYear(0);
                        tier.setPointsEarnRate(BigDecimal.ONE);
                        tier.setDiscountPercentage(BigDecimal.ZERO);
                        tier.setFreeTicketsPerYear(0);
                        tier.setPriorityBooking(false);
                        tier.setFreeUpgrades(false);
                        tier.setIsActive(true);
                        tier.setCreatedAt(Instant.now());
                        tier.setUpdatedAt(Instant.now());
                        return membershipTierRepository.save(tier);
                    });

            Membership membership = new Membership();
            membership.setUser(savedUser);
            membership.setMembershipNumber("MB" + String.format("%09d", savedUser.getId()));
            membership.setTier(bronzeTier);
            membership.setTotalPoints(0);
            membership.setAvailablePoints(0);
            membership.setLifetimeSpending(BigDecimal.ZERO);
            membership.setAnnualSpending(BigDecimal.ZERO);
            membership.setTotalVisits(0);
            membership.setTierStartDate(LocalDate.now());
            membership.setNextTierReviewDate(LocalDate.now().plusYears(1));
            membership.setStatus(MembershipStatus.ACTIVE);
            membership.setCreatedAt(Instant.now());
            membership.setUpdatedAt(Instant.now());
            membershipRepository.save(membership);

            RegisterResponse response = new RegisterResponse();
            response.setUserId(savedUser.getId());
            response.setEmail(savedUser.getEmail());
            response.setFullName(savedUser.getFullName());
            response.setIsEmailVerified(savedUser.getIsEmailVerified());
            response.setMembershipNumber(membership.getMembershipNumber());
            response.setTierName(bronzeTier.getTierName());
            response.setRoles(List.of(customerRole.getRoleName()));

            log.info("User registered successfully with email: {}", request.getEmail());

            return ApiResponse.<RegisterResponse>builder()
                    .success(true)
                    .message("Registration successful. Please check your email for verification.")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error registering user", e);
            return ApiResponse.<RegisterResponse>builder()
                    .success(false)
                    .message("Registration failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Login user
     */
    @Transactional
    public ApiResponse<LoginResponse> login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());

        try {
            // Get user first to check if account is active
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is active
            if (user.getIsActive() != null && !user.getIsActive()) {
                log.warn("Login attempt for deactivated account: {}", request.getEmail());
                return ApiResponse.<LoginResponse>builder()
                        .success(false)
                        .message("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.")
                        .build();
            }

            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);


            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail(), user.getId());

            // Get user roles
            List<UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
            List<String> roleNames = userRoles.stream()
                    .map(userRole -> userRole.getRole().getRoleName())
                    .collect(Collectors.toList());

            // Get membership info
            Membership membership = membershipRepository.findByUserId(user.getId())
                    .orElse(null);

            // Build response
            UserInfo userInfo = new UserInfo();
            userInfo.setUserId(user.getId());
            userInfo.setEmail(user.getEmail());
            userInfo.setFullName(user.getFullName());
            userInfo.setMembershipTier(membership != null ? membership.getTier().getTierName() : null);
            userInfo.setAvailablePoints(membership != null ? membership.getAvailablePoints() : 0);
            userInfo.setRoles(roleNames);

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setAccessToken(accessToken);
            loginResponse.setRefreshToken(refreshToken);
            loginResponse.setExpiresIn(jwtTokenProvider.getTokenExpirationTime() / 1000);
            loginResponse.setUser(userInfo);

            // Update last login
            user.setLastLoginAt(Instant.now());
            user.setFailedLoginAttempts(0);
            userRepository.save(user);

            log.info("User logged in successfully: {}", request.getEmail());

            return ApiResponse.<LoginResponse>builder()
                    .success(true)
                    .message("Login successful")
                    .data(loginResponse)
                    .build();

        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", request.getEmail());
            return ApiResponse.<LoginResponse>builder()
                    .success(false)
                    .message("Invalid email or password")
                    .build();
        } catch (Exception e) {
            log.error("Error during login", e);
            return ApiResponse.<LoginResponse>builder()
                    .success(false)
                    .message("Login failed: " + e.getMessage())
                    .build();
        }
    }
}
