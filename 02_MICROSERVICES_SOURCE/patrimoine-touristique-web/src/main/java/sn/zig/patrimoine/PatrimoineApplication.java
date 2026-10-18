package sn.zig.patrimoine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application Spring Boot de Gestion du Patrimoine Touristique.
 * 
 * L'annotation @SpringBootApplication combine :
 * - @Configuration : classe source de définitions de beans.
 * - @EnableAutoConfiguration : active l'autoconfiguration intelligente de Spring Boot.
 * - @ComponentScan : recherche automatique des composants (Controllers, Services, Repositories).
 */
@SpringBootApplication
public class PatrimoineApplication {

    public static void main(String[] args) {
        SpringApplication.run(PatrimoineApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("  APPLICATION PATRIMOINE TOURISTIQUE ZIGUINCHOR DEMARREE !        ");
        System.out.println("  Accès Web : http://localhost:8080                               ");
        System.out.println("  Console Base H2 : http://localhost:8080/h2-console              ");
        System.out.println("==================================================================");
    }
}
