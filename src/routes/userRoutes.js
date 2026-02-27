    const express = require("express");
    const router = express.Router();
    const { adicionarUser, mostrarUsers, deletarUser, atualizarUser, verificarUser, dashboard } = require("../controllers/userController");

    //verificacao de rota
    const authMiddleware = require("../middlewares/authMiddleware");


    //login
    router.post("/login", verificarUser);

    //registrar
    router.post("/register", adicionarUser);

    //mostrar usuarios
    router.get("/users",authMiddleware, mostrarUsers);

    //deletar usuario
    router.delete("/users/:id",authMiddleware, deletarUser);

    //atualizar usuario
    router.put("/users/:id", authMiddleware, atualizarUser);

    //perfil do usuario
    router.get("/dashboard", authMiddleware, dashboard);

    module.exports = router;