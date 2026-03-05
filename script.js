// Datos base de productos en quetzales (GTQ)
const productos = [
  {
    id: 1,
    nombre: "Laptop Lenovo IdeaPad i5",
    precioGTQ: 6200,
    imagen: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    nombre: "Monitor LG 24 pulgadas",
    precioGTQ: 1450,
    imagen: "https://images.unsplash.com/photo-1527443224154-c4c7a6d2f27c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    nombre: "Teclado mecanico RGB",
    precioGTQ: 480,
    imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    nombre: "Mouse gamer inalambrico",
    precioGTQ: 350,
    imagen: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    nombre: "Disco SSD 1TB",
    precioGTQ: 790,
    imagen: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    nombre: "Auriculares con microfono",
    precioGTQ: 520,
    imagen: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80"
  }
];

// Estado global de la aplicacion
const estado = {
  carrito: [],
  moneda: "GTQ",
  tasaCambioUSD: 7.8,
  productoVista: null,
  pagoValidado: false
};

// Referencias a elementos del DOM
const refs = {
  productsContainer: document.getElementById("productsContainer"),
  previewImage: document.getElementById("previewImage"),
  previewName: document.getElementById("previewName"),
  previewPrice: document.getElementById("previewPrice"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  clearCart: document.getElementById("clearCart"),
  currencySelect: document.getElementById("currencySelect"),
  themeToggle: document.getElementById("themeToggle"),
  paymentMethod: document.getElementById("paymentMethod"),
  cardFields: document.getElementById("cardFields"),
  cardNumber: document.getElementById("cardNumber"),
  cardCvv: document.getElementById("cardCvv"),
  customerName: document.getElementById("customerName"),
  customerEmail: document.getElementById("customerEmail"),
  validatePayment: document.getElementById("validatePayment"),
  downloadReceipt: document.getElementById("downloadReceipt")
};

// Convierte un valor base en GTQ hacia la moneda seleccionada y lo formatea
function formatearPrecio(valorGTQ) {
  const valorConvertido = estado.moneda === "GTQ" ? valorGTQ : valorGTQ / estado.tasaCambioUSD;
  const locale = estado.moneda === "GTQ" ? "es-GT" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: estado.moneda,
    minimumFractionDigits: 2
  }).format(valorConvertido);
}

// Devuelve el total actual del carrito en GTQ
function obtenerTotalGTQ() {
  return estado.carrito.reduce((acc, item) => acc + item.precioGTQ * item.cantidad, 0);
}

