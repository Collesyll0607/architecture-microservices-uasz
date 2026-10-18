-- ========================================================
-- INITIALISATION & CORRECTION DE L'ENCODAGE UTF-8
-- Patrimoine Touristique de Ziguinchor & Basse-Casamance
-- ========================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE `patrimoinedb`;

-- 1. CORRECTION DES UTILISATEURS (Accents français parfaits)
UPDATE `utilisateurs` SET `prenom` = 'Aïssatou', `nom` = 'Fall' WHERE `id` = 3;
UPDATE `utilisateurs` SET `prenom` = 'Collé', `nom` = 'Sylla' WHERE `id` = 4;
INSERT INTO `utilisateurs` (`id`, `actif`, `date_inscription`, `email`, `password`, `nom`, `prenom`, `role`, `telephone`, `username`, `biographie`)
VALUES 
(6, 1, NOW(), 'ousmane.sagna@zig.sn', '$2a$10$wTfV6f1aGfE2V2Q/K0qUreA9F8Z3b5sN8iH6z3mG4yU9p1j8v8g7W', 'Sagna', 'Ousmane', 'ROLE_TOURISTE', '+221 77 412 88 99', 'ousmane', 'Amateur de photographie et passionné d\'écotourisme fluvial.')
ON DUPLICATE KEY UPDATE `nom`=VALUES(`nom`), `prenom`=VALUES(`prenom`);

-- 2. INSERTION / MISE A JOUR DES SITES DU PATRIMOINE AVEC HISTORIQUES COMPLETS
INSERT INTO `patrimoines` (`id`, `code`, `nom`, `categorie`, `adresse`, `quartier`, `tarif_entree`, `capacite`, `capacite_accueil`, `actif`, `image_url`, `description`, `historique`, `horaires_ouverture`, `latitude`, `longitude`, `date_creation`)
VALUES 
(1, 'PAT-ZIG-001', 'Alliance Franco-Sénégalaise de Ziguinchor', 'MUSEE', 
 'Rue du Général de Gaulle, Quartier Escale', 'Escale', 1000.0, 250, 250, 1, 
 '/images/casamance/alliance_francaise.jpg',
 'Chef-d\'œuvre architectural d\'inspiration diola situé au cœur d\'un parc boisé luxuriant. Le centre propose un théâtre de plein air, une médiathèque riche en ouvrages africains, des galeries d\'exposition d\'arts contemporains et un café culturel ombragé.',
 'Inaugurée dans les années 1980 sur les plans visionnaires de l\'architecte Patrick Dujarric, l\'Alliance s\'inspire directement de l\'ingénierie vernaculaire des cases à impluvium de Casamance. Conçue avec des matériaux biosourcés (banco, bois de rônier et tuiles d\'argile), sa toiture conique inversée assure la ventilation naturelle et la récupération des eaux de pluie. Véritable creuset de dialogue interculturel et de bouillonnement artistique au Sénégal, elle accueille les plus grands dramaturges, musiciens et plasticiens d\'Afrique de l\'Ouest.',
 '09h00 - 18h30 (Mardi au Samedi)', 12.5833, -16.2719, NOW()),

(2, 'PAT-ZIG-002', 'Port et Marché aux Poissons de Boudody', 'MARCHE_TRADITIONNEL',
 'Quai de pêche de Boudody, Rive Gauche du Fleuve', 'Boudody', 0.0, 350, 350, 1,
 '/images/casamance/port_ziguinchor.jpg',
 'Cœur vibrant du commerce maritime de Ziguinchor, le quai de Boudody offre un spectacle sensoriel saisissant au retour des grandes pirogues de haute mer et d\'estuaire. On y découvre le débarquement du capitaine, des carpes rouges, des huîtres de palétuvier et le fumage traditionnel.',
 'Ancien comptoir colonial établi sur les rives du fleuve Casamance au XIXe siècle, Boudody s\'est développé comme le carrefour incontournable des échanges entre les îles de l\'estuaire (Carabane, Elinkine, Île aux Oiseaux) et la haute région. Les pêcheurs lébous, diolas et niominkas y perpétuent depuis plus d\'un siècle des techniques de fumage ancestrales dans des claies en bois de palétuvier, faisant de ce quai un poumon économique et un témoignage vivant de la culture riveraine casamançaise.',
 '06h30 - 19h00 (Tous les jours)', 12.5878, -16.2690, NOW()),

