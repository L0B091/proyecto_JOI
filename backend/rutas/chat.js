import express from "express";
import orquestadorCognitivo from "../motor/orquestadorCognitivo.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        estado: "ok",
        mensaje: "Joi Interactive API funcionando"
    });
});

router.post("/", async (req, res) => {

    const { mensaje } = req.body;

    try {

        const respuesta = await orquestadorCognitivo(mensaje);

        res.json({
            respuesta
        });

    } catch (error) {

        console.error("Error en Joi:", error);

        res.status(500).json({
            error: "Error en el sistema cognitivo de Joi"
        });
    }

});

export default router;