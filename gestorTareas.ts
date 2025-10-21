// gestorTareas.ts
import type { ItfTarea, ItfGestorTareas, Estado, Dificultad } from "./tipos.js";
import { DIFICULTAD_EMOJI } from "./tipos.js";

// --- Prototipo Tarea ---
export function Tarea(
    this: ItfTarea,
    id: number,
    titulo: string,
    descripcion: string,
    vencimiento: Date | undefined,
    dificultad: Dificultad
) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.estado = 'pendiente';
    this.fechaCreacion = new Date();
    this.vencimiento = vencimiento;
    this.dificultad = dificultad || 'fácil';
}

Tarea.prototype.mostrarResumen = function(this: ItfTarea): string {
    return `[${this.id}] - ${this.titulo} (${this.estado})`;
};

Tarea.prototype.mostrarDetalle = function(this: ItfTarea): void {
    console.log("-----------------------------------------");
    console.log(`Detalles de la Tarea #${this.id}`);
    console.log("-----------------------------------------");
    console.log(`Título: ${this.titulo}`);
    console.log(`Descripción: ${this.descripcion || '(Sin descripción)'}`);
    console.log(`Estado: ${this.estado}`);
    console.log(`Dificultad: ${DIFICULTAD_EMOJI[this.dificultad]}`);
    console.log(`Fecha de Creación: ${this.fechaCreacion.toLocaleString()}`);
    console.log(`Fecha de Vencimiento: ${this.vencimiento?.toLocaleDateString() || '(Sin vencimiento)'}`);
    console.log("-----------------------------------------");
};

//Prototipo GestorTareas 
export function GestorTareas(this: ItfGestorTareas) {
    this.tareas = [];
    this.lastId = 0;
}

GestorTareas.prototype.agregarTarea = function(
    this: ItfGestorTareas,
    titulo: string,
    descripcion: string,
    vencimiento: Date | undefined,
    dificultad: Dificultad
): ItfTarea {
    this.lastId++;
    const nuevaTarea = new (Tarea as any)(this.lastId, titulo, descripcion, vencimiento, dificultad);
    this.tareas.push(nuevaTarea);
    return nuevaTarea;
};

GestorTareas.prototype.obtenerTareaPorId = function(this: ItfGestorTareas, id: number): ItfTarea | undefined {
    return this.tareas.find((t: ItfTarea) => t.id === id);
};

GestorTareas.prototype.listarTareas = function(this: ItfGestorTareas, filtro?: Estado): ItfTarea[] {
    if (!filtro) return this.tareas;
    return this.tareas.filter((t: ItfTarea) => t.estado === filtro);
};

GestorTareas.prototype.buscarTareas = function(this: ItfGestorTareas, termino: string): ItfTarea[] {
    if (!termino.trim()) return [];
    return this.tareas.filter((t: ItfTarea) => t.titulo.toLowerCase().includes(termino.toLowerCase()));
};
