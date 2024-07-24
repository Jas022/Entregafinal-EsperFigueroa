import mongoose from "mongoose";
import CartModel from "../models/cart.model.js";

class CartManager {
  async agregarProductoAlCarrito(cartId, productId, quantity) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        throw new Error("Invalid cart or product ID");
      }

      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }

      if (!Array.isArray(cart.products)) {
        cart.products = [];
      }

      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      if (productIndex >= 0) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  }

  async getCarritoById(cartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new Error("Invalid cart ID");
      }

      const carrito = await CartModel.findById(cartId).populate(
        "products.product"
      );
      if (!carrito) {
        throw new Error("Carrito no encontrado");
      }
      return carrito;
    } catch (error) {
      throw new Error(`Error al obtener el carrito: ${error.message}`);
    }
  }

  async crearCarrito() {
    try {
      const nuevoCarrito = new CartModel({ products: [] });
      await nuevoCarrito.save();
      return nuevoCarrito;
    } catch (error) {
      throw new Error(`Error al crear un nuevo carrito: ${error.message}`);
    }
  }
}

export default CartManager;
