package com.uspn.rdf_back.dtos;

import java.util.ArrayList;
import java.util.List;

public class CreateRdfEntityRequest {
    public List<String> types = new ArrayList<>();
    public List<RdfPropertyDto> properties = new ArrayList<>();
}