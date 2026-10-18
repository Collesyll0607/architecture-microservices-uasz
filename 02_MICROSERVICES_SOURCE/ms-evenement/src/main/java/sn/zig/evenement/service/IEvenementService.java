package sn.zig.evenement.service;

import sn.zig.evenement.model.Evenement;
import java.util.List;
import java.util.Optional;

public interface IEvenementService {

    Evenement saveEvenement(Evenement evenement);

    List<Evenement> getAllEvenements();

    Optional<Evenement> getByIdEvenement(Long id);

    Evenement updateEvenement(Long id, Evenement newEvenement);

    void deleteEvenement(Long id);

    boolean reserverPlaces(Long id, int places);

    void libererPlaces(Long id, int places);
}
