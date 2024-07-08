const socket = io();

const contenedorProductos = document.getElementById("contenedorProducto");
const btnEnviar = document.getElementById("btnEnviar");

const renderProductos = (productos) => {
  contenedorProductos.innerHTML = "";
  productos.forEach((producto) => {
    const productoElement = document.createElement("div");
    productoElement.innerHTML = `
    <h3>${producto.title}</h3>
    <p>${producto.description}</p>
    <p> Precio:${producto.price}</p>
    <button data-id="${producto.id}" class = "btnEliminar"> Eliminar </button>
    `;
    contenedorProductos.appendChild(productoElement);
  });

  const botonesEliminar = document.querySelectorAll(".btnEliminar");
  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      socket.emit("eliminarProducto", id);
    });
  });
};

socket.on("productos", (productos) => {
  renderProductos(productos);
});

btnEnviar.addEventListener("click", () => {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = parseFloat(document.getElementById("price").value);
  const img = document.getElementById("img").value;
  const code = document.getElementById("code").value;
  const stock = parseInt(document.getElementById("stock").value);
  const category = document.getElementById("category").value;
  const status = document.getElementById("status").value === "true";
  const nuevoProducto = {
    title,
    description,
    price,
    img,
    code,
    stock,
    category,
    status,
  };
  socket.emit("agregarProducto", nuevoProducto);
});

//(socket.on("productos", (data) => {
renderProductos(data);
//});

//const renderProductos = (data) => {
// const contenedorProductos = document.getElementById("contenedorProductos");
// contenedorProductos.innerHTML = "";

// data.forEach((item) => {
//   const card = document.createElement("div");

//  card.innerHTML = `  <p> ${item.id} </p>
//                           <p> ${item.title} </p>
//                           <p> ${item.price} </p>
//                           <button> Eliminar </button>
//                       `;
//   contenedorProductos.appendChild(card);

//   card.querySelector("button").addEventListener("click", () => {
//    eliminarProducto(item.id);
//   });
// });
//};

//const eliminarProducto = (id) => {
//  socket.emit("eliminarProducto", id);
//};

//document.getElementById("btnEnviar").addEventListener("click", () => {
//  agregarProducto();
//});

//const agregarProducto = () => {
//  const producto = {
//   title: document.getElementById("title").value,
//   description: document.getElementById("description").value,
//   price: document.getElementById("price").value,
//   img: document.getElementById("img").value,
//   code: document.getElementById("code").value,
//   stock: document.getElementById("stock").value,
//   category: document.getElementById("category").value,
//    status: document.getElementById("status").value === "true",
//  };

//// socket.emit("agregarProducto", producto);
//};
