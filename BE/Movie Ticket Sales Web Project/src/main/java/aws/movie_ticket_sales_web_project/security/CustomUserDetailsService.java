package aws.movie_ticket_sales_web_project.security;

import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.repository.UserRepository;
import aws.movie_ticket_sales_web_project.repository.UserRoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public UserDetails loadUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id : " + id));

        var userRoles = userRoleRepository.findByUserId(user.getId());

        return CustomUserDetails.build(user, userRoles);
    }
}
