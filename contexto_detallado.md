Guía Maestra de Implementación: Sistema Solidaridad PUCE
Documento Base para Desarrollo
Versión: 3.0 (Solo Lógica Funcional)
Propósito: Detalle paso a paso de la lógica de negocio por Sprints.
SPRINT 1: Operatividad de Crisis y Triaje
Objetivo: Permitir el ingreso masivo de donaciones y usuarios temporales.
1.1 Gestión de Usuarios Voluntarios (Regla de las 48 Horas)
Creación de Usuario:
El formulario para crear un VOLUNTARIO_EXTERNO debe ser mínimo: Solo Nombre o Alias.
Lógica Backend: Al guardar, el sistema debe calcular automáticamente una fecha de expiración: FECHA_ACTUAL + 48 HORAS.
Login (Middleware de Seguridad):
Cada vez que un usuario intente loguearse, el sistema debe verificar:
if (usuario.rol === 'VOLUNTARIO_EXTERNO' && usuario.fecha_expiracion_cuenta < new Date()) {
    bloquearAcceso("Tu cuenta temporal ha expirado. Contacta al administrador.");
}


1.2 Módulo de Ingreso Masivo (Modo Crisis)
Pantalla "Recepción Rápida":
No pedir detalles de productos ni códigos de barras.
Formulario simple:
¿De dónde viene? (Input texto opcional).
¿Cuántos bultos son? (Input numérico).
Peso aproximado (Input numérico).
Acción: Guardar en una tabla de Ingresos_Temporales con estado PENDIENTE.
Regla: Este proceso NO debe tocar la tabla de Productos ni sumar al Inventario general todavía. Es solo un registro de entrada de bultos cerrados.
1.3 Módulo de Triaje (El "Punto Giro")
Funcionamiento:
El sistema muestra una lista de los ingresos temporales pendientes.
Al seleccionar uno, el sistema entra en "Modo Triaje" para procesar el contenido de esos bultos.
El Operador saca un ítem físico de la bolsa y decide en pantalla:
CAMINO A: El ítem sirve (Ingreso a Inventario)
Buscar el producto en el catálogo existente (ej. "Atún").
Ingresar Cantidad y Fecha Caducidad.
El sistema ejecuta el Algoritmo de Lote (ver Sprint 2) y suma al stock oficial.
CAMINO B: El ítem es basura (Descarte)
Operador presiona botón rojo "Descartar".
Sistema pide "Motivo" (Caducado/Roto/Ropa Sucia) y "Peso aprox".
Guardar en un Registro_Descartes.
Importante: No generar ID de producto, ni lote, ni mover inventario. Solo guardar el registro de auditoría.
SPRINT 2: Motor de Inventario (FEFO y Lotes)
Objetivo: Que el sistema administre las caducidades automáticamente.
2.1 Algoritmo de Generación de Lotes
Al ingresar un producto útil en el paso de Triaje (Camino A), el sistema debe generar el código del lote automáticamente siguiendo esta regla estricta para mantener orden:
Lógica del Código:
SI tiene_fecha_caducidad:
    fecha_texto = FORMATO(fecha_caducidad, "YYYYMMDD") // Ej: 20251231
SINO:
    fecha_texto = "SINFECHA"

serial_aleatorio = GENERAR_STRING_ALFANUMERICO(4 caracteres)

CODIGO_LOTE_FINAL = "L" + fecha_texto + "-" + serial_aleatorio
// Resultado Ejemplo: L20251231-X9B2


Comportamiento:
Buscar si ya existe un lote activo con esa misma fecha de caducidad para ese producto específico.
SI EXISTE -> Sumar la nueva cantidad a ese lote existente.
NO EXISTE -> Crear un nuevo registro de Lote con el código generado.
2.2 Estrategia FEFO (First Expire, First Out)
Para garantizar que los productos más viejos salgan primero, el sistema debe ordenar los resultados de búsqueda de esta manera:
Query de Búsqueda de Stock (Backend):
-- Al buscar productos para una salida:
SELECT * FROM Lotes
WHERE id_producto = ? AND cantidad > 0 AND estado = 'ACTIVO'
ORDER BY fecha_caducidad ASC;
-- Resultado: Lo que vence antes, aparece primero en la lista para ser seleccionado.


