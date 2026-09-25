# ACTIVIDADES 1 y 2

Este repositorio contiene la resolución de las Actividades 1 y 2, centradas en la auditoría técnica, el rendimiento web y los diferentes mecanismos de integración de JavaScript en el navegador.

## Actividad 1: Laboratorio de Auditoría y Rendimiento Web

### 1. Auditoría de Red: Análisis Cliente/Servidor (CE a)

Para esta primera auditoría he analizado la web de YouTube. Utilizando las DevTools del navegador con la caché desactivada, he monitorizado el tráfico inicial para determinar la arquitectura de renderizado de la aplicación.

#### Análisis del documento HTML inicial (Doc)

Al filtrar las peticiones por documentos (Doc), detecté que el archivo HTML inicial (`www.youtube.com`) tiene un peso inusualmente grande para ser solo estructura (2,404 kB).

![image1](/resources/image1.png)

Sin embargo, al inspeccionar la pestaña **Response** (Respuesta) de este archivo, comprobé que este peso no corresponde a una página web maquetada y lista para mostrar. El archivo carece del DOM visual final (no hay listado de vídeos, miniaturas ni barra lateral). En su lugar, el servidor envía un "cascarón" básico que contiene masivos bloques de datos en crudo dentro de etiquetas `<script>`.

![image2](/resources/image2.png)

#### Análisis de la carga de JavaScript (JS)

A esto se le suma una carga gigantesca de código en el cliente. Al cambiar el filtro a la pestaña **JS**, la barra de estado de las DevTools revela un dato clave:

![image3](/resources/image3.png)

El tamaño real de los recursos JavaScript que el navegador debe descomprimir y procesar asciende a 14,122 kB (unos 14.1 MB), lo que supone la gran mayoría del peso total de la página (21.9 MB).

#### Conclusión del Modelo (SSR vs CSR)

Basándome en la respuesta vacía de estructura visual del primer HTML y en la descomunal carga de más de 14 MB de código JS, se evidencia que YouTube utiliza un modelo **CSR (Client-Side Rendering)**. El servidor no envía la vista pre-renderizada; sino que delega la responsabilidad en el cliente. Es el navegador el que debe procesar los datos iniciales y ejecutar el motor JavaScript para generar dinámicamente el árbol DOM y pintar la interfaz completa en la pantalla.