package com.rico.app;

import com.rico.rdf.RDFManager;
import java.util.*;

public class CRUDMain {

    private static RDFManager rdfManager;
    private static Scanner scanner;

    public static void main(String[] args) {
        // Initialise RDFManager avec stockage local dans rdf-data
        rdfManager = new RDFManager(true, "rdf-data");
        scanner = new Scanner(System.in);

        System.out.println("════════ Gestionnaire RDF RICO - CRUD ════════");

        boolean running = true;
        while (running) {
            afficherMenu();
            int choix = lireChoix();
            switch (choix) {
                case 1: creerRessource(); break;
                case 2: lireToutesRessources(); break;
                case 3: lireRessourceSpecifique(); break;
                case 4: modifierRessource(); break;
                case 5: supprimerRessource(); break;
                case 6: executerRequeteSPARQL(); break;
                case 0:
                    running = false;
                    System.out.println(">> Au revoir !");
                    break;
                default:
                    System.out.println("X Choix invalide !");
            }
        }

        // Export de la base RDF dans rdf-data/base_connaissance.ttl
        rdfManager.exportToTurtle();
        rdfManager.shutdown();
        scanner.close();
    }

    private static void afficherMenu() {
        System.out.println("\n1. + Créer une ressource");
        System.out.println("2. + Lire toutes les ressources");
        System.out.println("3. + Lire une ressource spécifique");
        System.out.println("4. +  Modifier une ressource");
        System.out.println("5. +  Supprimer une ressource");
        System.out.println("6. + Exécuter requête SPARQL");
        System.out.println("0. >> Quitter");
        System.out.print("Votre choix : ");
    }

    private static int lireChoix() {
        try {
            return Integer.parseInt(scanner.nextLine());
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    // CREATE
    private static void creerRessource() {
        System.out.print("Type de ressource : ");
        String type = scanner.nextLine().trim();
        if (type.isEmpty()) return;

        Map<String, String> props = new HashMap<>();
        while (true) {
            System.out.print("Propriété (nom ou 'fin') : ");
            String key = scanner.nextLine().trim();
            if (key.equalsIgnoreCase("fin")) break;
            if (key.isEmpty()) continue;

            System.out.print("Valeur : ");
            String value = scanner.nextLine().trim();
            props.put(key, value);
        }

        String id = rdfManager.createResource(type, props);
        System.out.println("+ Ressource créée : " + id);
    }

    // READ ALL
    private static void lireToutesRessources() {
        List<Map<String, String>> res = rdfManager.readAllResources();
        if (res.isEmpty()) {
            System.out.println("! Aucune ressource. !");
            return;
        }

        Map<String, List<Map<String,String>>> grouped = new HashMap<>();
        for (Map<String,String> r : res) {
            grouped.computeIfAbsent(r.get("subject"), k -> new ArrayList<>()).add(r);
        }

        for (Map.Entry<String,List<Map<String,String>>> e : grouped.entrySet()) {
            System.out.println("\n🆔 " + e.getKey());
            for (Map<String,String> p : e.getValue()) {
                if (p.containsKey("type")) {
                    System.out.println("   - Type : " + p.get("type"));
                } else {
                    String propName = p.get("property");
                    if (propName.contains("#")) {
                        propName = propName.substring(propName.lastIndexOf('#') + 1);
                    }
                    System.out.println("   ▸ " + propName + " : " + p.get("value"));
                }
            }
        }
    }

    // READ ONE
    private static void lireRessourceSpecifique() {
        System.out.print("ID de la ressource : ");
        String id = scanner.nextLine().trim();
        if (id.isEmpty()) return;

        Map<String,String> res = rdfManager.readResource(id);
        if (res.isEmpty()) {
            System.out.println("X Ressource non trouvée.");
            return;
        }

        System.out.println("\nID " + id);
        res.forEach((k,v) -> {
            String key = k.contains("#") ? k.substring(k.lastIndexOf('#') + 1) : k;
            if (key.equals("type")) System.out.println(" Type : " + v);
            else System.out.println("▸ " + key + " : " + v);
        });
    }

    // UPDATE
    private static void modifierRessource() {
        System.out.print("ID de la ressource à modifier : ");
        String id = scanner.nextLine().trim();
        if (id.isEmpty()) return;

        Map<String,String> newProps = new HashMap<>();
        while (true) {
            System.out.print("Propriété à modifier (ou 'fin') : ");
            String key = scanner.nextLine().trim();
            if (key.equalsIgnoreCase("fin")) break;
            if (key.isEmpty()) continue;

            System.out.print("Nouvelle valeur : ");
            String value = scanner.nextLine().trim();
            newProps.put(key, value);
        }

        rdfManager.updateResource(id, newProps);
        System.out.println("+ Ressource modifiée.");
    }

    // DELETE
    private static void supprimerRessource() {
        System.out.print("ID de la ressource à supprimer : ");
        String id = scanner.nextLine().trim();
        if (id.isEmpty()) return;

        rdfManager.deleteResource(id);
        System.out.println("+ Ressource supprimée.");
    }

    // SPARQL
    private static void executerRequeteSPARQL() {
        System.out.println("Entrez votre requête SPARQL (FIN pour terminer) :");
        StringBuilder sb = new StringBuilder();
        while (true) {
            String line = scanner.nextLine();
            if (line.equalsIgnoreCase("FIN")) break;
            sb.append(line).append("\n");
        }

        String query = sb.toString().trim();
        if (query.isEmpty()) {
            System.out.println("X Requête vide !");
            return;
        }

        try {
            List<Map<String,String>> results = rdfManager.executeSparql(query);
            if (results.isEmpty()) {
                System.out.println(" Aucun résultat.");
                return;
            }

            for (int i=0; i<results.size(); i++) {
                System.out.println("\nRésultat #" + (i+1));
                results.get(i).forEach((k,v) -> System.out.println("   " + k + " : " + v));
            }
        } catch (Exception e) {
            System.out.println("X Erreur SPARQL : " + e.getMessage());
        }
    }
}
