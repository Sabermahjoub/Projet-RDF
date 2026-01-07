package com.uspn.rdf_back.services;

import com.uspn.rdf_back.core.ProjectContext;
import com.uspn.rdf_back.core.RdfContexts;
import com.uspn.rdf_back.core.RdfNamespaces;
import com.uspn.rdf_back.dtos.ProjectDto;
import org.eclipse.rdf4j.model.IRI;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.model.vocabulary.DCTERMS;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.model.vocabulary.RDFS;
import org.eclipse.rdf4j.repository.Repository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.eclipse.rdf4j.repository.sail.SailRepository;
import org.eclipse.rdf4j.sail.nativerdf.NativeStore;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ProjectService {

    private static final IRI TYPE_PROJECT = org.eclipse.rdf4j.model.impl.SimpleValueFactory.getInstance()
            .createIRI(RdfNamespaces.APP, "Project");

    private IRI projectIri(ValueFactory vf, String projectName) {
        return vf.createIRI(RdfNamespaces.APP + "project/" + projectName);
    }

    private IRI metadataCtx(ValueFactory vf) {
        return vf.createIRI(RdfContexts.CTX_META);
    }

    /**
     * Ouvre (ou crée) le repository RDF4J du projet et écrit les métadonnées du projet en RDF.
     */
    public ProjectDto openProject(String name, boolean persistent, String description) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Nom de projet obligatoire.");
        }

        // 1) Fermer un projet déjà ouvert
        ProjectContext.close();

        // 2) Créer / ouvrir le store
        Repository repo = createRepository(name, persistent);
        repo.init();
        ProjectContext.set(repo, name);

        // 3) Écrire (ou mettre à jour) les métadonnées RDF du projet
        upsertProjectMetadata(name, description);

        // 4) Retour DTO
        return readCurrentProject();
    }

    private Repository createRepository(String projectName, boolean persistent) {
        // Ici on persiste sur disque (NativeStore). persistent=false pourrait être MemoryStore,
        // mais on garde simple pour vous.
        File dir = new File("projects/" + projectName + "/store");
        dir.mkdirs();
        return new SailRepository(new NativeStore(dir));
    }

    private void upsertProjectMetadata(String projectName, String description) {
        Repository repo = ProjectContext.getRepository();
        try (RepositoryConnection conn = repo.getConnection()) {
            ValueFactory vf = conn.getValueFactory();
            IRI project = projectIri(vf, projectName);
            IRI ctx = metadataCtx(vf);

            String now = OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            String today = LocalDate.now().toString();

            conn.begin();

            // Type + label
            conn.add(project, RDF.TYPE, TYPE_PROJECT, ctx);
            conn.remove(project, RDFS.LABEL, null, ctx);
            conn.add(project, RDFS.LABEL, vf.createLiteral(projectName), ctx);

            // created : si absent, on le met (on ne l’écrase pas)
            boolean hasCreated = conn.hasStatement(project, DCTERMS.CREATED, null, false, ctx);
            if (!hasCreated) {
                conn.add(project, DCTERMS.CREATED, vf.createLiteral(today), ctx);
            }

            // modified : mis à jour à chaque open
            conn.remove(project, DCTERMS.MODIFIED, null, ctx);
            conn.add(project, DCTERMS.MODIFIED, vf.createLiteral(now), ctx);

            // description : optionnel
            if (description != null) {
                conn.remove(project, DCTERMS.DESCRIPTION, null, ctx);
                conn.add(project, DCTERMS.DESCRIPTION, vf.createLiteral(description), ctx);
            }

            conn.commit();
        }
    }
    public String getCurrentProjectName() {
        ProjectDto dto = new ProjectDto();
        dto.open = ProjectContext.isOpen();

        if (!dto.open) {
            return null; // open=false et tout le reste null
        }

        String name = ProjectContext.getProjectName();

        return name;
    }

    public ProjectDto readCurrentProject() {
        ProjectDto dto = new ProjectDto();
        dto.open = ProjectContext.isOpen();

        if (!dto.open) {
            return dto; // open=false et tout le reste null
        }

        String name = ProjectContext.getProjectName();
        dto.name = name;

        try (RepositoryConnection conn = ProjectContext.getRepository().getConnection()) {
            ValueFactory vf = conn.getValueFactory();
            IRI project = projectIri(vf, name);
            IRI ctx = metadataCtx(vf);

            // read description
            var descSt = conn.getStatements(project, DCTERMS.DESCRIPTION, null, ctx).stream().findFirst().orElse(null);
            dto.description = (descSt != null) ? descSt.getObject().stringValue() : null;

            var createdSt = conn.getStatements(project, DCTERMS.CREATED, null, ctx).stream().findFirst().orElse(null);
            dto.created = (createdSt != null) ? createdSt.getObject().stringValue() : null;

            var modifiedSt = conn.getStatements(project, DCTERMS.MODIFIED, null, ctx).stream().findFirst().orElse(null);
            dto.modified = (modifiedSt != null) ? modifiedSt.getObject().stringValue() : null;
        }

        return dto;
    }

    public void closeProject() {
        ProjectContext.close();
    }
}
