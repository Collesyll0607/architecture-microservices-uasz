package sn.zig.circuit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.circuit.model.Circuit;

import java.util.Optional;

@Repository
public interface CircuitRepository extends JpaRepository<Circuit, Long> {

    Optional<Circuit> findByCodeCircuit(String codeCircuit);
}
