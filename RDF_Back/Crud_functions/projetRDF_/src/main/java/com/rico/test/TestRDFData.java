package com.rico.test;

import com.rico.rdf.RDFManager;

import java.util.HashMap;
import java.util.Map;

public class TestRDFData {
    public static void main(String[] args) {
        RDFManager rdfManager = new RDFManager(true, "rdf-data");

        // CREATE
        Map<String, String> bobProps = new HashMap<>();
        bobProps.put("name", "Bob");
        bobProps.put("age", "30");
        bobProps.put("email", "bob@example.com");
        String bobId = rdfManager.createResource("Person", bobProps);
        System.out.println("+ Bob créé : " + bobId);

        Map<String, String> docProps = new HashMap<>();
        docProps.put("title", "Contrat de vente");
        docProps.put("date", "2025-01-07");
        String docId = rdfManager.createResource("Record", docProps);
        System.out.println("+ Document créé : " + docId);

        // READ ALL
        System.out.println("\n Lecture de toutes les ressources :");
        rdfManager.readAllResources().forEach(System.out::println);

        // UPDATE
        Map<String, String> updateProps = new HashMap<>();
        updateProps.put("age", "31");
        rdfManager.updateResource(bobId, updateProps);
        System.out.println("\n Bob mis à jour :");
        System.out.println(rdfManager.readResource(bobId));

        // DELETE
        rdfManager.deleteResource(docId);
        System.out.println("\n Document supprimé. Ressources restantes :");
        rdfManager.readAllResources().forEach(System.out::println);

        rdfManager.shutdown();
    }
}
