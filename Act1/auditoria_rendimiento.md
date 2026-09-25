# Actividad 1: Laboratorio de Auditoría y Rendimiento Web

## 1. Auditoría de Red: Análisis Cliente/Servidor

Para esta primera auditoría he analizado la web de YouTube. Utilizando las DevTools del navegador con la caché desactivada, he monitorizado el tráfico inicial para determinar la arquitectura de renderizado de la aplicación.

### Análisis del documento HTML inicial (Doc)

Al filtrar las peticiones por documentos (Doc), detecté que el archivo HTML inicial (`www.youtube.com`) tiene un peso inusualmente grande para ser solo estructura (2,404 kB).

![image1](./resources/image1.png)

Sin embargo, al inspeccionar la pestaña **Response** (Respuesta) de este archivo, comprobé que este peso no corresponde a una página web maquetada y lista para mostrar. El archivo carece del DOM visual final (no hay listado de vídeos, miniaturas ni barra lateral). En su lugar, el servidor envía un "cascarón" básico que contiene masivos bloques de datos en crudo dentro de etiquetas `<script>`.

![image2](./resources/image2.png)

### Análisis de la carga de JavaScript (JS)

A esto se le suma una carga gigantesca de código en el cliente. Al cambiar el filtro a la pestaña **JS**, la barra de estado de las DevTools revela un dato clave:

![image3](./resources/image3.png)

El tamaño real de los recursos JavaScript que el navegador debe descomprimir y procesar asciende a 14,122 kB (unos 14.1 MB), lo que supone la gran mayoría del peso total de la página (21.9 MB).

### Conclusión del Modelo (SSR vs CSR)

Basándome en la respuesta vacía de estructura visual del primer HTML y en la descomunal carga de más de 14 MB de código JS, se evidencia que YouTube utiliza un modelo **CSR (Client-Side Rendering)**. El servidor no envía la vista pre-renderizada; sino que delega la responsabilidad en el cliente. Es el navegador el que debe procesar los datos iniciales y ejecutar el motor JavaScript para generar dinámicamente el árbol DOM y pintar la interfaz completa en la pantalla.

## 2. Destripando el Motor: Análisis de Rendimiento

Continuando con la auditoría técnica sobre YouTube, he utilizado la pestaña Performance (Rendimiento) de las DevTools para analizar el comportamiento del hilo principal (Main thread) y la carga computacional que soporta el navegador durante la interacción con la plataforma.

### Metodología y perfilado en DevTools

Para capturar la actividad del motor JavaScript, accedí a la pestaña Performance para configurar el entorno de pruebas antes de iniciar la monitorización.

![image4](./resources/image4.png)

Inicié la grabación en el panel Performance (botón Record o Ctrl + E) y realicé interacciones continuas sobre la página de YouTube (desplazamiento vertical o scroll y exploración de elementos) durante un intervalo de 5 segundos. Tras detener la grabación, el navegador procesó el perfil generando el mapa completo de rendimiento en el hilo principal.

![image5](./resources/image5.png)

### Fases de ejecución del motor JavaScript

Al inspeccionar las barras de la línea de tiempo en la sección Main, he localizado los eventos clave que ejecuta el motor de JavaScript para procesar la página:

- **Parse HTML (Azul)**: El navegador analiza la estructura del documento HTML y construye el árbol DOM. Al tratarse de una SPA altamente dinámica como YouTube, este proceso se intercala constantemente con la ejecución de código.
- **Compile Code (Amarillo)**: Muestra el trabajo del Compilador JIT (Just-In-Time). JavaScript no utiliza una compilación previa (Ahead-Of-Time). En su lugar, el motor toma el código fuente en texto plano descargado de la red y lo traduce a código máquina optimizado en tiempo real justo antes de ser ejecutado.
- **Evaluate Script (Amarillo)**: Es la fase en la que el motor ejecuta las instrucciones máquina ya compiladas, encargándose de procesar la lógica de la aplicación, gestionar los eventos de interacción y renderizar los nuevos elementos visuales.

### Comparativa de motores de navegador

Dado que he realizado esta prueba en un navegador basado en Chromium (como Google Chrome o Microsoft Edge), el motor encargado de este proceso es V8. Sin embargo, la gestión interna varía según el entorno de ejecución:

- **V8 (Google Chrome / Edge)**: Utiliza un sistema JIT de varias etapas (intérprete Ignition + compilador optimizador TurboFan) para lograr una compilación rápida y eficiente.
- **JavaScriptCore / Nitro (Safari)**: Es el motor desarrollado por Apple para entornos WebKit, optimizado para minimizar el consumo energético en dispositivos macOS e iOS.
- **SpiderMonkey (Mozilla Firefox)**: El motor histórico de Mozilla, dotado de su propia arquitectura de compilación JIT multinivel (WarpMonkey).

A pesar de las diferencias de arquitectura entre V8, JavaScriptCore y SpiderMonkey, todos ellos comparten la necesidad de aplicar compilación JIT para procesar la enorme carga de scripts que requiere una web CSR como YouTube.

## 3. El Sandbox en acción: Límites de Seguridad

En esta tercera prueba he analizado las restricciones de ejecución de scripts y el aislamiento de seguridad que impone el navegador, utilizando para ello la pestaña Console (Consola) de las DevTools sobre la página de YouTube.

### Ejecución de código en memoria vs. Intento de acceso al disco duro