(3, 'PAT-ZIG-003', 'Cathédrale Saint-Antoine de Padoue', 'LIEU_DE_CULTE',
 'Place Jean-Paul II, Quartier Escale', 'Escale', 0.0, 500, 500, 1,
 '/images/casamance/cathedrale_ziguinchor.jpg',
 'Monument religieux imposant surplombant la place Jean-Paul II, la cathédrale allie sobriété architecturale et fresques célébrant l\'harmonie religieuse et l\'enracinement de la foi chrétienne au sein des traditions du pays kassa.',
 'Érigée durant l\'époque coloniale et élevée au rang de cathédrale en 1955 lors de la création du diocèse de Ziguinchor, Saint-Antoine de Padoue est un témoin privilégié de l\'histoire spirituelle et sociale de la Casamance. Elle a accueilli la visite historique du pape Jean-Paul II en 1992. Le bâtiment est réputé pour ses célébrations dominicales animées par des chœurs polyphoniques au rythme du kora et des tambours diolas, symbolisant la coexistence fraternelle légendaire entre communautés musulmanes et chrétiennes de la région.',
 '08h00 - 18h00 (Visites hors offices)', 12.5847, -16.2703, NOW()),

(4, 'PAT-ZIG-004', 'Village Artisanal de Ziguinchor', 'VILLAGE_ARTISANAL',
 'Boulevard des Artisans, Santhiaba', 'Santhiaba', 0.0, 200, 200, 1,
 '/images/casamance/pirogue_fleuve.jpg',
 'Haut lieu de création manuelle regroupant plus de quarante maîtres artisans : sculpteurs sur bois d\'ébène et de teck, tisserands d\'étoffes traditionnelles mandingues, bijoutiers en filigrane d\'argent, maroquiniers et peintres sous-verre fixés.',
 'Créé par les pouvoirs publics pour sauvegarder et promouvoir les savoir-faire ancestraux des peuples de Casamance (Diolas, Mandingues, Baïnouks, Peuls et Manjaks), le village artisanal constitue une coopérative vivante. Chaque atelier est un espace d\'apprentissage où les maîtres transmettent aux jeunes générations le travail de la vannerie en fibres de palmier rônier, la fonte du bronze à la cire perdue et la confection des masques rituels kumpo et koussi.',
 '08h30 - 19h00 (Lundi au Samedi)', 12.5780, -16.2750, NOW()),

(5, 'PAT-ZIG-005', 'Mémorial & Musée Le Joola', 'MUSEE',
 'Corniche Fluviale, Quartier Escale', 'Escale', 1500.0, 150, 150, 1,
 '/images/casamance/memorial_joola.jpg',
 'Édifice mémoriel contemporain de haute valeur patrimoniale et humaine, dressé sur la berge du fleuve. Le musée propose un parcours scénographique solennel retraçant l\'histoire de la liaison maritime Dakar-Ziguinchor, la mémoire des disparus du 26 septembre 2002 et les valeurs de fraternité et de civisme.',
 'Inauguré en janvier 2024 après une longue mobilisation citoyenne et des familles de victimes, le mémorial honore le souvenir du naufrage du ferry Le Joola survenu au large de la Gambie, tragédie nationale ayant profondément marqué toutes les familles du Sénégal et du monde. L\'architecture en forme d\'étrave de navire s\'ouvrant sur l\'immensité du fleuve symbolise la résilience, la dignité et la mémoire éternelle de la Casamance.',
 '09h00 - 18h00 (Fermé le Lundi)', 12.5855, -16.2730, NOW()),

(6, 'PAT-ZIG-006', 'Écosystème des Bolongs & Mangroves', 'SITE_NATUREL',
 'Estuaire du Fleuve Casamance, Chenaux Fluviaux', 'Pointe Saint-Georges / Îles', 2500.0, 200, 200, 1,
 '/images/casamance/bolong_mangrove.jpg',
 'Vaste réseau labyrinthique de chenaux d\'eau salée et saumâtre bordés de palétuviers géants. Un sanctuaire écologique préservé où nichent pélicans gris, hérons bihoreaux, flamants roses, martins-pêcheurs et où vivent lamantins et dauphins d\'estuaire.',
 'Les bolongs (terme d\'origine mandingue désignant les marigots d\'estuaire) constituent depuis des millénaires le garde-manger et le rempart protecteur des communautés fluviales de Basse-Casamance. La mangrove protège les rizières traditionnelles des intrusions salines grâce à l\'ingénieux système de diguettes diolas. Reconnue réserve de biosphère, cette zone humide d\'importance internationale (Convention de Ramsar) incarne l\'écotourisme communautaire durable.',
 '07h00 - 18h30 (Circuits en pirogue à marée favorable)', 12.5600, -16.3100, NOW()),

