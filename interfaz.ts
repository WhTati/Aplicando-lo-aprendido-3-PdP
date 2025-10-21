
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { GestorTareas } from "./gestorTareas.js";
import type { ItfTarea, Estado, Dificultad } from "./tipos.js";
import { DIFICULTAD, ESTADO_OPC } from "./tipos.js";

// Creamos una instancia de la interfaz 'readline' para poder hacer preguntas al usuario.
const rl = readline.createInterface({ input, output });
// Creamos la instancia principal de nuestro gestor de tareas. Esta variable guardará todas las tareas y manejará la lógica.
const gestorTareas = new (GestorTareas as any)();

export async function menuPrincipal(): Promise<void> {
   
    console.log("\n====== GESTOR DE TAREAS ======");
    console.log("1. Ver mis tareas");
    console.log("2. Buscar una tarea");
    console.log("3. Agregar una tarea");
    console.log("0. Salir");
    console.log("==============================");

    const opcion = await rl.question("Seleccione una opción: ");

    switch (opcion) {
        case '1':
            await menuVerMisTareas(); 
            break;
        case '2':
            await menuBuscarTarea(); 
            break;
        case '3':
            await menuAgregarTarea(); 
            break;
        case '0':
            console.log("\n¡Hasta luego!"); 
            rl.close(); 
            break;
        default:
            console.log("Opción no válida. Inténtelo de nuevo."); 
            await menuPrincipal(); 
            break;
    }
}



// recibe una lista de tareas y muestra.
// También maneja la selección de una tarea para ver sus detalles o para volver al menú anterior.
async function mostrarListadoTareas(tareas: ItfTarea[], menuAnterior: () => Promise<void>): Promise<void> {
   
    if (tareas.length === 0) {
        console.log("\n>> No hay tareas para mostrar en esta vista.");
    } else {
       
        console.log("\n--- Listado de Tareas ---");
        tareas.forEach(t => console.log(t.mostrarResumen()));
        console.log("-------------------------");
    }

   
    const idStr = await rl.question("Ingrese el ID de la tarea para ver detalles, o '0' para volver: ");
    const id = parseInt(idStr, 10);

    
    if (id > 0) {
       
        const tarea = gestorTareas.obtenerTareaPorId(id);
        // la tarea debe existir Y debe estar en la lista que se está mostrando actualmente.
        if (tarea && tareas.some((t: ItfTarea) => t.id === tarea.id)) {
            await menuDetallesTarea(id, () => mostrarListadoTareas(tareas, menuAnterior));
        } else {
            console.log("ID inválido o no pertenece a la lista actual. Inténtelo de nuevo.");
            await mostrarListadoTareas(tareas, menuAnterior); 
        }
    } else if (idStr === '0') {
        await menuAnterior(); 
    } else {
        console.log("Opción no válida.");
        await mostrarListadoTareas(tareas, menuAnterior); 
    }
}



async function menuDetallesTarea(id: number, menuAnterior: () => Promise<void>): Promise<void> {
   
    const tarea = gestorTareas.obtenerTareaPorId(id);
    if (!tarea) {
        console.log(`\n>> Error: No se encontró la tarea con ID ${id}.`);
        await menuAnterior();
        return;
    }

    
    console.log("\n");
    tarea.mostrarDetalle();

  
    const opcion = await rl.question("Presione 'E' para editar, o cualquier otra tecla para volver: ");
    if (opcion.toLowerCase() === 'e') {
        await menuEdicionTarea(id, () => menuDetallesTarea(id, menuAnterior));
    } else {
        await menuAnterior();
    }
}

