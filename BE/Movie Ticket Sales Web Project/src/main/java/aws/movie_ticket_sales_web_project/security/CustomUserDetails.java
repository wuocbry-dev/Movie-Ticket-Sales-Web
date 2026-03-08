package aws.movie_ticket_sales_web_project.security;

import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private Integer id;
    private String email;
    private String password;
    private Boolean isActive;
    private Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetails build(User user, List<UserRole> userRoles) {
        List<GrantedAuthority> authorities = userRoles.stream()
                .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRole().getRoleName()))
                .collect(Collectors.toList());

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getIsActive(),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    public Integer getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }
}
