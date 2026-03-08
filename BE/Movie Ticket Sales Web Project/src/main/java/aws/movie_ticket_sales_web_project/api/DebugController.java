package aws.movie_ticket_sales_web_project.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Debug controller to check authentication and roles
 * REMOVE IN PRODUCTION!
 */
@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {
    
    @GetMapping("/whoami")
    public ResponseEntity<?> whoami() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        Map<String, Object> info = new HashMap<>();
        
        if (auth == null) {
            info.put("authenticated", false);
            info.put("message", "No authentication found");
            return ResponseEntity.ok(info);
        }
        
        info.put("authenticated", auth.isAuthenticated());
        info.put("username", auth.getName());
        info.put("principal", auth.getPrincipal().toString());
        info.put("authorities", auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        
        // Check if has SYSTEM_ADMIN role
        boolean hasSystemAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMIN"));
        info.put("hasSystemAdminRole", hasSystemAdmin);
        
        boolean hasSystemAdminWithoutPrefix = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        info.put("hasSystemAdminWithoutRolePrefix", hasSystemAdminWithoutPrefix);
        
        return ResponseEntity.ok(info);
    }
}
