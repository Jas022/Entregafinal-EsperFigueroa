import express from "express";
import { engine } from "express-handlebars";
import http from "http";
import { Server } from "socket.io";
import productsRouter from "./src/routers/productsRouter.js";
import cartsRouter from "./src/routers/cartsRouter.js";
import viewsRouter from "./src/routers/views.router.js";
import "./src/database.js";
const app = express();
const PUERTO = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

const httpServer = http.createServer(app);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

httpServer.listen(PUERTO, () => {
  console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

import ProductManager from "./src/dao/fs/productManager.js";
const productManager = new ProductManager("./data/product.json");
const io = new Server(httpServer);

io.on("connection", async (socket) => {
  console.log("Un cliente se conectó");

  try {
    const result = await productManager.getProducts();
    console.log("Productos enviados:", result.docs);
    socket.emit("productos", result.docs || []);
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }

  socket.on("eliminarProducto", async (id) => {
    try {
      await productManager.deleteProduct(id);
      const result = await productManager.getProducts();
      console.log("Productos después de eliminar:", result.docs);
      io.sockets.emit("productos", result.docs || []);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  });

  socket.on("agregarProducto", async (producto) => {
    try {
      await productManager.addProduct(producto);
      const result = await productManager.getProducts();
      console.log("Productos después de agregar:", result.docs);
      io.sockets.emit("productos", result.docs || []);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  });
});
