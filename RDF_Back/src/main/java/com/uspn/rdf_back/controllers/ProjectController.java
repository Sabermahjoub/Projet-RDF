package com.uspn.rdf_back.controllers;

import com.uspn.rdf_back.dtos.CreateProjectRequest;
import com.uspn.rdf_back.dtos.ProjectDto;
import com.uspn.rdf_back.services.ProjectService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.Map;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/open")
    public Map<String, Object> open(@RequestBody CreateProjectRequest req) {
        ProjectDto dto = projectService.openProject(req.getName(), req.isPersistent(), req.getDescription());
        return Map.of(
                "status", "ok",
                "project", dto.name
        );
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
    // Liste simple
    @GetMapping("/list")
    public List<String> listProjects() {
        return projectService.listProjects();
    }

    // Liste détaillée
    @GetMapping("/list/details")
    public List<Map<String, Object>> listProjectsDetailed() {
        return projectService.listProjectsDetailed();
    }

}
