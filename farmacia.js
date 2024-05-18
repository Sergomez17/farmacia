const readlineSync = require('readline-sync');

// Nodo para lista enlazada
class Nodo {
    constructor(valor) {
        this.valor = valor;
        this.siguiente = null;
    }
}

// Lista enlazada
class Lista {
    constructor() {
        this.cabeza = null;
    }

    // Método - Agrega un nodo al final de la lista
    agregar(valor) {
        let nuevoNodo = new Nodo(valor);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
    }

    // Método - Convierte la lista a un arreglo
    aArreglo() {
        let arreglo = [];
        let actual = this.cabeza;
        while (actual) {
            arreglo.push(actual.valor);
            actual = actual.siguiente;
        }
        return arreglo;
    }
}

// Clase Persona - Define la estructura y comportamiento asociado con una persona.
class Persona {
    constructor(nombre, edad, genero, regimen, ingreso, nivelSisben) {
        this.nombre = nombre;
        this.edad = edad;
        this.genero = genero;
        this.regimen = regimen;
        this.ingreso = ingreso;
        this.nivelSisben = nivelSisben || null;
    }

    calcularDescuento(costoPrueba) {
        let descuento = 0;
        if (this.nivelSisben) {
            const tasasDescuento = { 'A': 0.20, 'B1': 0.15, 'B2': 0.10 };
            descuento = costoPrueba * (tasasDescuento[this.nivelSisben] || 0);
        }
        if (this.regimen === 'contributivo' && this.ingreso > 3000) {
            descuento += costoPrueba * 0.05; // Descuento adicional para ingresos altos
        }
        return descuento;
    }
}

// Clase Laboratorio - Representa un laboratorio que puede contener múltiples pruebas.
class Laboratorio {
    constructor(nombre) {
        this.nombre = nombre;
        this.pruebas = new Lista(); // Usamos la lista enlazada
    }

    agregarPrueba(prueba) {
        this.pruebas.agregar(prueba);
    }
}

// Clase Prueba - Representa una prueba médica específica.
class Prueba {
    constructor(nombre, tipo, costo) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.costo = costo;
        this.personas = new Lista(); // Usamos la lista enlazada
    }

    agregarPersona(persona) {
        this.personas.agregar(persona);
    }

    calcularCostoFinal() {
        let totalCosto = 0;
        let descuentosPorSisben = {};
        let personasArray = this.personas.aArreglo();
        for (let persona of personasArray) {
            let descuento = persona.calcularDescuento(this.costo);
            let nivelSisben = persona.nivelSisben || 'ninguno';
            descuentosPorSisben[nivelSisben] = (descuentosPorSisben[nivelSisben] || 0) + descuento;
            totalCosto += this.costo - descuento;
        }
        return { totalCosto, descuentosPorSisben };
    }
}

// Clase Farmaceutica - Representa una compañía farmacéutica que administra múltiples laboratorios.
class Farmaceutica {
    constructor() {
        this.laboratorios = new Lista(); // Usamos la lista enlazada
    }

    agregarLaboratorio(laboratorio) {
        this.laboratorios.agregar(laboratorio);
    }

    calcularIngresosTotales() {
        let total = 0;
        let ingresosPorRegimen = { contributivo: 0, subsidiado: 0 };
        let ingresosPorTipo = {};
        let descuentosPorSisben = {};
        
        let laboratoriosArray = this.laboratorios.aArreglo();
        for (let laboratorio of laboratoriosArray) {
            let pruebasArray = laboratorio.pruebas.aArreglo();
            for (let prueba of pruebasArray) {
                let resultado = prueba.calcularCostoFinal();
                total += resultado.totalCosto;
                
                prueba.personas.aArreglo().forEach(persona => {
                    ingresosPorRegimen[persona.regimen] += prueba.costo - persona.calcularDescuento(prueba.costo);
                });

                ingresosPorTipo[prueba.tipo] = (ingresosPorTipo[prueba.tipo] || 0) + resultado.totalCosto;

                for (const nivel in resultado.descuentosPorSisben) {
                    descuentosPorSisben[nivel] = (descuentosPorSisben[nivel] || 0) + resultado.descuentosPorSisben[nivel];
                }
            }
        }

        return {
            total,
            ingresosPorRegimen,
            ingresosPorTipo,
            descuentosPorSisben,
            promedioIngresoPorLaboratorio: total / laboratoriosArray.length
        };
    }
}

// Función principal que maneja la lógica de entrada de usuario y la ejecución del programa.
function main() {
    let farmaceutica = new Farmaceutica();
    let seguir = true;

    while (seguir) {
        let nombreLaboratorio = readlineSync.question('\nNombre del laboratorio: ');
        let laboratorio = new Laboratorio(nombreLaboratorio);
        farmaceutica.agregarLaboratorio(laboratorio);

        let agregarPrueba = true;
        while (agregarPrueba) {
            let nombrePrueba = readlineSync.question('\nNombre de la prueba: ');
            let tipoPrueba = readlineSync.question('Tipo de prueba: ');
            let costoPrueba = +readlineSync.question('Costo de la prueba: ');
            let prueba = new Prueba(nombrePrueba, tipoPrueba, costoPrueba);
            laboratorio.agregarPrueba(prueba);

            let agregarPersona = true;
            while (agregarPersona) {
                let nombrePersona = readlineSync.question('Nombre de la persona: ');
                let edadPersona = +readlineSync.question('Edad de la persona: ');
                let generoPersona = readlineSync.question('Género de la persona: ');
                let regimenPersona = readlineSync.question('Régimen (subsidiado/contributivo): ');
                let ingresoPersona = +readlineSync.question('Ingreso mensual de la persona: ');
                let nivelSisben = readlineSync.question('Nivel Sisben (A, B1, B2, ninguno): ');
                nivelSisben = nivelSisben !== 'ninguno' ? nivelSisben : null;
                let persona = new Persona(nombrePersona, edadPersona, generoPersona, regimenPersona, ingresoPersona, nivelSisben);
                prueba.agregarPersona(persona);

                agregarPersona = readlineSync.question('¿Agregar otra persona a esta prueba? (s/n): ').toLowerCase() === 's';
            }

            agregarPrueba = readlineSync.question('¿Agregar otra prueba al laboratorio? (s/n): ').toLowerCase() === 's';
        }

        seguir = readlineSync.question('¿Registrar otro laboratorio? (s/n): ').toLowerCase() === 's';
    }

    let resultados = farmaceutica.calcularIngresosTotales();
    console.log('Ingresos totales: $', resultados.total.toFixed(2));
    console.log('Ingresos por régimen:', resultados.ingresosPorRegimen);
    console.log('Ingresos por tipo de examen:', resultados.ingresosPorTipo);
    console.log('Descuentos por SISBEN:', resultados.descuentosPorSisben);
    console.log('Promedio de ingreso por laboratorio: $', resultados.promedioIngresoPorLaboratorio.toFixed(2));
}
main();