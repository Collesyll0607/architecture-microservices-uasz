package sn.zig.patrimoine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.zig.patrimoine.model.Avis;

import java.util.List;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {

    // Avis visibles pour un patrimoine
    List<Avis> findByPatrimoineIdAndModereFalseOrderByDateCreationDesc(Long patrimoineId);

    // Calcul de la moyenne des notes pour un patrimoine
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.patrimoine.id = :patrimoineId AND a.modere = false")
    Double calculateAverageRating(@Param("patrimoineId") Long patrimoineId);

    // Avis signalés en attente de modération par le conservateur/admin
    List<Avis> findBySignaleTrueAndModereFalse();

    // Avis d'un touriste donné
    List<Avis> findByAuteurId(Long auteurId);

    // Vérifier si un avis existe déjà pour une réservation spécifique
    java.util.Optional<Avis> findByReservationId(Long reservationId);

    // Avis et évaluations laissés sur les visites d'un guide
    List<Avis> findByGuideIdOrderByDateCreationDesc(Long guideId);

    // Tous les litiges ouverts
    List<Avis> findByEstLitigeTrueAndModereFalse();

    // Tous les litiges ou avis signalés en attente de traitement par le Conservateur
    @Query("SELECT a FROM Avis a WHERE (a.signale = true OR a.estLitige = true) AND (a.modere = false OR a.modere IS NULL) ORDER BY a.dateCreation DESC")
    List<Avis> findLitigesEtSignalementsEnAttente();

    // Historique des litiges traités / résolus par le Conservateur
    @Query("SELECT a FROM Avis a WHERE a.estLitige = true AND a.modere = true ORDER BY a.dateCreation DESC")
    List<Avis> findLitigesResolus();
}
