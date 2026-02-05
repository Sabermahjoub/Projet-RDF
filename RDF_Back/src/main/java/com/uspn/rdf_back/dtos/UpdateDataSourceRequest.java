package com.uspn.rdf_back.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDataSourceRequest {
    private String longName;
    private String description;
}
