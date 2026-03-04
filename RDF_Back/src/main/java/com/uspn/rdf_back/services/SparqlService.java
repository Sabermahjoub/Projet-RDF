package com.uspn.rdf_back.services;

import com.uspn.rdf_back.core.ProjectContext;
import com.uspn.rdf_back.exception.BadRequestException;
import org.eclipse.rdf4j.query.QueryLanguage;
import org.eclipse.rdf4j.query.TupleQueryResult;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SparqlService {

    private void requireProjectOpen() {
        if (!ProjectContext.isOpen()) throw new BadRequestException("Aucun projet ouvert.");
    }

    public List<Map<String, String>> select(String sparql) {
        requireProjectOpen();
        if (sparql == null || !sparql.trim().toLowerCase().startsWith("select")) {
            throw new BadRequestException("Uniquement SELECT pour ce endpoint.");
        }

        try (RepositoryConnection conn = ProjectContext.getRepository().getConnection()) {
            var query = conn.prepareTupleQuery(QueryLanguage.SPARQL, sparql);
            try (TupleQueryResult res = query.evaluate()) {
                List<String> vars = res.getBindingNames();
                List<Map<String, String>> out = new ArrayList<>();
                while (res.hasNext()) {
                    var b = res.next();
                    Map<String, String> row = new LinkedHashMap<>();
                    for (String v : vars) {
                        row.put(v, b.hasBinding(v) ? b.getValue(v).stringValue() : null);
                    }
                    out.add(row);
                }
                return out;
            }
        }
    }
}