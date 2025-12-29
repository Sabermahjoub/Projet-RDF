package com.uspn.rdf_back.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DataSourceExtern {

    private String url;
    private String name;
    private String description;
    private String projectName;

    private LocalDate creationDate;
    private LocalDate lastSynchDate;

}
