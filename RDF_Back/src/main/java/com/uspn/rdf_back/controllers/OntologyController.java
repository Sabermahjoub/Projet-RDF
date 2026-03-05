package com.uspn.rdf_back.controllers;

import com.uspn.rdf_back.services.OntologyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ontology")
public class OntologyController {

    private final OntologyService ontologyService;

    public OntologyController(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    // =============================
    // TYPES RDF
    // =============================
    @GetMapping("/types")
    public List<String> getTypes() {
        return ontologyService.getAllTypes();
    }

    // =============================
    // PROPRIETES D'UN TYPE
    // =============================
    @GetMapping("/properties")
    public List<String> getProperties(@RequestParam String type) {
        return ontologyService.getPropertiesOfType(type);
    }

    // =============================
    // RESSOURCES D'UN TYPE
    // =============================
    @GetMapping("/resources")
    public List<String> getResources(@RequestParam String type) {
        return ontologyService.getResourcesOfType(type);
    }
}