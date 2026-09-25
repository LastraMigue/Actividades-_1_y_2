# Actividad 2: Integración de JavaScript en el Navegador

## Paso 1: Configuración del proyecto local

He creado en el directorio local los siguientes archivos para realizar el laboratorio:

- `script1.js`, `script2.js` y `script3.js`: Scripts que simulan una carga computacional pesada (50 millones de iteraciones) e intentan modificar el DOM (el elemento con id `titulo`).
- `index.html`: El archivo base sobre el que he ido probando cada escenario modificando las etiquetas `<script>`.

## Paso 2: Análisis de escenarios de ejecución

A continuación, documento lo que ocurre en cada escenario al modificar la forma en la que se integran los scripts en el documento HTML.

### Escenario A (`<script>` en el `<head>`)

- **Código utilizado**: `<script src="script1.js"></script>` dentro del `<head>`.
- **Resultado**: Falla. Salta un mensaje de error en consola porque el navegador ejecuta el script antes de leer el `<body>`, por lo que el elemento `#titulo` es `null`. Además, el bucle bloquea el pintado inicial de la página.

*(Añade aquí tu captura de la Consola mostrando el error en rojo)*

### Escenario B (`<script>` al final del `<body>`)

- **Código utilizado**: `<script src="script1.js"></script>` justo antes del cierre de `</body>`.
- **Resultado**: Funciona. El HTML se parsea primero, el `<h1>` ya existe en el DOM, pero el bucle de 50 millones de iteraciones retrasa la interactividad final.

*(Añade aquí tu captura de la Consola mostrando el mensaje de éxito)*

### Escenario C (`<script async>` en el `<head>`)

- **Código utilizado**: `<script async src="script1.js"></script>` (junto con script2 y script3) en el `<head>`.
- **Resultado**: Indeterminado / Error habitual. Los scripts se descargan en paralelo y se ejecutan inmediatamente al terminar de descargarse, interrumpiendo el parseo HTML. No garantizan el orden de ejecución (pueden ejecutarse 3, luego 1, luego 2) y si descargan rápido, fallarán porque el DOM aún no existe en ese momento.

*(Añade aquí tu captura de la Consola o Network mostrando ejecución desordenada o error de DOM)*

### Escenario D (`<script defer>` en el `<head>`)

- **Código utilizado**: `<script defer src="script1.js"></script>` (junto con script2 y script3) en el `<head>`.
- **Resultado**: Funciona óptimamente. Se descargan en segundo plano sin bloquear el parser HTML y se ejecutan en el estricto orden en que fueron declarados (1, 2, 3) justo cuando el DOM termina de construirse.

*(Añade aquí tu captura de la Consola mostrando la ejecución ordenada de script1, script2 y script3)*

### Escenario E (`<script type="module">` en el `<head>`)

- **Código utilizado**: `<script type="module" src="script1.js"></script>` en el `<head>`.
- **Resultado**: Funciona. Por defecto, los módulos ES6 tienen un comportamiento diferido implícito (similar a `defer`). Se descargan asíncronamente y se ejecutan cuando el DOM está listo, manteniéndose aislados en su propio ámbito (*Module Scope*).

*(Añade aquí tu captura de la Consola confirmando el éxito de la modificación)*
