// script3.js
console.log("Inicio script 3");
// Bucle pesado para simular carga computacional de 50 millones de iteraciones
for (let i = 0; i < 50000000; i++) { }

const titulo3 = document.getElementById('titulo');
if (titulo3) {
  titulo3.innerText = 'Cambiado por Script 3';
  console.log("Éxito: Script 3 modificó el título");
} else {
  console.error("Error: El DOM aún no se ha construido (script3)");
}
