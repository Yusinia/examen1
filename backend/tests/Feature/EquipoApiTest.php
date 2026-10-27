<?php

use App\Models\Categoria;
use App\Models\Equipo;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Sanctum::actingAs(User::factory()->create());
});

it('crea un equipo y responde 201 con el encabezado Location', function () {
    $categoria = Categoria::factory()->create();

    $datos = [
        'codigo' => 'EQ-1234',
        'nombre' => 'Equipo de prueba',
        'categoria_id' => $categoria->id,
        'fecha_adquisicion' => now()->subDay()->toDateString(),
        'costo_interno' => 100,
    ];

    $respuesta = $this->postJson('/api/equipos', $datos);

    $respuesta
        ->assertCreated()
        ->assertHeader('Location')
        ->assertJsonPath('data.codigo', 'EQ-1234')
        ->assertJsonMissingPath('data.costo_interno');

    $this->assertDatabaseHas('equipos', [
        'codigo' => 'EQ-1234',
    ]);
});

it('rechaza un equipo con datos inválidos y responde 422 con errores por campo', function () {
    $datos = [
        'codigo' => 'incorrecto',
        'nombre' => 'a',
        'categoria_id' => 99999,
        'fecha_adquisicion' => '2099-01-01',
        'costo_interno' => -1,
    ];

    $this->postJson('/api/equipos', $datos)
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'codigo',
            'nombre',
            'categoria_id',
            'fecha_adquisicion',
            'costo_interno',
        ]);
});

it('impide eliminar un equipo prestado y responde 409', function () {
    $equipo = Equipo::factory()->create([
        'estado' => 'prestado',
    ]);

    $this->deleteJson('/api/equipos/'.$equipo->id)
        ->assertStatus(409)
        ->assertJson([
            'mensaje' => 'No se puede eliminar un equipo prestado.',
            'codigo' => 'REGLA_NEGOCIO',
        ]);

    $this->assertDatabaseHas('equipos', [
        'id' => $equipo->id,
    ]);
});