(7, 'PAT-ZIG-007', 'Cases Traditionnelles à Étages de Mlomp', 'MONUMENT_HISTORIQUE',
 'Village de Mlomp, Route d\'Oussouye - Cap Skirring', 'Mlomp / Oussouye', 2000.0, 80, 80, 1,
 '/images/casamance/cases_mlomp.jpg',
 'Constructions extraordinaires en terre crue (banco) et toits de paille, uniques dans toute l\'Afrique de l\'Ouest par leur structure à un ou deux étages entièrement bâtie à la main selon les techniques de maçonnerie diola.',
 'Classées monuments historiques nationaux, les maisons à étages de Mlomp ont été érigées au début du XXe siècle par des bâtisseurs diolas locaux inspirés par les récits de tirailleurs sénégalais revenus d\'Europe. Avec des poutres en bois imputrescible de palmier rônier et une armature végétale renforcée, ces édifices témoignent de l\'audace architecturale et du génie constructeur des populations du département d\'Oussouye.',
 '08h00 - 18h00 (Tous les jours sous la conduite des villageois)', 12.5542, -16.5298, NOW()),

(8, 'PAT-ZIG-008', 'Île et Comptoir Historique de Carabane', 'MONUMENT_HISTORIQUE',
 'Île de Carabane, Embouchure du Fleuve Casamance', 'Carabane', 2000.0, 150, 150, 1,
 '/images/casamance/carabane_bolong.jpg',
 'Île piétonne bordée de cocotiers et de bancs de sable blanc, abritant l\'ancienne église bretonne de 1885, les vestiges du pénitencier colonial et la tombe insolite du Capitaine Protet enterré debout face à la mer.',
 'Premier comptoir commercial français en Casamance fondé en 1836 suite à un traité avec le chef diola de Kagnout, Carabane fut la capitale administrative de la région avant le transfert à Ziguinchor en 1904. Témoin des routes maritimes puis du commerce de l\'arachide et de l\'huile de palme, l\'île est aujourd\'hui un havre de paix écotouristique propice à la contemplation et à la mémoire historique.',
 '08h00 - 18h00 (Accès par pirogue depuis Elinkine)', 12.5367, -16.7028, NOW())

ON DUPLICATE KEY UPDATE 
`nom`=VALUES(`nom`),
`description`=VALUES(`description`),
`historique`=VALUES(`historique`),
`adresse`=VALUES(`adresse`),
`quartier`=VALUES(`quartier`),
`tarif_entree`=VALUES(`tarif_entree`),
`capacite`=VALUES(`capacite`),
`capacite_accueil`=VALUES(`capacite_accueil`),
`horaires_ouverture`=VALUES(`horaires_ouverture`),
`image_url`=VALUES(`image_url`),
`latitude`=VALUES(`latitude`),
`longitude`=VALUES(`longitude`);

-- 3. CIRCUITS TOURISTIQUES
INSERT INTO `circuits` (`id`, `code`, `titre`, `description`, `distance_km`, `duree_estimee_minutes`, `tarif_circuit`, `difficulte`, `actif`, `date_creation`)
VALUES 
(1, 'CIR-ZIG-001', 'Boucle Historique & Fluviale de Ziguinchor',
 'Circuit urbain et fluvial reliant les trésors architecturaux coloniaux du quartier Escale, la cathédrale centenaire, le mémorial Le Joola et l\'effervescence maritime de Boudody.',
 4.5, 180, 5000.0, 'Facile', 1, NOW()),

(2, 'CIR-ZIG-002', 'Parcours Écotourisme des Bolongs & Îles',
 'Excursion en pirogue traditionnelle à travers les marigots verdoyants, observation des oiseaux migrateurs, halte chez les ramasseuses d\'huîtres de palétuvier et navigation jusqu\'à la Pointe Saint-Georges.',
 18.0, 240, 12000.0, 'Moyen', 1, NOW()),

(3, 'CIR-ZIG-003', 'Route des Royaumes : Mlomp, Oussouye & Carabane',
 'Immersion culturelle au royaume d\'Oussouye, visite des majestueuses cases à étages en banco de Mlomp, traversée aquatique vers l\'île historique de Carabane et rencontres avec les dignitaires coutumiers.',
 35.0, 360, 20000.0, 'Moyen', 1, NOW())

