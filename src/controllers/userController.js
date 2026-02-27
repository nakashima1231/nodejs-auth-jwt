const { addUser, showUsers, showUserById, deleteUser, updateUser, authUser } = require("../models/userModels");

//hash de criptografia
const bcrypt = require("bcrypt");
const saltRounds = 10;

//web token pra nao logar toda hr
const jwt = require("jsonwebtoken");

function adicionarUser(req, res) {
    const { name, email, password } = req.body;

    if(!email || !email.includes("@")) {
        return res.status(400).json({ message: "Email inválido" });
    }

    if(!password || password.length < 6) {
        return res.status(400).json({ message: "Senha muito curta" });
    }


    //criptografar a senha
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err) {
            return res.status(500).send("Erro ao criptografar senha");
        }

        const user = {
            name,
            email,
            password: hash
        };

        addUser(user, (err, result) => {
            if(err) {
                return res.status(500).send("Erro ao salvar usuario");
            }
            if(result.affectedRows === 1) {
                return res.status(201).send(
                    {message: "Usuario criado",
                    id: result.insertId
                    });
            } else {
                return res.status(500).send("Erro ao salvar usuario");
            }
        });

    });
}

function mostrarUsers(req, res) {
    showUsers((err, rows) => {
        if(err) {
            return res.status(500).send("Erro ao listar usuarios");
        }

        res.json(rows);
    });
}

function mostrarUserId(req, res) {
    const id = req.params.id;
    showUserById(id, (err,rows) => {
        if(err) {
            return res.status(500).send("Erro ao listar usuario");
        }
        if(rows.length === 0) {
            return res.status(404).send("nao ha usuario com esse id");
        }
        res.json(rows);
    });
}


function deletarUser(req,res) {
    const id = req.params.id;
    deleteUser(id, (err, result) => {
        if(err) {
            return res.status(500).send("Erro ao deletar usuarios");
        }
        if(result.affectedRows === 1) {
            return res.status(200).send(
                {message: "Usuario deletado",
                 id: id
                });
        } else {
            return res.status(404).send("Erro ao deletar usuario");
        }
    });
}

function atualizarUser(req, res) {
    const id = req.params.id;
    const { name, email, password } = req.body;

    //criptografar a senha
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err) {
            return res.status(500).send("Erro ao criptografar senha");
        }

        const user = {
            name,
            email,
            password: hash
        };

        updateUser(id, user, (err, result) => {
        if(err) {
            return res.status(500).send("Erro ao atualizar usuarios");
        }
        if(result.affectedRows === 1) {
            return res.status(200).send(
                {message: "Usuario atualizado",
                 id: id
                });
        } else {
            return res.status(404).send("Erro ao atualizar usuario");
        }
        });
    });
}

function verificarUser(req, res) {
    const { email, password } = req.body;

    authUser(email, (err, result) => {
        if(err){
            return res.status(500).json({ message: "Erro ao autenticar usuario" });
        }
        if(result.length === 0) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }

        const user = result[0]; 

        //comparar a senha criptografada com a senha passada
        bcrypt.compare(password, user.password, (err, samepass) => {
            if (err) {
                return res.status(500).json({ message: "Erro ao verificar senha" });
            }

            if (!samepass) {
                
                return res.status(401).json({ message: "Email ou senha incorretos" });
            }

            //criacao do token
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" })

            return res.status(200).json( {
                message: "usuario autenticado",
                token: token,
                id: user.id,
                name: user.name
            });
        });
    });
}

//logado
function dashboard(req, res) {
    res.json({
        message: "dashboard",
        user: req.user
    });
}


module.exports = { adicionarUser, mostrarUsers, deletarUser, atualizarUser, verificarUser, dashboard };