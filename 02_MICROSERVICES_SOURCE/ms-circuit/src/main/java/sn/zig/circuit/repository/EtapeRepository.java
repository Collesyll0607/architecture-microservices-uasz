package sn.zig.circuit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.circuit.model.Etape;

import java.util.List;

@Repository
public interface EtapeRepository extends JpaRepository<Etape, Long> {

    List<Etape> findByCircuitIdOrderByPositionAsc(Long circuitId);

    List<Etape> findByPatrimoineId(Long patrimoineId);
}
