// Tipo de cambio de referencia (BCCR, ~4 nov 2026: ₡450,31). Actualícelo cuando cambie.
const TIPO_CAMBIO = 450;

const productos = [
  { id: 1, nombre: "Proteína Whey Gold Standard", categoria: "Suplementos", precio: 25000, img: "img/proteina.jpg" },
  { id: 2, nombre: "Pesas 5 kg (par)", categoria: "Gimnasio", precio: 10000, img: "img/pesas.jpg" },
  { id: 3, nombre: "Bandas de resistencia", categoria: "Gimnasio", precio: 12000, img: "img/bandas.jpg" },
  { id: 4, nombre: "Botella deportiva 1 L", categoria: "Accesorios", precio: 7000, img: "img/botella.jpg" },
  { id: 5, nombre: "Conjunto deportivo mujer", categoria: "Ropa", precio: 15000, img: "img/conjunto.jpg" },
  { id: 6, nombre: "Medias Nike", categoria: "Ropa", precio: 8000, img: "img/medias.jpg" },
  { id: 7, nombre: "Camisa de compresión hombre", categoria: "Ropa", precio: 10000, img: "img/camisa.jpg" },
  { id: 8, nombre: "Balón de fútbol", categoria: "Fútbol", precio: 13000, img: "img/balon.jpg" }
];

const $ = (id) => document.getElementById(id);
let moneda = "CRC";
let carrito = []; // [{id, cant}]

const colones = (n) => "₡" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const dolares = (n) => "$" + (n / TIPO_CAMBIO).toFixed(2);
const precio = (n) => (moneda === "CRC" ? colones(n) : dolares(n));
const otro = (n) => (moneda === "CRC" ? dolares(n) : colones(n));

function mostrar() {
  const q = $("buscar").value.trim().toLowerCase();
  const cat = $("categoria").value;
  const max = Number($("rango").value);
  const orden = $("orden").value;
  $("precioMax").textContent = precio(max);

  let lista = productos.filter((p) =>
    (cat === "Todas" || p.categoria === cat) && p.precio <= max &&
    (p.nombre + " " + p.categoria).toLowerCase().includes(q));
  if (orden === "asc") lista.sort((a, b) => a.precio - b.precio);
  if (orden === "desc") lista.sort((a, b) => b.precio - a.precio);
  if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  $("lista").innerHTML = lista.length
    ? lista.map((p) => `
      <article class="card">
        <img src="${p.img}" alt="${p.nombre}" loading="lazy">
        <div class="info">
          <h3>${p.nombre}</h3>
          <span class="cat">${p.categoria}</span>
          <div class="precio">${precio(p.precio)}<small>${otro(p.precio)}</small></div>
          <button class="btn" data-id="${p.id}">Añadir</button>
        </div>
      </article>`).join("")
    : '<p class="vacio">No hay productos con esos filtros.</p>';
}

function dibujarCarrito() {
  const cant = carrito.reduce((s, i) => s + i.cant, 0);
  const total = carrito.reduce((s, i) => s + i.cant * productos.find((p) => p.id === i.id).precio, 0);
  $("contador").textContent = "Carrito: " + cant;
  $("total").textContent = "Total: " + precio(total) + (total ? " (" + otro(total) + ")" : "");
  $("items").innerHTML = carrito.length
    ? carrito.map((i) => {
        const p = productos.find((x) => x.id === i.id);
        return `<div class="fila"><div><strong>${p.nombre}</strong><br><small>${p.categoria}</small></div>
          <span>${precio(p.precio)}</span>
          <div class="cant"><button data-menos="${p.id}" aria-label="Quitar uno">−</button><span>${i.cant}</span><button data-mas="${p.id}" aria-label="Agregar uno">+</button></div></div>`;
      }).join("")
    : "<p>Tu carrito está vacío.</p>";
}

function cambiar(id, d) {
  const item = carrito.find((i) => i.id === id);
  if (item) item.cant += d;
  else if (d > 0) carrito.push({ id, cant: 1 });
  carrito = carrito.filter((i) => i.cant > 0);
  dibujarCarrito();
}

function aviso(t) {
  const a = $("aviso");
  a.textContent = t;
  a.classList.add("ver");
  setTimeout(() => a.classList.remove("ver"), 1500);
}

function panel(abrir) {
  $("panel").classList.toggle("abierto", abrir);
  $("panel").setAttribute("aria-hidden", String(!abrir));
  $("velo").hidden = !abrir;
}

function tema(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("ionic-tema", t); } catch (e) { /* sin almacenamiento */ }
}

// Eventos
$("lista").addEventListener("click", (e) => {
  const b = e.target.closest("[data-id]");
  if (!b) return;
  cambiar(Number(b.dataset.id), 1);
  aviso("Añadido al carrito ✔");
});
$("items").addEventListener("click", (e) => {
  const m = e.target.closest("[data-mas]"), n = e.target.closest("[data-menos]");
  if (m) cambiar(Number(m.dataset.mas), 1);
  if (n) cambiar(Number(n.dataset.menos), -1);
});
["buscar", "categoria", "orden", "rango"].forEach((id) => $(id).addEventListener("input", mostrar));
$("moneda").addEventListener("change", (e) => { moneda = e.target.value; mostrar(); dibujarCarrito(); });
$("btnTema").addEventListener("click", () =>
  tema(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
$("btnCarrito").addEventListener("click", () => panel(true));
$("contador").addEventListener("click", () => panel(true));
$("cerrar").addEventListener("click", () => panel(false));
$("velo").addEventListener("click", () => panel(false));
$("vaciar").addEventListener("click", () => { carrito = []; dibujarCarrito(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") panel(false); });

// Inicio
[...new Set(productos.map((p) => p.categoria))].forEach((c) => {
  const o = document.createElement("option");
  o.value = o.textContent = c;
  $("categoria").appendChild(o);
});
let guardado = null;
try { guardado = localStorage.getItem("ionic-tema"); } catch (e) { /* sin almacenamiento */ }
tema(guardado || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
mostrar();
dibujarCarrito();
