package sn.zig.circuit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Microservice REST ms-circuit (Port 8082 / 3002) - TP1, TP2, TP3 Dr Lamine FATY.
 * Active les clients OpenFeign pour communiquer avec ms-patrimoine (TP2 Slide 30).
 */
@SpringBootApplication
@EnableFeignClients
public class MsCircuitApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsCircuitApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("  MICROSERVICE MS-CIRCUIT DEMARRE SUR LE PORT 8082 !              ");
        System.out.println("  API REST : http://localhost:8082/api/circuits                   ");
        System.out.println("  OpenFeign activé vers ms-patrimoine                             ");
        System.out.println("==================================================================");
    }
}
