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

      if (!cart.products) {
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

  async obtenerTodosLosCarritos() {
    try {
      const carritos = await CartModel.find();
      return carritos;
    } catch (error) {
      throw new Error(`Error al obtener todos los carritos: ${error.message}`);
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
      return carrito;
    } catch (error) {
      throw new Error(`Error al obtener el carrito: ${error.message}`);
    }
  }

  async eliminarCarrito(cartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new Error("Invalid cart ID");
      }

      const resultado = await CartModel.findByIdAndDelete(cartId);
      if (!resultado) {
        throw new Error("Cart not found");
      }

      return resultado;
    } catch (error) {
      throw new Error(`Error al eliminar el carrito: ${error.message}`);
    }
  }
  async eliminarProductoDelCarrito(cartId, productId) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        throw new Error("Invalid cart or product ID");
      }

      const carrito = await CartModel.findByIdAndUpdate(
        cartId,
        { $pull: { products: { product: productId } } },
        { new: true } // Devuelve el documento actualizado
      ).populate("products.product", "_id title price");

      if (!carrito) {
        throw new Error("Carrito no encontrado");
      }

      return carrito;
    } catch (error) {
      throw new Error(
        `Error al eliminar producto del carrito: ${error.message}`
      );
    }
  }
  async eliminarTodosLosProductosDelCarrito(cartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new Error("Invalid cart ID");
      }

      const carrito = await CartModel.findByIdAndUpdate(
        cartId,
        { $set: { products: [] } },
        { new: true }
      ).populate("products.product", "_id title price");

      if (!carrito) {
        throw new Error("Carrito no encontrado");
      }

      return carrito;
    } catch (error) {
      throw new Error(
        `Error al eliminar todos los productos del carrito: ${error.message}`
      );
    }
  }
}

export default CartManager;
