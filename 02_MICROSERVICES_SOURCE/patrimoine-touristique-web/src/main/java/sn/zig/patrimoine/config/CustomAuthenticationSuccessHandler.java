package sn.zig.patrimoine.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

/**
 * Redirige l'utilisateur vers son tableau de bord spécifique dès qu'il se connecte avec succès :
 * - Conservateur / Admin -> /conservateur/dashboard
 * - Guide -> /guide/espace
 * - Touriste -> /touriste/mes-reservations
 */
@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        for (GrantedAuthority auth : authorities) {
            String role = auth.getAuthority();
            if ("ROLE_CONSERVATEUR".equals(role) || "ROLE_ADMIN".equals(role)) {
                response.sendRedirect("/conservateur/dashboard");
                return;
            } else if ("ROLE_GUIDE".equals(role)) {
                response.sendRedirect("/guide/espace");
                return;
            } else if ("ROLE_TOURISTE".equals(role)) {
                response.sendRedirect("/touriste/mes-reservations");
                return;
            }
        }

        response.sendRedirect("/patrimoines");
    }
}
