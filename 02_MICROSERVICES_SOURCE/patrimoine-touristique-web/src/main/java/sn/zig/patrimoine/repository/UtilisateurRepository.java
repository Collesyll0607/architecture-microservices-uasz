package sn.zig.patrimoine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.patrimoine.model.RoleUtilisateur;
import sn.zig.patrimoine.model.Utilisateur;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByUsername(String username);

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Pour le conservateur : lister les guides en attente de validation
    List<RoleUtilisateur> findByRole(RoleUtilisateur role);

    List<Utilisateur> findByRoleAndGuideValideFalse(RoleUtilisateur role);
    
    List<Utilisateur> findByRoleAndGuideValideTrue(RoleUtilisateur role);
}