async function menuEdicionTarea(id: number, menuAnterior: () => Promise<void>): Promise<void> {
    const tarea = gestorTareas.obtenerTareaPorId(id);
    if (!tarea) {
        console.log(`\n>> Error: No se encontró la tarea con ID ${id}.`);
        await menuAnterior();
        return;
    }

    console.log("\n--- Editando Tarea ---");
    console.log("(Deje en blanco para no modificar el valor actual)");

    const nuevoTitulo = await rl.question(`Título (actual: ${tarea.titulo}): `);
    if (nuevoTitulo) tarea.titulo = nuevoTitulo;

    const nuevaDesc = await rl.question(`Descripción (actual: ${tarea.descripcion}): `);
    if (nuevaDesc === ' ') tarea.descripcion = ''; 
    else if (nuevaDesc) tarea.descripcion = nuevaDesc; 

    console.log("Seleccione el nuevo estado:");
    console.log("1. Pendiente, 2. En curso, 3. Terminada, 4. Cancelada");
    const estadoStr = await rl.question(`Estado (actual: ${tarea.estado}): `);
    const nuevoEstadoKey = parseInt(estadoStr, 10);
    if (ESTADO_OPC[nuevoEstadoKey]) {
        tarea.estado = ESTADO_OPC[nuevoEstadoKey];
    }

    console.log("Seleccione la nueva dificultad:");
    console.log("1. Fácil, 2. Medio, 3. Difícil");
    const difStr = await rl.question(`Dificultad (actual: ${tarea.dificultad}): `);
    const nuevaDificultadKey = parseInt(difStr, 10);
    if (DIFICULTAD[nuevaDificultadKey]) {
        tarea.dificultad = DIFICULTAD[nuevaDificultadKey];
    }

    const vencStr = await rl.question(`Fecha Vencimiento (actual: ${tarea.vencimiento?.toLocaleDateString() || 'N/A'}, formato AAAA-MM-DD): `);
    if (vencStr === ' ') tarea.vencimiento = undefined; 
    else if (vencStr) {
        const newDate = new Date(vencStr);
      
        if (!isNaN(newDate.getTime())) tarea.vencimiento = newDate;
        else console.log("Formato de fecha inválido. No se actualizó el vencimiento.");
    }

    console.log("\n>> Tarea guardada exitosamente.");
    await menuAnterior(); 
}



async function menuVerMisTareas(): Promise<void> {
    console.log("\n--- Ver Mis Tareas ---");
    console.log("1. Listar todas las tareas");
    console.log("2. Listar tareas pendientes");
    console.log("3. Listar tareas en curso");
    console.log("4. Listar tareas terminadas");
    console.log("0. Volver al menú principal");

    const opcion = await rl.question("Seleccione una opción: ");
    let tareas: ItfTarea[] = [];
    let filtro: Estado | undefined;

    switch (opcion) {
        case '1': tareas = gestorTareas.listarTareas(); break;
        case '2': filtro = 'pendiente'; tareas = gestorTareas.listarTareas(filtro); break;
        case '3': filtro = 'en curso'; tareas = gestorTareas.listarTareas(filtro); break;
        case '4': filtro = 'terminada'; tareas = gestorTareas.listarTareas(filtro); break;
        case '0': await menuPrincipal(); return;
        default: console.log("Opción no válida."); await menuVerMisTareas(); return;
    }
    await mostrarListadoTareas(tareas, menuVerMisTareas);
}



async function menuBuscarTarea(): Promise<void> {
    console.log("\n--- Buscar Tarea ---");
    const termino = await rl.question("Ingrese el término de búsqueda para el título: ");
    const resultados = gestorTareas.buscarTareas(termino);

    if (resultados.length > 0) {
        console.log(`\n>> Se encontraron ${resultados.length} tareas:`);
       
        await mostrarListadoTareas(resultados, menuPrincipal);
    } else {
        console.log("\n>> No se encontraron tareas con ese título.");
        await menuPrincipal(); 
    }
}



async function menuAgregarTarea(): Promise<void> {
    console.log("\n--- Agregar Nueva Tarea ---");
   
    let titulo = '';
    while (!titulo) {
        titulo = await rl.question("Título: ");
        if (!titulo) console.log("El título es obligatorio.");
    }


    const descripcion = await rl.question("Descripción (opcional): ");

    let dificultad: Dificultad = 'fácil';
    let dificultadSeleccionada = false;
    while (!dificultadSeleccionada) {
        console.log("Dificultad: 1. Fácil, 2. Medio, 3. Difícil");
        const difStr = await rl.question("Seleccione una opción (por defecto será Fácil): ");
        if (difStr === '') {
            dificultadSeleccionada = true; 
        }
        else {
            const difKey = parseInt(difStr, 10);
            if (DIFICULTAD[difKey]) {
                dificultad = DIFICULTAD[difKey];
                dificultadSeleccionada = true;
            } else console.log("Opción de dificultad no válida.");
        }
    }

    let vencimiento: Date | undefined;
    const vencStr = await rl.question("Fecha de Vencimiento (opcional, formato AAAA-MM-DD): ");
    if (vencStr) {
        const newDate = new Date(vencStr);
        if (!isNaN(newDate.getTime())) vencimiento = newDate;
        else console.log("Formato de fecha inválido. La tarea se guardará sin vencimiento.");
    }

   
    gestorTareas.agregarTarea(titulo, descripcion, vencimiento, dificultad);
    console.log("\n>> Tarea agregada exitosamente.");
    await menuPrincipal(); 
}