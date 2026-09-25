// script1.js
console.log("Inicio script 1");
// Bucle pesado para simular carga computacional de 50 millones de iteraciones
for (let i = 0; i < 50000000; i++) { }

const titulo = document.getElementById('titulo');
if (titulo) {
  titulo.innerText = 'Cambiado por Script 1';
  console.log("Éxito: Script 1 modificó el título");
} else {
  console.error("Error: El DOM aún no se ha construido (script1)");
}
