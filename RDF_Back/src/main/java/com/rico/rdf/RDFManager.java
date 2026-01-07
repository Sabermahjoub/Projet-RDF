package com.rico.rdf;

import org.eclipse.rdf4j.model.*;
import org.eclipse.rdf4j.model.impl.SimpleValueFactory;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.rio.RDFFormat;
import org.eclipse.rdf4j.rio.Rio;
import org.eclipse.rdf4j.sail.memory.MemoryStore;
import org.eclipse.rdf4j.repository.sail.SailRepository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.eclipse.rdf4j.query.TupleQuery;
import org.eclipse.rdf4j.query.TupleQueryResult;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.*;

public class RDFManager {
    private SailRepository repository;
    private RepositoryConnection connection;
    private ValueFactory vf;
    private File baseFile;

    public RDFManager(boolean usePersistence, String dataFolder) {
        vf = SimpleValueFactory.getInstance();

        if (usePersistence) {
            try {
                File folder = new File(dataFolder);
                if (!folder.exists()) folder.mkdirs();

                baseFile = new File(folder, "base_connaissance.ttl");

                repository = new SailRepository(new MemoryStore());
                repository.init();
                connection = repository.getConnection();

                // Charger la base si elle existe
                if (baseFile.exists()) {
                    connection.add(baseFile, null, RDFFormat.TURTLE);
                }

                System.out.println(" Base RDF en mémoire initialisée dans : " + folder.getPath());
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            repository = new SailRepository(new MemoryStore());
            repository.init();
            connection = repository.getConnection();
        }
    }

    /** CREATE */
    public String createResource(String type, Map<String, String> properties) {
        String id = "http://example.org/rico/resource_" + UUID.randomUUID();
        IRI subject = vf.createIRI(id);
        IRI typeIRI = vf.createIRI("https://www.ica.org/standards/RiC/ontology#" + type);

        // Ajouter le type
        connection.add(subject, RDF.TYPE, typeIRI);

        // Ajouter les propriétés
        properties.forEach((key, value) -> {
            IRI pred = vf.createIRI("https://www.ica.org/standards/RiC/ontology#" + key);
            connection.add(subject, pred, vf.createLiteral(value));
        });

        exportToTurtle(); // sauvegarde automatique
        return id;
    }

    /** READ ALL */
    public List<Map<String, String>> readAllResources() {
        List<Map<String, String>> results = new ArrayList<>();
        connection.getStatements(null, null, null).forEach(st -> {
            Map<String, String> map = new HashMap<>();
            map.put("subject", st.getSubject().stringValue());
            map.put("property", st.getPredicate().stringValue());
            map.put("value", st.getObject().stringValue());
            if (st.getPredicate().equals(RDF.TYPE)) {
                map.put("type", st.getObject().stringValue().substring(st.getObject().stringValue().lastIndexOf('#') + 1));
            }
            results.add(map);
        });
        return results;
    }

    /** READ ONE */
    public Map<String, String> readResource(String id) {
        Map<String, String> result = new HashMap<>();
        IRI subject = vf.createIRI(id);
        connection.getStatements(subject, null, null).forEach(st -> {
            String predName = st.getPredicate().stringValue();
            if (st.getPredicate().equals(RDF.TYPE)) {
                result.put("type", st.getObject().stringValue().substring(predName.lastIndexOf('#') + 1));
            } else {
                result.put(predName, st.getObject().stringValue());
            }
        });
        return result;
    }

    /** UPDATE */
    public void updateResource(String id, Map<String, String> newProps) {
        IRI subject = vf.createIRI(id);
        newProps.forEach((key, value) -> {
            IRI pred = vf.createIRI("https://www.ica.org/standards/RiC/ontology#" + key);
            // supprimer l'ancienne valeur si elle existe
            connection.remove(subject, pred, null);
            connection.add(subject, pred, vf.createLiteral(value));
        });
        exportToTurtle(); // sauvegarde automatique
    }

    /** DELETE */
    public void deleteResource(String id) {
        IRI subject = vf.createIRI(id);
        connection.remove(subject, null, null);
        exportToTurtle(); // sauvegarde automatique
    }

    /** SPARQL */
    public List<Map<String, String>> executeSparql(String queryString) {
        List<Map<String, String>> results = new ArrayList<>();
        TupleQuery query = connection.prepareTupleQuery(queryString);
        try (TupleQueryResult res = query.evaluate()) {
            while (res.hasNext()) {
                Map<String, String> map = new HashMap<>();
                res.next().getBindingNames().forEach(name -> map.put(name, res.next().getValue(name).stringValue()));
                results.add(map);
            }
        }
        return results;
    }

    /** EXPORT */
    public void exportToTurtle() {
        if (baseFile != null) {
            try (FileOutputStream out = new FileOutputStream(baseFile)) {
                Rio.write(connection.getStatements(null, null, null), out, RDFFormat.TURTLE);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /** SHUTDOWN */
    public void shutdown() {
        if (connection != null) connection.close();
        if (repository != null) repository.shutDown();
        System.out.println("! RDFManager fermé !");
    }
}
