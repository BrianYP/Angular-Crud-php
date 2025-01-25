import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConexionService {
  private apiUrl = 'http://localhost/Pokemon_Api/index.php';

  constructor(private http: HttpClient) {}

  addPokemon(pokemon: any): Observable<any> {
    console.log('Datos a enviar al servidor:', pokemon);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, pokemon, { headers });
  }

  actualizarPokemonEnBackend(pokemon: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(this.apiUrl, pokemon, { headers });
  }

  eliminarPokemonDelBackend(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete(this.apiUrl, {
      headers,
      body: { id },
    });
  }

  savePokemonFromApi(pokemons: any[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}?fromApi=true`, pokemons, { headers });
  }

  getPokemonsFromDatabase(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

}
