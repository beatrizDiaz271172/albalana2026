package com.tuempresa.proyecto.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QuesoDTO {
    @JsonProperty("product_name")
    private String nombre;

    private String brands;

    @JsonProperty("ingredients_text_es")
    private String ingredientes;

    @JsonProperty("image_url")
    private String imagenUrl;

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getBrands() { return brands; }
    public void setBrands(String brands) { this.brands = brands; }

    public String getIngredientes() { return ingredientes; }
    public void setIngredientes(String ingredientes) { this.ingredientes = ingredientes; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
}
    

