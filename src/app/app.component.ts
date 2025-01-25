import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PokemonService } from './services/pokemon.service';
import { ConexionService } from './services/conexion.service';
import { HttpClientModuleConfig } from './http-client.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModuleConfig, FormsModule], // Agrega FormsModule aquí
})
export class AppComponent implements OnInit {
  title = 'angular-crud';
  pokemonList: any[] = [];
  databasePokemonList: any[] = []; // Lista de Pokémon desde la base de datos
  error: string | null = null;
  isEditing = false;
  editIndex: number | null = null;
  filteredPokemonList: any[] = [];
  pokemonForm: FormGroup;
  searchQuery: string = '';

  constructor(
    private pokemonService: PokemonService,
    private conexionService: ConexionService,
    private fb: FormBuilder
  ) {
    this.pokemonForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      height: [null, Validators.required],
      weight: [null, Validators.required],
      types: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.obtenerTodosLosPokemons();
    this.obtenerPokemonsDesdeBaseDeDatos(); // Cargar los datos desde la base de datos
  }

  obtenerTodosLosPokemons() {
    this.conexionService.getPokemonsFromDatabase().subscribe({
      next: (databasePokemons: any[]) => {
        this.pokemonService.getAllPokemon().subscribe({
          next: async (data: any) => {
            const pokemonDetails = await Promise.all(
              data.results.map((pokemon: any) =>
                this.pokemonService.getPokemonDataByUrl(pokemon.url).toPromise()
              )
            );

            const formattedPokemons = pokemonDetails.map((p) => ({
              name: p.name,
              height: p.height,
              weight: p.weight,
              types: p.types.map((t: any) => t.type.name), // Lista de tipos
              moves: p.moves.slice(0, 5).map((m: any) => m.move.name), // Limitar movimientos
            }));

            // Filtrar Pokémon que ya están en la base de datos
            const nuevosPokemons = formattedPokemons.filter(
              (pokemon) =>
                !databasePokemons.some(
                  (dbPokemon) =>
                    dbPokemon.name === pokemon.name &&
                    dbPokemon.height === pokemon.height &&
                    dbPokemon.weight === pokemon.weight
                )
            );

            if (nuevosPokemons.length > 0) {
              this.conexionService.savePokemonFromApi(nuevosPokemons).subscribe({
                next: (response) => {
                  console.log('Nuevos Pokémon guardados en la base de datos:', response);
                  this.obtenerPokemonsDesdeBaseDeDatos(); // Actualizar la lista en la interfaz
                },
                error: (err) => {
                  console.error('Error al guardar Pokémon en la base de datos:', err);
                  this.error = 'Error al guardar los Pokémon.';
                },
              });
            } else {
              console.log('No hay nuevos Pokémon para guardar.');
            }
          },
          error: () => {
            this.error = 'Error al obtener los datos de los Pokémon.';
          },
        });
      },
      error: (err) => {
        console.error('Error al obtener Pokémon desde la base de datos:', err);
        this.error = 'Error al obtener los Pokémon desde la base de datos.';
      },
    });
  }


  // Nueva función: Obtener Pokémon desde la base de datos
  obtenerPokemonsDesdeBaseDeDatos() {
    this.conexionService.getPokemonsFromDatabase().subscribe({
      next: (data: any) => {
        this.databasePokemonList = data;
        console.log('Pokémon obtenidos desde la base de datos:', data);
        this.error = null;
      },
      error: (err) => {
        console.error('Error al obtener Pokémon desde la base de datos:', err);
        this.error = 'Error al obtener los Pokémon desde la base de datos.';
      },
    });
  }

  agregarPokemon() {
    if (this.pokemonForm.invalid) return;

    const nuevoPokemon = this.pokemonForm.value;
    const body = {
      name: nuevoPokemon.name.trim(),
      height: Number(nuevoPokemon.height),
      weight: Number(nuevoPokemon.weight),
      types: nuevoPokemon.types.split(',').map((t: string) => t.trim()),
      moves: ["tackle", "growl"], // Movimientos predefinidos
    };

    // Enviar a la API para que lo guarde en la base de datos
    this.conexionService.addPokemon(body).subscribe({
      next: () => {
        this.obtenerPokemonsDesdeBaseDeDatos(); // Actualizar la lista desde la base de datos
        this.pokemonForm.reset(); // Limpiar el formulario
      },
      error: (err) => {
        console.error('Error al agregar Pokémon:', err);
        this.error = 'Error al agregar Pokémon.';
      },
    });
  }


  iniciarEdicion(pokemonId: number) {
    const pokemon = this.databasePokemonList.find((p) => p.id === pokemonId);
    if (!pokemon) {
      console.error('El Pokémon seleccionado no existe en la base de datos.');
      return;
    }

    this.isEditing = true;
    this.editIndex = this.databasePokemonList.findIndex((p) => p.id === pokemonId);

    this.pokemonForm.patchValue({
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height,
      weight: pokemon.weight,
      types: Array.isArray(pokemon.types) ? pokemon.types.join(',') : pokemon.types || '',
    });
  }


  actualizarPokemon() {
    if (this.pokemonForm.invalid || this.editIndex === null) return;

    const pokemonActualizado = this.pokemonForm.value;
    pokemonActualizado.types = pokemonActualizado.types.split(',').map((t: string) => t.trim());

    if (!pokemonActualizado.id) {
      console.error('El Pokémon actualizado debe tener un ID.');
      return;
    }

    this.conexionService.actualizarPokemonEnBackend(pokemonActualizado).subscribe({
      next: () => {
        console.log('Pokémon actualizado correctamente en el backend.');
        this.obtenerPokemonsDesdeBaseDeDatos(); // Recarga los datos desde la base de datos
        this.cancelarEdicion();
      },
      error: (err) => {
        console.error('Error al actualizar Pokémon:', err);
        this.error = 'Error al actualizar Pokémon.';
      },
    });
  }

  eliminarPokemon(pokemonId: number) {
    this.conexionService.eliminarPokemonDelBackend(pokemonId).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.message) {
          const index = this.databasePokemonList.findIndex((p) => p.id === pokemonId);
          if (index !== -1) {
            this.databasePokemonList.splice(index, 1);
            this.filteredPokemonList = [...this.databasePokemonList];
          }
          console.log(`Pokémon con ID ${pokemonId} eliminado exitosamente.`);
        } else {
          console.error('Error al eliminar Pokémon:', response.error);
          this.error = 'Error al eliminar Pokémon: ' + response.error;
        }
      },
      error: (err) => {
        console.error('Error al eliminar Pokémon:', err);
        this.error = 'Error al eliminar Pokémon: ' + (err.error?.error || err.message || 'Unknown error');
      },
    });
  }

  cancelarEdicion() {
    this.isEditing = false;
    this.editIndex = null;
    this.pokemonForm.reset();
  }

  onSearchChange() {
    const query = this.searchQuery.toLowerCase();
    this.filteredPokemonList = this.databasePokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );
  }

}
