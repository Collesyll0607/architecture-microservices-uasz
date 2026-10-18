package sn.zig.patrimoine.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.zig.patrimoine.model.CategoriePatrimoine;
import sn.zig.patrimoine.model.Patrimoine;

import java.util.List;
import java.util.Optional;

/**
 * Interface du Service Métier pour la gestion des patrimoines.
 * Découple le contrôleur (web) de l'accès aux données (repository).
 */
public interface PatrimoineService {

    Patrimoine enregistrerPatrimoine(Patrimoine patrimoine);

    Patrimoine modifierPatrimoine(Long id, Patrimoine patrimoine);

    void supprimerPatrimoine(Long id);

    Optional<Patrimoine> obtenirParId(Long id);

    Optional<Patrimoine> obtenirParCode(String code);

    List<Patrimoine> listerTous();

    Page<Patrimoine> listerAvecPagination(Pageable pageable);

    Page<Patrimoine> rechercher(String motCle, CategoriePatrimoine categorie, Pageable pageable);

    long compterTotal();
}
