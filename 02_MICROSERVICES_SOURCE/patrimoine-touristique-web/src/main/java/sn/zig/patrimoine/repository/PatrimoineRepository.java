package sn.zig.patrimoine.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.zig.patrimoine.model.CategoriePatrimoine;
import sn.zig.patrimoine.model.Patrimoine;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatrimoineRepository extends JpaRepository<Patrimoine, Long> {

    Optional<Patrimoine> findByCode(String code);

    boolean existsByCode(String code);

    Page<Patrimoine> findByCategorie(CategoriePatrimoine categorie, Pageable pageable);

    // Recherche par mot clé dans nom, quartier ou adresse (sans les champs @Lob pour compatibilité HQL)
    @Query("SELECT p FROM Patrimoine p WHERE " +
           "LOWER(p.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.quartier) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.adresse) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Patrimoine> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Recherche combinée : mot-clé + catégorie
    @Query("SELECT p FROM Patrimoine p WHERE p.categorie = :categorie AND (" +
           "LOWER(p.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.quartier) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.adresse) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Patrimoine> searchByKeywordAndCategorie(@Param("keyword") String keyword, 
                                                 @Param("categorie") CategoriePatrimoine categorie, 
                                                 Pageable pageable);

    List<Patrimoine> findByActifTrue();
}
