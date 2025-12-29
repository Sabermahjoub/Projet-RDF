package com.uspn.rdf_back.controllers;

import com.uspn.rdf_back.dtos.DataSourceExtern;
import com.uspn.rdf_back.services.DataSourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/DataSource")
@RequiredArgsConstructor
public class DataSourceController {

    private final DataSourceService dataSourceService;


    @PostMapping()
    public ResponseEntity<?> createDataSourceExtern(@RequestBody DataSourceExtern dataSourceExtern) throws Exception {
        dataSourceService.createDataSourceExtern(dataSourceExtern);
        //upload
        return ResponseEntity.ok().build();

    }
}
