package sn.zig.reservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MsReservationApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsReservationApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("  MICROSERVICE MS-RESERVATION DEMARRE SUR LE PORT 8084 !          ");
        System.out.println("  API REST : http://localhost:8084/api/reservations               ");
        System.out.println("==================================================================");
    }
}
