package sn.zig.patrimoine.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.zig.patrimoine.model.CategoriePatrimoine;
import sn.zig.patrimoine.model.Patrimoine;
import sn.zig.patrimoine.repository.PatrimoineRepository;
import sn.zig.patrimoine.service.PatrimoineService;

import java.util.List;
import java.util.Optional;

/**
 * Implémentation du service métier PatrimoineService.
 * Gère la logique applicative, les règles de gestion et les transactions.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class PatrimoineServiceImpl implements PatrimoineService {

    private final PatrimoineRepository patrimoineRepository;

    @Override
    public Patrimoine enregistrerPatrimoine(Patrimoine patrimoine) {
        if (patrimoine.getId() == null && patrimoineRepository.existsByCode(patrimoine.getCode())) {
            throw new IllegalArgumentException("Un patrimoine avec le code " + patrimoine.getCode() + " existe déjà.");
        }
        return patrimoineRepository.save(patrimoine);
    }

    @Override
    public Patrimoine modifierPatrimoine(Long id, Patrimoine nouveauPatrimoine) {
        Patrimoine existant = patrimoineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patrimoine introuvable avec l'identifiant : " + id));

        // Mise à jour des champs
        existant.setNom(nouveauPatrimoine.getNom());
        existant.setCategorie(nouveauPatrimoine.getCategorie());
        existant.setDescription(nouveauPatrimoine.getDescription());
        existant.setHistorique(nouveauPatrimoine.getHistorique());
        existant.setAdresse(nouveauPatrimoine.getAdresse());
        existant.setQuartier(nouveauPatrimoine.getQuartier());
        existant.setLatitude(nouveauPatrimoine.getLatitude());
        existant.setLongitude(nouveauPatrimoine.getLongitude());
        existant.setHorairesOuverture(nouveauPatrimoine.getHorairesOuverture());
        existant.setTarifEntree(nouveauPatrimoine.getTarifEntree());
        existant.setCapaciteAccueil(nouveauPatrimoine.getCapaciteAccueil());
        if (nouveauPatrimoine.getImageUrl() != null && !nouveauPatrimoine.getImageUrl().isBlank()) {
            existant.setImageUrl(nouveauPatrimoine.getImageUrl());
        }
        existant.setActif(nouveauPatrimoine.getActif());

        return patrimoineRepository.save(existant);
    }

    @Override
    public void supprimerPatrimoine(Long id) {
        if (!patrimoineRepository.existsById(id)) {
            throw new IllegalArgumentException("Patrimoine introuvable avec l'identifiant : " + id);
        }
        patrimoineRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Patrimoine> obtenirParId(Long id) {
        return patrimoineRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Patrimoine> obtenirParCode(String code) {
        return patrimoineRepository.findByCode(code);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patrimoine> listerTous() {
        return patrimoineRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Patrimoine> listerAvecPagination(Pageable pageable) {
        return patrimoineRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Patrimoine> rechercher(String motCle, CategoriePatrimoine categorie, Pageable pageable) {
        boolean hasKeyword = (motCle != null && !motCle.trim().isEmpty());
        boolean hasCategorie = (categorie != null);

        if (hasKeyword && hasCategorie) {
            return patrimoineRepository.searchByKeywordAndCategorie(motCle.trim(), categorie, pageable);
        } else if (hasKeyword) {
            return patrimoineRepository.searchByKeyword(motCle.trim(), pageable);
        } else if (hasCategorie) {
            return patrimoineRepository.findByCategorie(categorie, pageable);
        } else {
            return patrimoineRepository.findAll(pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long compterTotal() {
        return patrimoineRepository.count();
    }
}
