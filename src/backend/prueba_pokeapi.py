from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Permitir todas las solicitudes a rutas bajo /api

# Ruta para recibir el nombre del Pokémon y devolver la información en JSON
@app.route('/api/pokemon', methods=['POST'])
def obtener_datos_pokemon():
    data = request.json  # Obtener los datos JSON enviados desde el cliente
    pokemon_name = data.get('pokemon_name', '').strip().lower()  # Limpiar el nombre del Pokémon

    if not pokemon_name:
        return jsonify({"error": "El nombre del Pokémon es requerido."}), 400

    # Hacer la solicitud a la PokéAPI
    url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_name}"
    response = requests.get(url)

    if response.status_code == 200:
        pokemon_data = response.json()
        # Estructurar la respuesta JSON que quieres enviar de vuelta
        result = {
            "name": pokemon_data['name'],
            "id": pokemon_data['id'],
            "height": pokemon_data['height'],
            "weight": pokemon_data['weight'],
            "types": [t['type']['name'] for t in pokemon_data['types']],
            "moves": [m['move']['name'] for m in pokemon_data['moves'][:5]]  # Limitar a 5 movimientos
        }
        return jsonify(result), 200
    else:
        return jsonify({"error": f"Pokémon '{pokemon_name}' no encontrado."}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
