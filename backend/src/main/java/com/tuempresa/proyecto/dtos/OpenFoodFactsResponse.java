package com.tuempresa.proyecto.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class OpenFoodFactsResponse {
    private List<QuesoDTO> products;

    // Getters y Setters
    public List<QuesoDTO> getProducts() { return products; }
    public void setProducts(List<QuesoDTO> products) { this.products = products; }
}

