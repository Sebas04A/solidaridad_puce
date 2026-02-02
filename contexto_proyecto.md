Contexto del Proyecto: Sistema de Gestión de Ayuda Humanitaria - Solidaridad PUCE
1. Visión y Propósito
El objetivo principal es adaptar el sistema de inventario médico existente (IDS) para gestionar un centro de acopio de ayuda humanitaria. A diferencia de un inventario comercial, este sistema prioriza la velocidad de entrega sobre la exactitud milimétrica del stock durante las crisis, y se centra en generar reportes de impacto (¿A quién ayudamos? ¿Cuántas personas? ¿Valor económico?).
2. Actores del Sistema
El sistema maneja cuatro niveles de acceso diferenciados por responsabilidad:
Administrador / Profesor: Control de calidad, validación final de salidas, configuración de valores económicos y gestión de usuarios (CRUD completo). Único autorizado para rectificar inventario en despacho.
Estudiante de Vinculación (Operador): Encargado del triaje, armado de kits, ingresos detallados y gestión operativa diaria.
Voluntario Externo (Staff de Emergencia): Rol temporal con acceso restringido (expira a las 48h). Solo carga bultos y realiza triaje básico. No ve reportes ni datos sensibles.
Visualizador / Auditor: Acceso de solo lectura para ver reportes de impacto y transparencia económica.
3. Cambios Clave en la Lógica de Negocio
El análisis de brechas (GAP Analysis) dicta que debemos migrar de una lógica de "Insumos Médicos" a "Ayuda Humanitaria".
Entidades Principales Modificadas
Donantes: Reemplaza a "Proveedores". Pueden ser personas o empresas. Incluye opción de "Anónimo" para proteger identidad en reportes públicos.
Productos: Catálogo dinámico y heterogéneo (Ropa, Comida, Juguetes).
Nuevo Atributo Crítico: Clasificación Climática (Costa/Calor vs. Sierra/Frío) para evitar errores en donaciones (ej. no enviar abrigos a clima cálido).
Valoración: Precio referencial estimado para reportes de ahorro económico, no para venta.
Lotes y Caducidad: Implementación estricta de FEFO (First Expire, First Out). Los lotes se generan automáticamente: L + FECHA + SERIAL.
Egresos (Impacto): La salida no es una venta, es una donación. Requiere obligatoriamente un Beneficiario (Comunidad/Sector) y un Motivo (ej. Terremoto).
4. Flujos Críticos
Ingreso Dual:
Flujo Normal: Registro detallado ítem por ítem.
Flujo Crisis: Ingreso masivo por bultos/peso -> Almacenamiento temporal -> Triaje diferido.
Punto Giro (Descarte): Los artículos que no sirven (basura/rotos) se descartan ANTES de entrar al inventario oficial. El sistema solo guarda un log de rechazos, pero no "contamina" el stock.
Rectificación en Despacho: Permite ajustar el inventario en el último segundo (al cargar el camión) si el conteo físico no coincide con el sistema, registrando la merma automáticamente.
