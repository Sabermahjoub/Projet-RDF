package com.uspn.rdf_back.example;

import com.uspn.rdf_back.RdfBackApplication;
import com.uspn.rdf_back.dtos.DataSourceExtern;
import com.uspn.rdf_back.services.DataSourceService;
import org.eclipse.rdf4j.model.*;
import org.eclipse.rdf4j.model.impl.DynamicModelFactory;
import org.eclipse.rdf4j.model.impl.SimpleValueFactory;
import org.eclipse.rdf4j.model.util.Values;
import org.eclipse.rdf4j.model.vocabulary.FOAF;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.rio.RDFFormat;
import org.eclipse.rdf4j.rio.Rio;
import org.springframework.boot.SpringApplication;

import java.io.*;
import java.time.LocalDate;

public class Example {

    public static void example() {

        DataSourceExtern dataSource = new DataSourceExtern();
        dataSource.setName("Test Project");
        dataSource.setDescription("Test Description");
        dataSource.setProjectName("TestProject");
        dataSource.setUrl("http://example.com");
        dataSource.setCreationDate(LocalDate.now());
        dataSource.setLastSynchDate(LocalDate.now());

        DataSourceService dataSourceService = new DataSourceService();

        dataSourceService.createProjectMetadata(dataSource);

//        ValueFactory factory = SimpleValueFactory.getInstance();
//        IRI bob = factory.createIRI("http://example.org/bob");
//        IRI name = factory.createIRI("http://example.org/name");
//        Literal bobsName = factory.createLiteral("Bob");
//        Statement nameStatement = factory.createStatement(bob, name, bobsName);
//        Statement typeStatement = Values.getValueFactory().createStatement(bob, RDF.TYPE, FOAF.PERSON);
//
//        Model model =( new DynamicModelFactory()).createEmptyModel();
//        model.add(typeStatement);
//        model.add(nameStatement);
//
//        for (Statement statement: model) {
//            System.out.println(statement.getSubject());
//            System.out.println(statement.getPredicate());
//            System.out.println(statement.getObject());
//
//        }
//
//        File ttlFile = new File("./data/model.ttl");
//        ttlFile.getParentFile().mkdirs(); // Create directory if needed
//
//        try (OutputStream out = new FileOutputStream(ttlFile)) {
//            Rio.write(model, out, RDFFormat.TURTLE);
//            System.out.println("💾 Saved " + model.size() + " triples to: " + ttlFile.getAbsolutePath());
//        } catch (FileNotFoundException e) {
//            throw new RuntimeException(e);
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }

    }
}
