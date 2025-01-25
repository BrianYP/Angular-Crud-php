import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  constructor(private http: HttpClient) {}

  // Método para obtener la información del Pokémon
  getPokemonData(pokemonName: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { pokemon_name: pokemonName.trim().toLowerCase() };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