En primer lugar, ejecuté una instrucción inofensiva de declaración de variable e impresión en memoria:

```javascript
const a = "eoo"; console.log(a);
```

El motor procesó la instrucción inmediatamente imprimiendo el resultado "eoo", ya que se trata de una operación básica acotada únicamente a la memoria volátil del hilo de ejecución.

A continuación, simulé una acción maliciosa intentando instanciar la API FileReader para leer directamente un archivo sensible del sistema operativo (C:/Windows/system.ini) pasando la ruta como texto plano:

```javascript
const r = new FileReader();
r.readAsText("C:/Windows/system.ini");
r.onload = function(){ console.log(r.result); }
```

![image6](./resources/image6.png)

### Análisis del error y limitaciones del Sandbox

Al ejecutar el script de lectura, el motor bloqueó la acción de inmediato lanzando el error de tipo:

```text
VM4904:2 Uncaught TypeError: Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'.
```

Este comportamiento evidencia el funcionamiento del Sandbox (caja de arena) del navegador y sus mecanismos de protección:

- **Consentimiento explícito del usuario**: La API FileReader no acepta rutas absolutas en texto plano por motivos de seguridad. Exige obligatoriamente un objeto de tipo Blob o File, el cual únicamente se puede obtener si el usuario selecciona de forma explícita y voluntaria un archivo a través de un componente `<input type="file">` o arrastrándolo a la página.
- **Aislamiento de recursos (I/O del sistema)**: El Sandbox impide que el código JavaScript ejecutado dentro de la pestaña del navegador pueda realizar llamadas directas al sistema de archivos local o acceder a la memoria del sistema operativo.

### Importancia vital del Sandbox para el usuario

El Sandbox es el pilar fundamental de la seguridad en la web moderna. Si esta barrera de aislamiento no existiera, cualquier sitio web que visitáramos (como YouTube o cualquier página de terceros) podría ejecutar scripts en segundo plano para explorar nuestro disco duro, exfiltrar datos personales, leer claves privadas, extraer contraseñas guardadas o infectar el sistema operativo sin interacción ni permiso previo del usuario.

## 4. Análisis de Bloqueo y Asincronía en el Scripting Web

En este cuarto apartado de la auditoría sobre YouTube, he analizado el impacto en la experiencia de usuario que tendría la carga de scripts de gran volumen si se procesaran mediante el modelo de programación síncrono tradicional, en lugar de utilizar el modelo asíncrono orientado a eventos propio de la web moderna.

### Identificación del script pesado (>1MB)

Al inspeccionar el tráfico de red en la pestaña Network de las DevTools filtrando por archivos JS y ordenándolos por tamaño, he localizado el script principal de infraestructura de la plataforma, denominado `base.js`.

Este archivo presenta un tamaño de 2.598 kB (aproximadamente 2,6 MB en memoria), superando holgadamente el umbral de 1 MB establecido para el análisis.

![image7](./resources/image7.png)

### Escenario Síncrono Tradicional: El problema del bloqueo (Blocking)

En la programación síncrona tradicional, la ejecución del código sigue una secuencia estrictamente lineal. Si un recurso de este volumen como `base.js` (~2,6 MB) se cargase de manera síncrona mediante una etiqueta `<script>` convencional:

- **Bloqueo del Parser HTML**: El navegador detendría inmediatamente el análisis del documento y la construcción del árbol DOM al encontrar la etiqueta del script.
- **Descarga y Compilación Bloqueante**: El hilo principal (Main Thread) del navegador quedaría completamente congelado esperando la descarga completa del archivo a través de la red y su posterior fase de parseo y compilación JIT.
- **Impacto devastador en la UX**: Durante todo el tiempo que el hilo principal permanezca bloqueado, el navegador no podría pintar ningún elemento en pantalla (Render Blocking). El usuario experimentaría una pantalla en blanco (White Screen of Death), la interfaz no respondería a clics ni a desplazamientos (scroll), e incluso el navegador podría desplegar el aviso de "Página no responde".

### Ventajas de la Asincronía y el Modelo Orientado a Eventos

La web moderna y arquitecturas como la de YouTube evitan este bloqueo crítico gracias al bucle de eventos (Event Loop) y al procesamiento asíncrono:

- **Carga No Bloqueante (async / defer y Fetch/Promises)**: Los scripts pesados como `base.js` se descargan en segundo plano mientras el navegador continúa procesando el HTML y renderizando la estructura visual de la página.
- **Event Loop y Tareas Asíncronas**: El procesamiento del código JavaScript no se ejecuta de un solo golpe, sino que se divide en pequeñas tareas que se introducen en la cola del Event Loop. Esto permite que el motor alterne la ejecución del código con el redibujado de la pantalla (Repaint) y la atención inmediata a los eventos del usuario (clics, teclado, scroll).
- **Interfaz Interactiva Inmediata**: Gracias a la asincronía, el usuario puede empezar a ver contenido en YouTube e interactuar con la interfaz en cuestión de milisegundos, sin necesidad de esperar a que finalice la descarga y procesamiento completo de los 2,6 MB de código en segundo plano.

En conclusión, la asincronía y la arquitectura orientada a eventos son indispensables para la viabilidad de aplicaciones web complejas, transformando scripts masivos que de otro modo congelarían el navegador en recursos que se procesan de forma fluida sin degradar la experiencia de usuario.