2.3 Job de Expiración Automática
Tarea Programada (Cron Job):
Ejecutar un script cada noche (ej. 00:00).
Buscar todos los lotes donde fecha_caducidad < FECHA_DE_HOY.
Cambiar su estado a EXPIRADO.
Efecto: Estos lotes ya no deben aparecer disponibles para salidas normales en el buscador, evitando que se entreguen productos vencidos por error.
SPRINT 3: Distribución, Rectificación y Reportes
Objetivo: Sacar la ayuda ordenadamente y reportar el impacto.
3.1 Carrito de Salida (Validaciones de Clima)
Al crear una orden de salida, el sistema debe validar la lógica humanitaria:
Datos Obligatorios: No permitir agregar ítems si no se ha definido primero el Beneficiario y el Motivo (ej. Terremoto, Inundación).
Alerta Climática (Frontend):
El sistema debe comparar la clasificacion_climatica del producto (Sierra/Costa) con el destino ingresado.
Si el usuario añade un producto marcado como SIERRA (ej. Ponchos de lana) y el destino contiene palabras clave como "Esmeraldas" o "Manabí" (Costa).
Acción: Mostrar un Warning visual: "¡Atención! Estás enviando ropa de frío a una zona cálida." (No bloquear la acción, pero sí advertir).
3.2 Rectificación en Despacho (Feature Clave del Admin)
Esta es la función más importante para cuadrar el inventario físico con el digital en tiempo real. Ocurre justo antes de confirmar la salida definitiva.
Escenario: El sistema dice que reservó 50 latas. En el momento de cargar el camión, el Admin cuenta físicamente y solo hay 48 (2 se perdieron o contaron mal antes).
Solución (Modal de Confirmación):
Mostrar un campo editable "Cantidad Real a Despachar" pre-llenado con 50.
El Admin edita y pone 48.
Lógica Backend al Confirmar:
El sistema detecta la diferencia (-2 unidades).
Paso 1: Generar movimiento de salida normal por las 48 unidades reales.
Paso 2: Generar automáticamente un movimiento de "Ajuste de Inventario" (Pérdida/Mermas) por las 2 unidades faltantes, con la glosa automática "Rectificación en Despacho".
Actualizar el stock del lote restando el total (50) para que quede en 0 o en lo correcto.
3.3 Cierre de Orden (Evidencia)
Una orden no se considera terminada hasta que hay pruebas de recepción.
Estado Inicial: DESPACHADO (Cuando sale el camión del centro de acopio).
Acción de Cierre: El usuario debe entrar a la orden y subir una foto o PDF (Acta de Entrega firmada).
Transición: Solo cuando el campo evidencia_url tiene un archivo cargado, el estado cambia a FINALIZADO_CON_EVIDENCIA.
3.4 Fórmulas para Reportes de Impacto
El dashboard debe calcular estos valores en tiempo real basándose únicamente en las órdenes con estado FINALIZADO_CON_EVIDENCIA.
Valor Económico de la Ayuda (Dinero Ahorrado al País):
$$ \text{Impacto Total} = \sum (\text{Cantidad Entregada} \times \text{Precio Referencial del Producto}) + \sum \text{Costos Transporte Externo} $$
Impacto Social (Personas):
$$ \text{Total Beneficiarios} = \sum \text{Campo 'Personas Beneficiadas' de las Cabeceras} $$
Desglose por Motivo:
Generar gráfico agrupando salidas por el campo motivo_salida (ej. 60% Terremoto, 30% Inundación).
