package sn.zig.patrimoine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.patrimoine.model.Circuit;

import java.util.List;
import java.util.Optional;

@Repository
public interface CircuitRepository extends JpaRepository<Circuit, Long> {

    Optional<Circuit> findByCode(String code);

    List<Circuit> findByActifTrue();
}