// Renderiza el catalogo de productos
function renderProductos() {
  refs.productsContainer.innerHTML = productos
    .map((producto) => {
      return `
        <article class="product-card">
          <img
            class="product-image"
            src="${producto.imagen}"
            alt="${producto.nombre}"
            data-action="preview"
            data-id="${producto.id}"
          />
          <div class="product-content">
            <h3>${producto.nombre}</h3>
            <p class="price">${formatearPrecio(producto.precioGTQ)}</p>
            <div class="actions-row">
              <button type="button" data-action="agregar" data-id="${producto.id}">Agregar al carrito</button>
              <button type="button" class="btn-secondary" data-action="preview" data-id="${producto.id}">Vista previa</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// Muestra la informacion del producto seleccionado en el panel de vista previa
function mostrarVistaPrevia(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  if (!producto) return;

  estado.productoVista = producto;
  refs.previewImage.src = producto.imagen;
  refs.previewImage.alt = producto.nombre;
  refs.previewName.textContent = producto.nombre;
  refs.previewPrice.textContent = formatearPrecio(producto.precioGTQ);
}

// Agrega un producto al carrito o incrementa su cantidad
function agregarAlCarrito(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  if (!producto) return;

  const existente = estado.carrito.find((item) => item.id === idProducto);
  if (existente) {
    existente.cantidad += 1;
  } else {
    estado.carrito.push({ ...producto, cantidad: 1 });
  }

  // Al modificar el carrito se invalida cualquier validacion anterior de pago
  estado.pagoValidado = false;
  refs.downloadReceipt.disabled = true;

  renderCarrito();

  // Caso de alerta solicitado usando SweetAlert2
  Swal.fire({
    icon: "success",
    title: "Producto agregado",
    text: `${producto.nombre} fue agregado al carrito.`,
    timer: 1300,
    showConfirmButton: false
  });
}

// Quita por completo un producto del carrito
function quitarDelCarrito(idProducto) {
  estado.carrito = estado.carrito.filter((item) => item.id !== idProducto);
  estado.pagoValidado = false;
  refs.downloadReceipt.disabled = true;
  renderCarrito();
}

// Renderiza productos del carrito y total general
function renderCarrito() {
  if (estado.carrito.length === 0) {
    refs.cartItems.innerHTML = '<li class="empty">Tu carrito esta vacio.</li>';
    refs.cartTotal.textContent = `Total: ${formatearPrecio(0)}`;
    return;
  }

  refs.cartItems.innerHTML = estado.carrito
    .map((item) => {
      const subtotalGTQ = item.precioGTQ * item.cantidad;
      return `
        <li>
          <div class="item-meta">
            <strong>${item.nombre}</strong>
            <small>Cantidad: ${item.cantidad}</small>
            <small>Subtotal: ${formatearPrecio(subtotalGTQ)}</small>
          </div>
          <button type="button" class="btn-danger" data-action="quitar" data-id="${item.id}">Quitar</button>
        </li>
      `;
    })
    .join("");

  refs.cartTotal.textContent = `Total: ${formatearPrecio(obtenerTotalGTQ())}`;
}

// Vacia todo el carrito con confirmacion previa
function vaciarCarrito() {
  if (estado.carrito.length === 0) {
    Swal.fire({ icon: "info", title: "Carrito vacio", text: "No hay productos para eliminar." });
    return;
  }

  Swal.fire({
    icon: "warning",
    title: "Vaciar carrito",
    text: "Se eliminaran todos los productos.",
    showCancelButton: true,
    confirmButtonText: "Si, vaciar",
    cancelButtonText: "Cancelar"
  }).then((resultado) => {
    if (!resultado.isConfirmed) return;

    estado.carrito = [];
    estado.pagoValidado = false;
    refs.downloadReceipt.disabled = true;
    renderCarrito();

    Swal.fire({ icon: "success", title: "Carrito vaciado", timer: 1200, showConfirmButton: false });
  });
}

// Muestra u oculta campos de tarjeta segun el metodo elegido
function actualizarCamposPago() {
  const metodo = refs.paymentMethod.value;
  const requiereTarjeta = metodo === "tarjeta";

  refs.cardFields.hidden = !requiereTarjeta;
  refs.cardNumber.required = requiereTarjeta;
  refs.cardCvv.required = requiereTarjeta;

  if (!requiereTarjeta) {
    refs.cardNumber.value = "";
    refs.cardCvv.value = "";
  }
}

// Realiza validaciones del formulario de pago y del carrito
function validarPago() {
  const nombre = refs.customerName.value.trim();
  const correo = refs.customerEmail.value.trim();
  const metodo = refs.paymentMethod.value;

  if (estado.carrito.length === 0) {
    Swal.fire({ icon: "error", title: "Sin productos", text: "Agrega productos antes de pagar." });
    return false;
  }

  if (nombre.length < 3) {
    Swal.fire({ icon: "error", title: "Nombre invalido", text: "Ingresa un nombre completo valido." });
    return false;
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  if (!correoValido) {
    Swal.fire({ icon: "error", title: "Correo invalido", text: "Escribe un correo con formato correcto." });
    return false;
  }

  if (!metodo) {
    Swal.fire({ icon: "error", title: "Metodo requerido", text: "Selecciona un metodo de pago." });
    return false;
  }

  if (metodo === "tarjeta") {
    const numero = refs.cardNumber.value.replace(/\s+/g, "");
    const cvv = refs.cardCvv.value.trim();

    if (!/^\d{16}$/.test(numero)) {
      Swal.fire({ icon: "error", title: "Tarjeta invalida", text: "El numero debe contener 16 digitos." });
      return false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      Swal.fire({ icon: "error", title: "CVV invalido", text: "El CVV debe contener 3 o 4 digitos." });
      return false;
    }
  }

  estado.pagoValidado = true;
  refs.downloadReceipt.disabled = false;

  Swal.fire({
    icon: "success",
    title: "Pago validado",
    text: `Datos correctos. Total a pagar: ${formatearPrecio(obtenerTotalGTQ())}`
  });

  return true;
}

// Crea y descarga un PDF con el detalle de compra
function generarReciboPDF() {
  if (!estado.pagoValidado) {
    Swal.fire({
      icon: "warning",
      title: "Primero valida el pago",
      text: "Debes validar el pago antes de generar el recibo en PDF."
    });
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    Swal.fire({ icon: "error", title: "Error de PDF", text: "No se pudo cargar la libreria jsPDF." });
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;
  doc.setFontSize(18);
  doc.text("Recibo de compra - Tienda de Informatica", 14, y);

  y += 9;
  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleString("es-GT")}`, 14, y);
  y += 7;
  doc.text(`Cliente: ${refs.customerName.value.trim()}`, 14, y);
  y += 7;
  doc.text(`Correo: ${refs.customerEmail.value.trim()}`, 14, y);
  y += 7;
  doc.text(`Moneda mostrada: ${estado.moneda}`, 14, y);

  y += 10;
  doc.setFontSize(12);
  doc.text("Detalle:", 14, y);

  y += 8;
  doc.setFontSize(10);

  estado.carrito.forEach((item, indice) => {
    const subtotalGTQ = item.precioGTQ * item.cantidad;
    const linea = `${indice + 1}. ${item.nombre} x${item.cantidad} - ${formatearPrecio(subtotalGTQ)}`;

    // Si la pagina no tiene espacio suficiente, se agrega otra pagina
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    doc.text(linea, 14, y, { maxWidth: 180 });
    y += 7;
  });

  y += 4;
  const totalGTQ = obtenerTotalGTQ();
  const totalUSD = totalGTQ / estado.tasaCambioUSD;

  doc.setFontSize(11);
  doc.text(
    `Total en GTQ: ${new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(totalGTQ)}`,
    14,
    y
  );

  y += 7;
  doc.text(
    `Total en USD: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalUSD)}`,
    14,
    y
  );

  const nombreArchivo = `recibo_informatica_${Date.now()}.pdf`;
  doc.save(nombreArchivo);

  Swal.fire({ icon: "success", title: "Recibo generado", text: `Se descargo ${nombreArchivo}` });
}

// Cambia entre modo claro y oscuro
function alternarTema() {
  const oscuroActivo = document.body.classList.toggle("dark-mode");
  refs.themeToggle.textContent = oscuroActivo ? "Modo claro" : "Modo oscuro";
}

// Se ejecuta cuando cambia la moneda para refrescar montos visibles
function cambiarMoneda(moneda) {
  estado.moneda = moneda;
  renderProductos();
  renderCarrito();

  if (estado.productoVista) {
    mostrarVistaPrevia(estado.productoVista.id);
  }
}

// Eventos de botones de producto (agregar y vista previa)
refs.productsContainer.addEventListener("click", (evento) => {
  const objetivo = evento.target.closest("[data-action]");
  if (!objetivo) return;

  const idProducto = Number(objetivo.dataset.id);
  const accion = objetivo.dataset.action;

  if (accion === "agregar") {
    agregarAlCarrito(idProducto);
  }

  if (accion === "preview") {
    mostrarVistaPrevia(idProducto);
  }
});

// Evento para quitar elementos del carrito
refs.cartItems.addEventListener("click", (evento) => {
  const boton = evento.target.closest('[data-action="quitar"]');
  if (!boton) return;

  quitarDelCarrito(Number(boton.dataset.id));
});

// Enlaces de controles principales
refs.clearCart.addEventListener("click", vaciarCarrito);
refs.themeToggle.addEventListener("click", alternarTema);
refs.currencySelect.addEventListener("change", (evento) => cambiarMoneda(evento.target.value));
refs.paymentMethod.addEventListener("change", actualizarCamposPago);
refs.validatePayment.addEventListener("click", validarPago);
refs.downloadReceipt.addEventListener("click", generarReciboPDF);

// Inicializa la pantalla con datos base
function iniciarAplicacion() {
  renderProductos();
  renderCarrito();
  mostrarVistaPrevia(productos[0].id);
}

iniciarAplicacion();
