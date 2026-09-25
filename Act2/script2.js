// script2.js
console.log("Inicio script 2");
// Bucle pesado para simular carga computacional de 50 millones de iteraciones
for (let i = 0; i < 50000000; i++) { }

const titulo2 = document.getElementById('titulo');
if (titulo2) {
  titulo2.innerText = 'Cambiado por Script 2';
  console.log("Éxito: Script 2 modificó el título");
} else {
  console.error("Error: El DOM aún no se ha construido (script2)");
}
