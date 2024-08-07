import mongoose from "mongoose";
import express from "express";
import CartManager from "../dao/db/cart-manager-db.js";
import ProductModel from "../dao/models/product.model.js";
import CartModel from "../dao/models/cart.model.js";

const router = express.Router();
const cartManager = new CartManager();

router.post("/", async (req, res) => {
  try {
    const nuevoCarrito = await cartManager.crearCarrito();
    res.json(nuevoCarrito);
  } catch (error) {
    console.error("Error al crear un nuevo carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const carrito = await CartModel.findById(cartId).populate(
      "products.product",
      "_id title price"
    );

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    return res.json(carrito.products);
  } catch (error) {
    console.error("Error al obtener el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;

  try {
    const carritoActualizado = await cartManager.agregarProductoAlCarrito(
      cartId,
      productId,
      quantity
    );
    res.json(carritoActualizado.products);
  } catch (error) {
    console.error("Error al agregar producto al carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const carritos = await cartManager.obtenerTodosLosCarritos();
    res.json({ status: "success", payload: carritos });
  } catch (error) {
    console.error("Error al obtener todos los carritos", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const carritoActualizado = await cartManager.eliminarProductoDelCarrito(
      cartId,
      productId
    );
    res.json({
      message: "Producto eliminado del carrito",
      carrito: carritoActualizado,
    });
  } catch (error) {
    console.error("Error al eliminar producto del carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const resultado = await cartManager.eliminarCarrito(cartId);
    res.json({
      message: "Carrito eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar carrito", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// Ruta para actualizar el carrito completo
router.put("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  const products = req.body.products;

  if (!Array.isArray(products)) {
    return res
      .status(400)
      .json({ error: "El formato de los productos es incorrecto." });
  }

  try {
    const carritoActualizado = await CartModel.findByIdAndUpdate(
      cartId,
      { products },
      { new: true }
    ).populate("products.product", "_id title price");

    if (!carritoActualizado) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(carritoActualizado);
  } catch (error) {
    console.error("Error al actualizar el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para actualizar la cantidad de un producto específico en el carrito
router.put("/:cartId/products/:productId", async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const updatedCart = await cartManager.updateProductQuantity(
      cartId,
      productId,
      quantity
    );
    res.json(updatedCart);
  } catch (error) {
    console.error(
      "Error al actualizar la cantidad del producto en el carrito:",
      error
    );
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
