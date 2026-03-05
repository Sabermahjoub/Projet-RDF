package com.uspn.rdf_back.services;

import org.eclipse.rdf4j.model.Value;
import org.eclipse.rdf4j.query.*;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.springframework.stereotype.Service;

import com.uspn.rdf_back.core.ProjectContext;

import java.util.ArrayList;
import java.util.List;

@Service
public class OntologyService {

    // =============================
    // TYPES RDF
    // =============================
    public List<String> getAllTypes() {

        String query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

        SELECT DISTINCT ?type WHERE {
            ?s rdf:type ?type .
        }
        """;

        List<String> types = new ArrayList<>();

        try (RepositoryConnection conn =
                     ProjectContext.getRepository().getConnection()) {

            TupleQuery tupleQuery = conn.prepareTupleQuery(query);

            try (TupleQueryResult result = tupleQuery.evaluate()) {

                while (result.hasNext()) {
                    BindingSet binding = result.next();
                    Value type = binding.getValue("type");
                    types.add(type.stringValue());
                }
            }
        }

        return types;
    }

    // =============================
    // PROPRIETES D'UN TYPE
    // =============================
    public List<String> getPropertiesOfType(String type) {

        String query =
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
                        "SELECT DISTINCT ?p WHERE { " +
                        " ?s rdf:type <" + type + "> . " +
                        " ?s ?p ?o . " +
                        "}";

        List<String> properties = new ArrayList<>();

        try (RepositoryConnection conn =
                     ProjectContext.getRepository().getConnection()) {

            TupleQuery tupleQuery = conn.prepareTupleQuery(query);

            try (TupleQueryResult result = tupleQuery.evaluate()) {

                while (result.hasNext()) {
                    BindingSet binding = result.next();
                    properties.add(binding.getValue("p").stringValue());
                }
            }
        }

        return properties;
    }

    // =============================
    // RESSOURCES D'UN TYPE
    // =============================
    public List<String> getResourcesOfType(String type) {

        String query =
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
                        "SELECT DISTINCT ?s WHERE { " +
                        " ?s rdf:type <" + type + "> . " +
                        "}";

        List<String> resources = new ArrayList<>();

        try (RepositoryConnection conn =
                     ProjectContext.getRepository().getConnection()) {

            TupleQuery tupleQuery = conn.prepareTupleQuery(query);

            try (TupleQueryResult result = tupleQuery.evaluate()) {

                while (result.hasNext()) {
                    BindingSet binding = result.next();
                    resources.add(binding.getValue("s").stringValue());
                }
            }
        }

        return resources;
    }
}