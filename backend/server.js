const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Datos en memoria
let computadores = [
  {
    id: 1,
    marca: 'Dell',
    modelo: 'Inspiron 15',
    descripcion: 'Portátil para uso cotidiano y trabajo de oficina. Pantalla Full HD 15.6", procesador Intel Core i5 12va gen.',
    precio: 2800000,
    stock: 8,
    procesador: 'Intel Core i5-1235U',
    ram: '8 GB DDR4',
    almacenamiento: '512 GB SSD',
    tipo: 'Portátil'
  },
  {
    id: 2,
    marca: 'HP',
    modelo: 'Pavilion Gaming 16',
    descripcion: 'Laptop gaming con GPU dedicada. Ideal para videojuegos y diseño gráfico. Pantalla 144Hz.',
    precio: 4500000,
    stock: 5,
    procesador: 'AMD Ryzen 7 6800H',
    ram: '16 GB DDR5',
    almacenamiento: '1 TB SSD NVMe',
    tipo: 'Gaming'
  },
  {
    id: 3,
    marca: 'Lenovo',
    modelo: 'ThinkPad E15',
    descripcion: 'Computador empresarial de alto rendimiento. Construcción robusta, batería de larga duración y teclado ergonómico.',
    precio: 3600000,
    stock: 6,
    procesador: 'Intel Core i7-1255U',
    ram: '16 GB DDR4',
    almacenamiento: '512 GB SSD',
    tipo: 'Empresarial'
  },
  {
    id: 4,
    marca: 'Asus',
    modelo: 'VivoBook 14',
    descripcion: 'Ultrabook compacto y ligero, ideal para estudiantes. Diseño elegante con pantalla OLED.',
    precio: 2200000,
    stock: 10,
    procesador: 'Intel Core i3-1215U',
    ram: '8 GB LPDDR5',
    almacenamiento: '256 GB SSD',
    tipo: 'Ultrabook'
  },
  {
    id: 5,
    marca: 'Apple',
    modelo: 'MacBook Air M2',
    descripcion: 'El portátil más delgado de Apple con chip M2. Rendimiento excepcional y autonomía de hasta 18 horas.',
    precio: 7900000,
    stock: 4,
    procesador: 'Apple M2 (8 núcleos)',
    ram: '8 GB Unificada',
    almacenamiento: '256 GB SSD',
    tipo: 'Premium'
  },
  {
    id: 6,
    marca: 'MSI',
    modelo: 'Katana 15',
    descripcion: 'Laptop gaming de alto rendimiento con RTX 4060. Pantalla 144Hz y sistema de enfriamiento avanzado.',
    precio: 5800000,
    stock: 3,
    procesador: 'Intel Core i7-13620H',
    ram: '16 GB DDR5',
    almacenamiento: '1 TB SSD NVMe',
    tipo: 'Gaming'
  }
];

let ventas = [];
let nextVentaId = 1;

// Obtener todos los computadores
app.get('/computadores', (req, res) => {
  res.json(computadores);
});

// Obtener un computador específico
app.get('/computadores/:id', (req, res) => {
  const comp = computadores.find(c => c.id == req.params.id);
  if (!comp) return res.status(404).json({ error: 'Computador no encontrado' });
  res.json(comp);
});

// Crear nueva venta
app.post('/ventas', (req, res) => {
  const { computador_id, nombre_cliente, email, telefono, cantidad, direccion } = req.body;

  if (!nombre_cliente || !email || !computador_id || !cantidad) {
    return res.status(400).json({ error: 'Nombre, email, computador y cantidad son obligatorios' });
  }

  if (cantidad < 1 || cantidad > 5) {
    return res.status(400).json({ error: 'La cantidad debe ser entre 1 y 5 unidades' });
  }

  const comp = computadores.find(c => c.id == computador_id);
  if (!comp) return res.status(404).json({ error: 'Computador no encontrado' });

  if (comp.stock < cantidad) {
    return res.status(400).json({
      error: `Solo quedan ${comp.stock} unidades disponibles`
    });
  }

  const total_pago = comp.precio * cantidad;

  const nuevaVenta = {
    id: nextVentaId++,
    computador_id: parseInt(computador_id),
    nombre_cliente,
    email,
    telefono: telefono || '',
    direccion: direccion || '',
    cantidad,
    total_pago,
    fecha_venta: new Date().toISOString(),
    marca: comp.marca,
    modelo: comp.modelo
  };

  ventas.push(nuevaVenta);
  comp.stock -= cantidad;

  res.json({
    id: nuevaVenta.id,
    total_pago,
    mensaje: 'Compra realizada exitosamente'
  });
});

// Obtener todas las ventas
app.get('/ventas', (req, res) => {
  res.json(ventas);
});

// Resetear datos
app.post('/reset', (req, res) => {
  computadores.forEach(c => {
    const stockInicial = { 1: 8, 2: 5, 3: 6, 4: 10, 5: 4, 6: 3 };
    c.stock = stockInicial[c.id] ?? 10;
  });
  ventas = [];
  nextVentaId = 1;
  res.json({ mensaje: 'Datos reseteados exitosamente' });
});

// Local: inicia el servidor directamente. Vercel: importa el módulo como handler.
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor de computadores corriendo en http://localhost:${PORT}`);
    console.log('Modo demo - Datos en memoria');
  });
}

module.exports = app;
