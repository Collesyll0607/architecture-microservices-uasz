package sn.zig.patrimoine.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomAuthenticationSuccessHandler authenticationSuccessHandler;

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(AntPathRequestMatcher.antMatcher("/h2-console/**"))
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            )
            .authorizeHttpRequests(auth -> auth
                // Ressources statiques publiques
                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()
                
                // Consultation publique des patrimoines, circuits et événements
                .requestMatchers("/", "/patrimoines", "/patrimoines/detail/**", "/circuits/**", "/evenements/**").permitAll()
                
                // Console H2
                .requestMatchers("/h2-console/**").permitAll()
                
                // Page de connexion
                .requestMatchers("/login", "/register").permitAll()
                
                // Espace Conservateur / Administrateur
                .requestMatchers("/conservateur/**", "/patrimoines/nouveau", "/patrimoines/enregistrer", 
                                 "/patrimoines/modifier/**", "/patrimoines/supprimer/**", "/avis/moderation/**")
                    .hasAnyAuthority("ROLE_CONSERVATEUR", "ROLE_ADMIN")
                
                // Espace Guide Professionnel
                .requestMatchers("/guide/**").hasAnyAuthority("ROLE_GUIDE", "ROLE_ADMIN")
                
                // Espace Touriste
                .requestMatchers("/touriste/**").hasAnyAuthority("ROLE_TOURISTE", "ROLE_ADMIN")
                
                // Dépôt d'avis et signalement (accessible à tout utilisateur connecté)
                .requestMatchers("/avis/ajouter", "/avis/signaler/**").authenticated()
                
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .successHandler(authenticationSuccessHandler) // Redirige dynamiquement vers le bon dashboard
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login?logout=true")
                .permitAll()
            );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
