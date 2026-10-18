package sn.zig.evenement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MsEvenementApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsEvenementApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("  MICROSERVICE MS-EVENEMENT DEMARRE SUR LE PORT 8083 !            ");
        System.out.println("  API REST : http://localhost:8083/api/evenements                 ");
        System.out.println("==================================================================");
    }
}
