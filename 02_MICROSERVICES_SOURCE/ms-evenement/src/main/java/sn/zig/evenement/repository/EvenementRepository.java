package sn.zig.evenement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.evenement.model.Evenement;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Long> {

    Optional<Evenement> findByCode(String code);

    List<Evenement> findByActifTrue();

    List<Evenement> findByPatrimoineId(Long patrimoineId);
}
