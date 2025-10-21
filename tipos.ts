// tipos.ts

export type Estado = 'pendiente' | 'en curso' | 'terminada' | 'cancelada';
export type Dificultad = 'fácil' | 'medio' | 'difícil';

export const DIFICULTAD: { [key: number]: Dificultad } = {
    1: 'fácil',
    2: 'medio',
    3: 'difícil',
};

export const DIFICULTAD_EMOJI: { [key in Dificultad]: string } = {
    'fácil': '⭐',
    'medio': '⭐⭐',
    'difícil': '⭐⭐⭐',
};

export const ESTADO_OPC: { [key: number]: Estado } = {
    1: 'pendiente',
    2: 'en curso',
    3: 'terminada',
    4: 'cancelada',
};

// Interfaces
export interface ItfTarea {
    id: number;
    titulo: string;
    descripcion: string;
    estado: Estado;
    fechaCreacion: Date;
    vencimiento: Date | undefined;
    dificultad: Dificultad;
    mostrarResumen(): string;
    mostrarDetalle(): void;
}

export interface ItfGestorTareas {
    tareas: ItfTarea[];
    lastId: number;
    agregarTarea(titulo: string, descripcion: string, vencimiento: Date | undefined, dificultad: Dificultad): ItfTarea;
    obtenerTareaPorId(id: number): ItfTarea | undefined;
    listarTareas(filtro?: Estado): ItfTarea[];
    buscarTareas(termino: string): ItfTarea[];
}
