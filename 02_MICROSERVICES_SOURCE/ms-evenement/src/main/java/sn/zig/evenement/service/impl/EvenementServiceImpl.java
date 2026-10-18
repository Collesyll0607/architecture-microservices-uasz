package sn.zig.evenement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.zig.evenement.model.Evenement;
import sn.zig.evenement.repository.EvenementRepository;
import sn.zig.evenement.service.IEvenementService;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class EvenementServiceImpl implements IEvenementService {

    private final EvenementRepository evenementRepository;

    @Override
    public Evenement saveEvenement(Evenement evenement) {
        return evenementRepository.save(evenement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Evenement> getAllEvenements() {
        return evenementRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Evenement> getByIdEvenement(Long id) {
        return evenementRepository.findById(id);
    }

    @Override
    public Evenement updateEvenement(Long id, Evenement newEvenement) {
        return evenementRepository.findById(id)
                .map(e -> {
                    e.setTitre(newEvenement.getTitre());
                    e.setCode(newEvenement.getCode());
                    e.setDescription(newEvenement.getDescription());
                    e.setTypeEvenement(newEvenement.getTypeEvenement());
                    e.setDateDebut(newEvenement.getDateDebut());
                    e.setDateFin(newEvenement.getDateFin());
                    e.setLieuPrecis(newEvenement.getLieuPrecis());
                    e.setPlacesMax(newEvenement.getPlacesMax());
                    e.setTarifEntree(newEvenement.getTarifEntree());
                    e.setPatrimoineId(newEvenement.getPatrimoineId());
                    e.setActif(newEvenement.isActif());
                    return evenementRepository.save(e);
                })
                .orElseThrow(() -> new RuntimeException("Evénement introuvable avec l'id : " + id));
    }

    @Override
    public void deleteEvenement(Long id) {
        if (!evenementRepository.existsById(id)) {
            throw new RuntimeException("Evénement introuvable avec l'id : " + id);
        }
        evenementRepository.deleteById(id);
    }

    @Override
    public boolean reserverPlaces(Long id, int places) {
        return evenementRepository.findById(id)
                .map(e -> {
                    if (e.getPlacesOccupees() + places <= e.getPlacesMax()) {
                        e.setPlacesOccupees(e.getPlacesOccupees() + places);
                        evenementRepository.save(e);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }

    @Override
    public void libererPlaces(Long id, int places) {
        evenementRepository.findById(id).ifPresent(e -> {
            e.setPlacesOccupees(Math.max(0, e.getPlacesOccupees() - places));
            evenementRepository.save(e);
        });
    }
}
