package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.HoldSeatsRequest;
import aws.movie_ticket_sales_web_project.dto.SeatAvailabilityResponse;
import aws.movie_ticket_sales_web_project.dto.SeatHoldDto;
import aws.movie_ticket_sales_web_project.entity.Seat;
import aws.movie_ticket_sales_web_project.entity.Showtime;
import aws.movie_ticket_sales_web_project.repository.SeatRepository;
import aws.movie_ticket_sales_web_project.repository.ShowtimeRepository;
import aws.movie_ticket_sales_web_project.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatHoldService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final TicketRepository ticketRepository;
    
    // Redis key patterns
    private static final String SEAT_HOLD_KEY_PREFIX = "seat_hold:showtime:";
    private static final String SESSION_HOLDS_KEY_PREFIX = "session_holds:";
    
    // Default hold duration (5 minutes - increased to give users more time)
    private static final long DEFAULT_HOLD_DURATION_MINUTES = 5;
    
    // Log configuration on startup
    static {
        System.out.println("========================================");
        System.out.println("SeatHoldService initialized with:");
        System.out.println("Hold Duration: " + DEFAULT_HOLD_DURATION_MINUTES + " minutes");
        System.out.println("========================================");
    }
    
    /**
     * Hold seats temporarily for a session
     */
    public SeatHoldDto holdSeats(HoldSeatsRequest request) {
        try {
            // Validate showtime exists
            showtimeRepository.findById(request.getShowtimeId())
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));
            
            // Validate all seats exist
            List<Seat> seats = new ArrayList<>();
            for (Integer seatId : request.getSeatIds()) {
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new RuntimeException("Seat not found with ID: " + seatId));
                seats.add(seat);
            }
            
            // Check if seats are already permanently booked (active tickets only)
            for (Integer seatId : request.getSeatIds()) {
                if (ticketRepository.findActiveBySeatIdAndShowtimeId(seatId, request.getShowtimeId()).isPresent()) {
                    throw new RuntimeException("Seat is already booked permanently");
                }
            }
            
            // Check if seats are already held by another session
            List<Integer> alreadyHeldSeats = new ArrayList<>();
            for (Integer seatId : request.getSeatIds()) {
                String seatKey = buildSeatHoldKey(request.getShowtimeId(), seatId);
                SeatHoldDto existingHold = (SeatHoldDto) redisTemplate.opsForValue().get(seatKey);
                
                if (existingHold != null && !existingHold.getSessionId().equals(request.getSessionId())) {
                    alreadyHeldSeats.add(seatId);
                }
            }
            
            if (!alreadyHeldSeats.isEmpty()) {
                throw new RuntimeException("Seats are already held by another user: " + alreadyHeldSeats);
            }
            
            // Create hold information
            long now = Instant.now().toEpochMilli();
            long expiresAt = Instant.now().plusSeconds(DEFAULT_HOLD_DURATION_MINUTES * 60).toEpochMilli();
            
            SeatHoldDto holdInfo = SeatHoldDto.builder()
                    .showtimeId(request.getShowtimeId())
                    .seatIds(request.getSeatIds())
                    .sessionId(request.getSessionId())
                    .customerEmail(request.getCustomerEmail())
                    .holdExpiresAt(expiresAt)
                    .createdAt(now)
                    .build();
            
            // Store/Update hold in Redis with TTL (overwrites existing holds for this session)
            long ttlSeconds = DEFAULT_HOLD_DURATION_MINUTES * 60;
            for (Integer seatId : request.getSeatIds()) {
                String seatKey = buildSeatHoldKey(request.getShowtimeId(), seatId);
                redisTemplate.opsForValue().set(seatKey, holdInfo, ttlSeconds, TimeUnit.SECONDS);
                log.debug("Seat hold created/updated: seatId={}, expiresAt={}", seatId, expiresAt);
            }
            
            // Track holds by session
            String sessionKey = buildSessionHoldsKey(request.getSessionId());
            String holdReference = request.getShowtimeId() + ":" + String.join(",", 
                    request.getSeatIds().stream().map(String::valueOf).collect(Collectors.toList()));
            redisTemplate.opsForSet().add(sessionKey, holdReference);
            redisTemplate.expire(sessionKey, ttlSeconds, TimeUnit.SECONDS);
            
            log.info("Seats held successfully: showtime={}, seats={}, session={}", 
                    request.getShowtimeId(), request.getSeatIds(), request.getSessionId());
            
            return holdInfo;
            
        } catch (Exception e) {
            log.error("Error holding seats", e);
            throw new RuntimeException("Failed to hold seats: " + e.getMessage());
        }
    }
    
    /**
     * Release held seats for a session
     */
    public void releaseSeats(String sessionId, Integer showtimeId, List<Integer> seatIds) {
        try {
            for (Integer seatId : seatIds) {
                String seatKey = buildSeatHoldKey(showtimeId, seatId);
                SeatHoldDto holdInfo = (SeatHoldDto) redisTemplate.opsForValue().get(seatKey);
                
                // Only release if held by this session
                if (holdInfo != null && holdInfo.getSessionId().equals(sessionId)) {
                    redisTemplate.delete(seatKey);
                }
            }
            
            log.info("Seats released: showtime={}, seats={}, session={}", showtimeId, seatIds, sessionId);
            
        } catch (Exception e) {
            log.error("Error releasing seats", e);
        }
    }
    
    /**
     * Release all holds for a session in a specific showtime
     */
    public void releaseSessionHolds(String sessionId, Integer showtimeId) {
        try {
            String sessionKey = buildSessionHoldsKey(sessionId);
            Set<Object> holds = redisTemplate.opsForSet().members(sessionKey);
            
            if (holds != null) {
                for (Object hold : holds) {
                    String holdRef = (String) hold;
                    String[] parts = holdRef.split(":");
                    if (parts.length == 2 && Integer.parseInt(parts[0]) == showtimeId) {
                        String[] seatIdStrs = parts[1].split(",");
                        for (String seatIdStr : seatIdStrs) {
                            String seatKey = buildSeatHoldKey(showtimeId, Integer.parseInt(seatIdStr));
                            redisTemplate.delete(seatKey);
                        }
                        redisTemplate.opsForSet().remove(sessionKey, hold);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("Error releasing session holds", e);
        }
    }
    
    /**
     * Extend hold duration for seats
     */
    public void extendHold(String sessionId, Integer showtimeId, List<Integer> seatIds, long additionalMinutes) {
        try {
            long additionalSeconds = additionalMinutes * 60;
            
            for (Integer seatId : seatIds) {
                String seatKey = buildSeatHoldKey(showtimeId, seatId);
                SeatHoldDto holdInfo = (SeatHoldDto) redisTemplate.opsForValue().get(seatKey);
                
                if (holdInfo != null && holdInfo.getSessionId().equals(sessionId)) {
                    Long currentTtl = redisTemplate.getExpire(seatKey, TimeUnit.SECONDS);
                    if (currentTtl != null && currentTtl > 0) {
                        long newTtl = currentTtl + additionalSeconds;
                        redisTemplate.expire(seatKey, newTtl, TimeUnit.SECONDS);
                        
                        holdInfo.setHoldExpiresAt(Instant.now().plusSeconds(newTtl).toEpochMilli());
                        redisTemplate.opsForValue().set(seatKey, holdInfo, newTtl, TimeUnit.SECONDS);
                    }
                }
            }
            
            log.info("Hold extended: showtime={}, seats={}, additionalMinutes={}", 
                    showtimeId, seatIds, additionalMinutes);
            
        } catch (Exception e) {
            log.error("Error extending hold", e);
        }
    }
    
    /**
     * Get seat availability for a showtime including held seats
     */
    public SeatAvailabilityResponse getSeatAvailability(Integer showtimeId, String sessionId) {
        try {
            // Get all seats for the showtime's hall
            Showtime showtime = showtimeRepository.findById(showtimeId)
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));
            
            List<Seat> allSeats = seatRepository.findByHallId(showtime.getHall().getId());
            
            List<Integer> availableSeatIds = new ArrayList<>();
            List<SeatAvailabilityResponse.SeatHoldInfo> heldSeats = new ArrayList<>();
            List<SeatAvailabilityResponse.SeatInfo> seatInfoList = new ArrayList<>();
            
            for (Seat seat : allSeats) {
                // Check if permanently booked (active tickets only)
                boolean isBooked = ticketRepository.findActiveBySeatIdAndShowtimeId(
                        seat.getId(), showtimeId).isPresent();
                
                String status;
                String holdSessionId = null;
                
                if (isBooked) {
                    status = "BOOKED";
                } else {
                    String seatKey = buildSeatHoldKey(showtimeId, seat.getId());
                    SeatHoldDto holdInfo = (SeatHoldDto) redisTemplate.opsForValue().get(seatKey);
                    
                    if (holdInfo == null) {
                        // Seat is available
                        status = "AVAILABLE";
                        availableSeatIds.add(seat.getId());
                    } else {
                        // Seat is held
                        status = "HELD";
                        holdSessionId = holdInfo.getSessionId();
                        String heldBy = holdInfo.getSessionId().equals(sessionId) ? "you" : "another_user";
                        heldSeats.add(SeatAvailabilityResponse.SeatHoldInfo.builder()
                                .seatId(seat.getId())
                                .heldBy(heldBy)
                                .expiresAt(holdInfo.getHoldExpiresAt())
                                .build());
                    }
                }
                
                // Add full seat information
                seatInfoList.add(SeatAvailabilityResponse.SeatInfo.builder()
                        .seatId(seat.getId())
                        .seatRow(seat.getSeatRow())
                        .seatNumber(seat.getSeatNumber())
                        .seatType(seat.getSeatType() != null ? seat.getSeatType().toString() : "STANDARD")
                        .status(status)
                        .sessionId(holdSessionId)
                        .positionX(seat.getPositionX())
                        .positionY(seat.getPositionY())
                        .build());
            }
            
            return SeatAvailabilityResponse.builder()
                    .showtimeId(showtimeId)
                    .hallId(showtime.getHall().getId())
                    .availableSeatIds(availableSeatIds)
                    .heldSeats(heldSeats)
                    .seats(seatInfoList)
                    .build();
            
        } catch (Exception e) {
            log.error("Error getting seat availability", e);
            throw new RuntimeException("Failed to get seat availability: " + e.getMessage());
        }
    }
    
    /**
     * Check if seats are held by a specific session
     */
    public boolean areSeatsHeldBySession(Integer showtimeId, List<Integer> seatIds, String sessionId) {
        log.info("Checking seat holds - showtimeId={}, seatIds={}, sessionId={}", showtimeId, seatIds, sessionId);
        
        long currentTime = Instant.now().toEpochMilli();
        
        for (Integer seatId : seatIds) {
            String seatKey = buildSeatHoldKey(showtimeId, seatId);
            SeatHoldDto holdInfo = (SeatHoldDto) redisTemplate.opsForValue().get(seatKey);
            
            if (holdInfo == null) {
                log.warn("Seat hold not found in Redis - seatId={}, key={} (Hold may have expired)", seatId, seatKey);
                return false;
            }
            
            // Check if hold has expired
            if (holdInfo.getHoldExpiresAt() != null && currentTime > holdInfo.getHoldExpiresAt()) {
                log.warn("Seat hold has expired - seatId={}, expiredAt={}, currentTime={}", 
                        seatId, holdInfo.getHoldExpiresAt(), currentTime);
                return false;
            }
            
            if (!holdInfo.getSessionId().equals(sessionId)) {
                log.warn("Session mismatch - seatId={}, expected={}, actual={}", 
                        seatId, sessionId, holdInfo.getSessionId());
                return false;
            }
            
            log.debug("Seat hold verified - seatId={}, sessionId={}, expiresAt={}", 
                    seatId, sessionId, holdInfo.getHoldExpiresAt());
        }
        
        log.info("All seats are held by session - showtimeId={}, seatIds={}, sessionId={}", 
                showtimeId, seatIds, sessionId);
        return true;
    }
    
    /**
     * Remove hold when booking is confirmed
     */
    public void confirmBooking(Integer showtimeId, List<Integer> seatIds) {
        try {
            for (Integer seatId : seatIds) {
                String seatKey = buildSeatHoldKey(showtimeId, seatId);
                redisTemplate.delete(seatKey);
            }
            
            log.info("Hold removed after booking confirmation: showtime={}, seats={}", showtimeId, seatIds);
            
        } catch (Exception e) {
            log.error("Error confirming booking", e);
        }
    }
    
    /**
     * Debug method: Verify seats hold status and return detailed information
     */
    public Map<String, Object> verifySeatsHeldBySession(Integer showtimeId, List<Integer> seatIds, String sessionId) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> seatDetails = new ArrayList<>();
        
        long currentTime = Instant.now().toEpochMilli();
        boolean allHeld = true;
        
        for (Integer seatId : seatIds) {
            Map<String, Object> seatInfo = new HashMap<>();
            seatInfo.put("seatId", seatId);
            
            String seatKey = buildSeatHoldKey(showtimeId, seatId);
            SeatHoldDto holdInfo = (SeatHoldDto) redisTemplate.opsForValue().get(seatKey);
            
            if (holdInfo == null) {
                seatInfo.put("status", "NOT_HELD");
                seatInfo.put("message", "Seat not found in Redis (may have expired)");
                allHeld = false;
            } else {
                boolean expired = holdInfo.getHoldExpiresAt() != null && currentTime > holdInfo.getHoldExpiresAt();
                boolean sessionMatch = holdInfo.getSessionId().equals(sessionId);
                
                seatInfo.put("status", expired ? "EXPIRED" : (sessionMatch ? "HELD_BY_YOU" : "HELD_BY_OTHER"));
                seatInfo.put("sessionId", holdInfo.getSessionId());
                seatInfo.put("expiresAt", holdInfo.getHoldExpiresAt());
                seatInfo.put("timeRemaining", Math.max(0, holdInfo.getHoldExpiresAt() - currentTime) / 1000 + " seconds");
                seatInfo.put("sessionMatch", sessionMatch);
                
                if (expired || !sessionMatch) {
                    allHeld = false;
                }
            }
            
            seatDetails.add(seatInfo);
        }
        
        result.put("allSeatsHeld", allHeld);
        result.put("showtimeId", showtimeId);
        result.put("requestSessionId", sessionId);
        result.put("currentTime", currentTime);
        result.put("seats", seatDetails);
        
        log.info("Seat hold verification - showtimeId={}, sessionId={}, allHeld={}", showtimeId, sessionId, allHeld);
        
        return result;
    }
    
    // Helper methods
    
    private String buildSeatHoldKey(Integer showtimeId, Integer seatId) {
        return SEAT_HOLD_KEY_PREFIX + showtimeId + ":seat:" + seatId;
    }
    
    private String buildSessionHoldsKey(String sessionId) {
        return SESSION_HOLDS_KEY_PREFIX + sessionId;
    }
}
