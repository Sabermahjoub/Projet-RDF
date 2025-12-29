package com.uspn.rdf_back.services;

import com.uspn.rdf_back.dtos.DataSourceExtern;
import com.uspn.rdf_back.utils.CsvFileHandler;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DataSourceService {

    private final CsvFileHandler csvFileHandler;
    public static final String  projectsPath = "projects";


    public void createDataSourceExtern(DataSourceExtern dataSourceExtern) throws Exception {
        var projectDir = projectsPath+"/"+dataSourceExtern.getProjectName();
        if (this.directoryExists(projectDir)) {

            var data = dataSourceExtern.getUrl()+","+dataSourceExtern.getName()+","+dataSourceExtern.getDescription()+","+ LocalDate.now().toString()+","+LocalDate.now().toString()+"\n";
            csvFileHandler.appendToCsv(projectDir+"/extern.csv",data);
        }
        else{
            throw new Exception("Projet Doesn't exist");
        }

    }


    public boolean directoryExists(String directoryPath) {
        Path path = Paths.get(directoryPath);
        return Files.exists(path) && Files.isDirectory(path);
    }


}