ON DUPLICATE KEY UPDATE 
`titre`=VALUES(`titre`),
`description`=VALUES(`description`),
`distance_km`=VALUES(`distance_km`),
`duree_estimee_minutes`=VALUES(`duree_estimee_minutes`),
`tarif_circuit`=VALUES(`tarif_circuit`),
`difficulte`=VALUES(`difficulte`);

-- Liaisons Circuit - Patrimoines
DELETE FROM `circuit_patrimoines`;
INSERT INTO `circuit_patrimoines` (`circuit_id`, `patrimoine_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 5),
(2, 2), (2, 6), (2, 8),
(3, 4), (3, 7), (3, 8);

-- 4. ÉVÉNEMENTS CULTURELS
INSERT INTO `evenements` (`id`, `code`, `titre`, `type_evenement`, `lieu_precis`, `description`, `tarif_entree`, `places_max`, `places_occupees`, `actif`, `patrimoine_id`, `date_debut`, `date_fin`)
VALUES 
(1, 'EVT-ZIG-001', 'Festival des Arts et Rythmes de Casamance', 'FESTIVAL',
 'Alliance Franco-Sénégalaise, Scène plein air',
 'Grande célébration culturelle annuelle : danses traditionnelles diolas, concerts acoustiques de kora et sabar, projections de documentaires et expositions de plasticiens contemporains.',
 2500.0, 200, 45, 1, 1, '2026-11-15 17:00:00', '2026-11-17 23:30:00'),

(2, 'EVT-ZIG-002', 'Atelier d\'Initiation à la Vannerie & Poterie Traditionnelle', 'ATELIER',
 'Village Artisanal de Ziguinchor, Atelier Central',
 'Stage pratique encadré par les artisanes maîtresses de la région. Découverte du modelage de la terre glaise des marigots et du tressage de fibres de palmier rônier.',
 1500.0, 30, 12, 1, 4, '2026-10-28 09:30:00', '2026-10-28 16:00:00'),

(3, 'EVT-ZIG-003', 'Grande Régate Fluviale de Pirogues Traditionnelles', 'MANIFESTATION_SPORTIVE',
 'Port de Boudody & Estuaire du Fleuve',
 'Compétition maritime légendaire réunissant les équipages de pêcheurs de tous les villages de l\'estuaire de Ziguinchor à Carabane. Ambiance festive et chants de rameurs.',
 0.0, 500, 110, 1, 2, '2026-12-05 10:00:00', '2026-12-05 18:00:00'),

(4, 'EVT-ZIG-004', 'Journée Nationale de Mémoire & Résilience', 'COMMEMORATION',
 'Mémorial & Musée Le Joola, Esplanade Fluviale',
 'Cérémonie solennelle, récitals de poésie casamançaise, visites guidées gratuites des galeries mémorielles et conférences-débats sur la sécurité maritime.',
 0.0, 150, 40, 1, 5, '2026-11-02 10:00:00', '2026-11-02 17:30:00')

ON DUPLICATE KEY UPDATE 
`titre`=VALUES(`titre`),
`type_evenement`=VALUES(`type_evenement`),
`lieu_precis`=VALUES(`lieu_precis`),
`description`=VALUES(`description`),
`tarif_entree`=VALUES(`tarif_entree`),
`places_max`=VALUES(`places_max`),
`places_occupees`=VALUES(`places_occupees`);

-- 5. AVIS RÉALISTES POUR LES TESTS
DELETE FROM `avis`;
INSERT INTO `avis` (`id`, `note`, `commentaire`, `modere`, `signale`, `patrimoine_id`, `utilisateur_id`, `date_creation`)
VALUES 
(1, 5, 'Un lieu magique ! L\'architecture en impluvium garde une fraîcheur incroyable en pleine journée. Les concerts sous les arbres sont un must à Ziguinchor.', 1, 0, 1, 3, NOW() - INTERVAL 5 DAY),
(2, 5, 'Visite captivante avec le conservateur. La richesse de la médiathèque sur l\'histoire de la Casamance vaut absolument le détour.', 1, 0, 1, 6, NOW() - INTERVAL 2 DAY),
(3, 4, 'Une ambiance extraordinaire au petit matin. Les couleurs des pirogues et la gentillesse des pêcheurs rendent ce port inoubliable.', 1, 0, 2, 3, NOW() - INTERVAL 10 DAY),
(4, 5, 'Une messe dominicale aux chœurs polyphoniques exceptionnels. L\'harmonie entre traditions et spiritualité est saisissante.', 1, 0, 3, 6, NOW() - INTERVAL 8 DAY),
(5, 5, 'J\'ai acheté une magnifique sculpture en ébène directement auprès de l\'artisan. Les prix sont très corrects et l\'accueil est chaleureux.', 1, 0, 4, 3, NOW() - INTERVAL 3 DAY),
(6, 5, 'Un lieu de mémoire d\'une émotion rare. L\'architecture tournée vers le fleuve est poignante. À voir absolument pour comprendre la Casamance.', 1, 0, 5, 3, NOW() - INTERVAL 1 DAY),
(7, 5, 'La balade en pirogue dans les mangroves était le clou de notre séjour. Nous avons pu observer des dizaines de martins-pêcheurs et des dauphins au loin.', 1, 0, 6, 6, NOW() - INTERVAL 4 DAY),
(8, 5, 'Les maisons à étages de Mlomp défient les lois de l\'architecture traditionnelle en terre crue. Le guide du village explique merveilleusement leur construction.', 1, 0, 7, 3, NOW() - INTERVAL 7 DAY),
(9, 5, 'Carabane est un véritable paradis préservé. L\'histoire coloniale est palpable et la sérénité des plages est absolue.', 1, 0, 8, 6, NOW() - INTERVAL 6 DAY);

-- 6. VISITES PROGRAMMÉES (GUIDES & CONSERVATEURS)
DELETE FROM `visites`;
INSERT INTO `visites` (`id`, `date_heure`, `places_max`, `places_occupees`, `statut`, `tarif_par_personne`, `patrimoine_id`, `circuit_id`, `guide_id`)
VALUES 
(1, NOW() + INTERVAL 2 DAY, 20, 4, 'PROGRAMMEE', 1500.0, 1, NULL, 2),
(2, NOW() + INTERVAL 3 DAY, 15, 2, 'PROGRAMMEE', 5000.0, NULL, 1, 2),
(3, NOW() + INTERVAL 4 DAY, 20, 6, 'PROGRAMMEE', 2500.0, 6, NULL, 2),
(4, NOW() + INTERVAL 5 DAY, 12, 3, 'PROGRAMMEE', 12000.0, NULL, 2, 4),
(5, NOW() + INTERVAL 7 DAY, 25, 5, 'PROGRAMMEE', 2000.0, 7, NULL, 2);

-- 7. RÉSERVATIONS DE TEST (Avec Pass QR et données réelles pour l\'utilisateur Touriste)
DELETE FROM `reservations`;
INSERT INTO `reservations` (`id`, `numero_reservation`, `nombre_places`, `montant_total`, `statut`, `qr_code_token`, `date_reservation`, `utilisateur_id`, `visite_id`)
VALUES 
(1, 'RES-2026-ZIG-001', 2, 3000.0, 'CONFIRMEE', 'QR-ZIG-ALLIANCE-2026-A1B2', NOW() - INTERVAL 2 DAY, 3, 1),
(2, 'RES-2026-ZIG-002', 1, 5000.0, 'CONFIRMEE', 'QR-ZIG-CIRCUIT-2026-C3D4', NOW() - INTERVAL 1 DAY, 3, 2),
(3, 'RES-2026-ZIG-003', 2, 5000.0, 'CONFIRMEE', 'QR-ZIG-BOLONGS-2026-E5F6', NOW(), 3, 3);

-- Table ms_reservations pour le microservice ms-reservation
DELETE FROM `ms_reservations`;
INSERT INTO `ms_reservations` (`id`, `numero_reservation`, `type_element`, `element_id`, `titre_element`, `nom_client`, `email_client`, `telephone_client`, `nombre_places`, `montant_total`, `statut`, `qr_code_token`, `date_reservation`)
VALUES 
(1, 'MS-RES-2026-001', 'CIRCUIT', 1, 'Boucle Historique & Fluviale de Ziguinchor', 'Aïssatou Fall', 'aissatou.fall@gmail.com', '+221 77 123 45 67', 2, 10000.0, 'CONFIRMEE', 'QR-MS-CIR-001-OK', NOW() - INTERVAL 1 DAY),
(2, 'MS-RES-2026-002', 'EVENEMENT', 1, 'Festival des Arts et Rythmes de Casamance', 'Aïssatou Fall', 'aissatou.fall@gmail.com', '+221 77 123 45 67', 1, 2500.0, 'CONFIRMEE', 'QR-MS-EVT-001-OK', NOW());
SET FOREIGN_KEY_CHECKS = 1;
