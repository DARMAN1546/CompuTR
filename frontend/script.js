const API = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

let computadorSeleccionado = null;

// Formatear precio en pesos colombianos
function formatearPrecio(valor) {
  return '$' + valor.toLocaleString('es-CO');
}

// Mostrar notificacion temporal
function mostrarNotificacion(mensaje, tipo = 'exito') {
  const el = document.getElementById('notificacion');
  el.textContent = mensaje;
  el.className = `notificacion ${tipo}`;
  el.classList.remove('oculto');
  setTimeout(() => el.classList.add('oculto'), 3500);
}

// Cargar y renderizar computadores
async function cargarComputadores() {
  const contenedor = document.getElementById('lista-computadores');
  try {
    const res = await fetch(`${API}/computadores`);
    const datos = await res.json();
    contenedor.innerHTML = '';
    datos.forEach(c => {
      const agotado = c.stock === 0;
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta';
      tarjeta.innerHTML = `
        <span class="badge">${c.tipo}</span>
        <h3>${c.marca} ${c.modelo}</h3>
        <p class="descripcion">${c.descripcion}</p>
        <div class="specs">
          <b>CPU:</b> ${c.procesador}<br>
          <b>RAM:</b> ${c.ram}<br>
          <b>Almacenamiento:</b> ${c.almacenamiento}
        </div>
        <div class="precio">${formatearPrecio(c.precio)}</div>
        <div class="stock-info${agotado ? ' agotado' : ''}">
          ${agotado ? 'Sin stock' : `${c.stock} unidades disponibles`}
        </div>
        <button class="btn-comprar" ${agotado ? 'disabled' : ''} onclick="abrirModal(${c.id})">
          ${agotado ? 'Agotado' : 'Comprar'}
        </button>
      `;
      contenedor.appendChild(tarjeta);
    });
  } catch {
    contenedor.innerHTML = '<p class="vacio">Error al conectar con el servidor. Intenta recargar la pagina.</p>';
  }
}

// Abrir modal con datos del computador
async function abrirModal(id) {
  try {
    const res = await fetch(`${API}/computadores/${id}`);
    computadorSeleccionado = await res.json();

    document.getElementById('modal-titulo').textContent = `Comprar ${computadorSeleccionado.marca} ${computadorSeleccionado.modelo}`;
    document.getElementById('modal-resumen').innerHTML = `
      <strong>${computadorSeleccionado.marca} ${computadorSeleccionado.modelo}</strong><br>
      Precio unitario: <strong>${formatearPrecio(computadorSeleccionado.precio)}</strong><br>
      Stock disponible: ${computadorSeleccionado.stock} unidades
    `;
    document.getElementById('comp-id').value = id;
    document.getElementById('cantidad').max = Math.min(computadorSeleccionado.stock, 5);
    document.getElementById('cantidad').value = 1;
    actualizarTotal();

    document.getElementById('form-compra').reset();
    document.getElementById('comp-id').value = id;
    document.getElementById('cantidad').value = 1;
    actualizarTotal();

    document.getElementById('modal-overlay').classList.remove('oculto');
  } catch {
    mostrarNotificacion('Error al cargar el producto.', 'error');
  }
}

function cerrarModal() {
  document.getElementById('modal-overlay').classList.add('oculto');
  computadorSeleccionado = null;
}

function actualizarTotal() {
  if (!computadorSeleccionado) return;
  const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
  const total = computadorSeleccionado.precio * cantidad;
  document.getElementById('precio-total').textContent = `Total: ${formatearPrecio(total)}`;
}

document.getElementById('cantidad').addEventListener('input', actualizarTotal);

// Realizar la compra
async function realizarCompra(e) {
  e.preventDefault();
  const body = {
    computador_id: document.getElementById('comp-id').value,
    nombre_cliente: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    telefono: document.getElementById('telefono').value,
    direccion: document.getElementById('direccion').value,
    cantidad: parseInt(document.getElementById('cantidad').value)
  };

  try {
    const res = await fetch(`${API}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      mostrarNotificacion(data.error || 'Error al procesar la compra.', 'error');
      return;
    }

    cerrarModal();
    mostrarNotificacion(`Compra exitosa! Total: ${formatearPrecio(data.total_pago)}`, 'exito');
    cargarComputadores();
    cargarVentas();
  } catch {
    mostrarNotificacion('Error de conexion con el servidor.', 'error');
  }
}

// Cargar tabla de ventas
async function cargarVentas() {
  const contenedor = document.getElementById('lista-ventas');
  try {
    const res = await fetch(`${API}/ventas`);
    const ventas = await res.json();

    if (ventas.length === 0) {
      contenedor.innerHTML = '<p class="vacio">No hay ventas registradas aun.</p>';
      return;
    }

    contenedor.innerHTML = `
      <table class="tabla-ventas">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${ventas.map(v => `
            <tr>
              <td>${v.id}</td>
              <td>${v.marca} ${v.modelo}</td>
              <td>${v.nombre_cliente}</td>
              <td>${v.email}</td>
              <td>${v.cantidad}</td>
              <td>${formatearPrecio(v.total_pago)}</td>
              <td>${new Date(v.fecha_venta).toLocaleString('es-CO')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch {
    contenedor.innerHTML = '<p class="vacio">Error al cargar las ventas.</p>';
  }
}

// Resetear datos
async function resetearDatos() {
  if (!confirm('Resetear todos los datos? Esta accion no se puede deshacer.')) return;
  try {
    await fetch(`${API}/reset`, { method: 'POST' });
    mostrarNotificacion('Datos reseteados correctamente.', 'exito');
    cargarComputadores();
    cargarVentas();
  } catch {
    mostrarNotificacion('Error al resetear los datos.', 'error');
  }
}

// Cerrar modal al hacer click fuera
document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) cerrarModal();
});

// Inicializar
cargarComputadores();
cargarVentas();
