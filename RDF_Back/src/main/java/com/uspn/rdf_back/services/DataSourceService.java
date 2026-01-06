package com.uspn.rdf_back.services;

import com.uspn.rdf_back.dtos.DataSourceExtern;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.eclipse.rdf4j.model.IRI;
import org.eclipse.rdf4j.model.Model;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.model.impl.SimpleValueFactory;
import org.eclipse.rdf4j.model.impl.TreeModel;
import org.eclipse.rdf4j.rio.RDFFormat;
import org.eclipse.rdf4j.rio.Rio;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.eclipse.rdf4j.model.vocabulary.DCTERMS;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.model.vocabulary.RDFS;
import org.eclipse.rdf4j.model.vocabulary.XSD;

@Service
@RequiredArgsConstructor
public class DataSourceService {

    private static final ValueFactory VF = SimpleValueFactory.getInstance();

    @Value("${metadata.base.dir:./metadata}")
    private String baseMetadataDir;

    public static final String PROJECTS_PATH = "projects";

    private static final String BASE_URI = "https://example.com/project/";
    private static final String DCTERMS_NS = "http://purl.org/dc/terms/";
    private static final String SCHEMA_NS = "http://schema.org/";
    private static final String XSD_NS = "http://www.w3.org/2001/XMLSchema#";


    public void createProjectMetadata(DataSourceExtern dataSource) {
        try {
            // Check if baseMetadataDir is null (in case @Value doesn't work)
            if (baseMetadataDir == null) {
                baseMetadataDir = "./metadata";
                System.out.println("WARNING: baseMetadataDir was null, using default: " + baseMetadataDir);
            }

            // Sanitize project name
            String projectName = sanitizeProjectName(dataSource.getProjectName());
            if (projectName == null || projectName.trim().isEmpty()) {
                throw new IllegalArgumentException("Project name cannot be null or empty");
            }

            // Create the full project directory path
            Path projectDir = Paths.get(baseMetadataDir, projectName);
            System.out.println("Project directory path: " + projectDir.toAbsolutePath());

            // Create directory if it doesn't exist
            if (!Files.exists(projectDir)) {
                Files.createDirectories(projectDir);
                System.out.println("Created directory: " + projectDir.toAbsolutePath());
            }

            // Create RDF model
            Model model = new TreeModel();

            // Add namespace declarations
            model.setNamespace("dct", DCTERMS_NS);
            model.setNamespace("schema", SCHEMA_NS);
            model.setNamespace("xsd", XSD_NS);
            model.setNamespace("rdf", RDF.NAMESPACE);
            model.setNamespace("rdfs", RDFS.NAMESPACE);

            // Create IRI for the project
            IRI projectIri = VF.createIRI(BASE_URI + projectName);

            // Add project metadata
            model.add(projectIri, RDF.TYPE, VF.createIRI(SCHEMA_NS + "Project"));

            // Basic metadata - check for null
            if (dataSource.getName() != null) {
                model.add(projectIri,
                        VF.createIRI(DCTERMS_NS + "title"),
                        VF.createLiteral(dataSource.getName()));
            }

            if (dataSource.getDescription() != null) {
                model.add(projectIri,
                        VF.createIRI(DCTERMS_NS + "description"),
                        VF.createLiteral(dataSource.getDescription()));
            }

            // Add source URL - check for null
            if (dataSource.getUrl() != null) {
                model.add(projectIri,
                        VF.createIRI(DCTERMS_NS + "source"),
                        VF.createLiteral(dataSource.getUrl()));
            }

            // Dates
            if (dataSource.getCreationDate() != null) {
                model.add(projectIri,
                        VF.createIRI(DCTERMS_NS + "created"),
                        VF.createLiteral(
                                dataSource.getCreationDate().format(DateTimeFormatter.ISO_DATE),
                                VF.createIRI(XSD_NS + "date")
                        ));
            }

            if (dataSource.getLastSynchDate() != null) {
                model.add(projectIri,
                        VF.createIRI(DCTERMS_NS + "modified"),
                        VF.createLiteral(
                                dataSource.getLastSynchDate().format(DateTimeFormatter.ISO_DATE),
                                VF.createIRI(XSD_NS + "date")
                        ));
            }

            // Add current timestamp
            model.add(projectIri,
                    VF.createIRI(DCTERMS_NS + "issued"),
                    VF.createLiteral(
                            LocalDate.now().format(DateTimeFormatter.ISO_DATE),
                            VF.createIRI(XSD_NS + "date")
                    ));

            // Write to file
            File ttlFile = new File(projectDir.toFile(), "metadata.ttl");
            try (FileOutputStream out = new FileOutputStream(ttlFile)) {
                Rio.write(model, out, RDFFormat.TURTLE);
                System.out.println("✓ RDF metadata created at: " + ttlFile.getAbsolutePath());
                System.out.println("✓ File size: " + ttlFile.length() + " bytes");

                // Print file content for verification
                String content = Files.readString(ttlFile.toPath());
                System.out.println("=== Generated RDF/Turtle Content ===");
                System.out.println(content);
                System.out.println("=====================================");
            }

        } catch (IOException e) {
            System.err.println("✗ Failed to create RDF metadata: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create metadata file", e);
        } catch (Exception e) {
            System.err.println("✗ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Unexpected error creating metadata", e);
        }
    }

    public boolean directoryExists(String directoryPath) {
        if (directoryPath == null) {
            return false;
        }
        Path path = Paths.get(directoryPath);
        return Files.exists(path) && Files.isDirectory(path);
    }

    private String sanitizeProjectName(String projectName) {
        if (projectName == null || projectName.trim().isEmpty()) {
            return "unnamed_project_" + System.currentTimeMillis();
        }
        return projectName.trim()
                .replaceAll("[^a-zA-Z0-9_-]", "_")
                .toLowerCase()
                .replaceAll("_+", "_")
                .replaceAll("^_+|_+$", ""); // Remove leading/trailing underscores
    }


    public String getBaseMetadataDir() {
        return this.baseMetadataDir;
    }
}