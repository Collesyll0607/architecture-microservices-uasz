package sn.zig.patrimoine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.patrimoine.model.StatutVisite;
import sn.zig.patrimoine.model.Visite;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisiteRepository extends JpaRepository<Visite, Long> {

    // Visites à venir disponibles à la réservation
    List<Visite> findByStatutAndDateHeureAfterOrderByDateHeureAsc(StatutVisite statut, LocalDateTime now);

    // Agenda du guide (demandé dans le cours du prof)
    List<Visite> findByGuideIdOrderByDateHeureDesc(Long guideId);

    // Visites d'un patrimoine donné
    List<Visite> findByPatrimoineIdOrderByDateHeureAsc(Long patrimoineId);
}
