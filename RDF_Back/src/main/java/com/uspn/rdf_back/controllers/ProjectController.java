package com.uspn.rdf_back.controllers;

import com.uspn.rdf_back.dtos.CreateProjectRequest;
import com.uspn.rdf_back.dtos.ProjectDto;
import com.uspn.rdf_back.services.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // ✅ NOUVEAU : lister les projets existants sur disque
    @GetMapping
    public List<String> listProjects() {
        File projectsDir = new File("projects");
        if (!projectsDir.exists() || !projectsDir.isDirectory()) {
            return List.of();
        }
        return Arrays.stream(projectsDir.listFiles(File::isDirectory))
                .map(File::getName)
                .sorted()
                .collect(Collectors.toList());
    }

    @PostMapping("/open")
    public Map<String, Object> open(@RequestBody CreateProjectRequest req) {
        ProjectDto dto = projectService.openProject(req.getName(), req.isPersistent(), req.getDescription());
        return Map.of("status", "ok", "project", dto.name);
    }

    @GetMapping("/current")
    public ProjectDto current() {
        return projectService.readCurrentProject();
    }

    @PostMapping("/close")
    public Map<String, Object> close() {
        projectService.closeProject();
        return Map.of("status", "ok");
    }
}
