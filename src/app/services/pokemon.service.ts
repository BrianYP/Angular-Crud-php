import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getAllPokemon(): Observable<any> {
    // Trae los primeros 150 Pokémon. Puedes ajustar el límite si es necesario.
    return this.http.get(`${this.apiUrl}?limit=150&offset=0`);
  }

  getPokemonDataByUrl(url: string): Observable<any> {
    return this.http.get(url);
  }
}
