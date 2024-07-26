const socket = io();

socket.on("productos", (data) => {
  if (data && Array.isArray(data)) {
    renderProductos(data);
  } else {
    console.error("Datos de productos no válidos:", data);
  }
});

const renderProductos = (data) => {
  const contenedorProductos = document.getElementById("contenedorProductos");
  contenedorProductos.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.innerHTML = `  
      <p>ID: ${item._id}</p>  <!-- Asegúrate de que el campo correcto esté siendo usado -->
      <p>${item.title}</p>
      <p>${item.price}</p>
      <button>Eliminar</button>
    `;
    contenedorProductos.appendChild(card);

    card.querySelector("button").addEventListener("click", () => {
      eliminarProducto(item._id);
    });
  });
};

const eliminarProducto = (id) => {
  socket.emit("eliminarProducto", id);
};

document.getElementById("btnEnviar").addEventListener("click", () => {
  agregarProducto();
});

const agregarProducto = () => {
  const producto = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    img: document.getElementById("img").value,
    code: document.getElementById("code").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
    status: document.getElementById("status").value === "true",
  };

  socket.emit("agregarProducto", producto);
};
