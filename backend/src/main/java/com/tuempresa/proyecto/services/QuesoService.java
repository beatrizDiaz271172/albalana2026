package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.OpenFoodFactsResponse;
import com.tuempresa.proyecto.dtos.QuesoDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;

@Service
public class QuesoService {

    private final WebClient webClient;

    public QuesoService(WebClient.Builder webClientBuilder) {
        // Configuramos la URL base apuntando al subdominio en español
        //https://world.openfoodfacts.org/api/v2/search
        this.webClient = webClientBuilder.baseUrl("https://openfoodfacts.org/api/v2").build();
    }

    public List<QuesoDTO> obtenerQuesosEnEspanol(int cantidad) {
        OpenFoodFactsResponse respuesta = this.webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("categories_tags", "cheeses")
                        .queryParam("fields", "product_name,brands,ingredients_text_es,image_url")
                        .queryParam("page_size", cantidad)
                        .build())
                .retrieve()
                .bodyToMono(OpenFoodFactsResponse.class)
                .block(); // Bloqueamos para obtener el resultado de forma síncrona

        return respuesta != null ? respuesta.getProducts() : List.of();
    }
}
