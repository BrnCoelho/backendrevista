// Importa o framework Express, usado para criar servidores web e APIs REST.
const express = require("express");
// Importa o módulo Client do pacote "pg", usado para se conectar ao banco de dados PostgreSQL.
const { Client } = require("pg");
// Importa o pacote "cors" para permitir requisições de diferentes domínios à API (habilita CORS).
const cors = require("cors");
// Importa o pacote "body-parser", usado para processar o corpo das requisições HTTP.
// Ele transforma os dados do corpo em objetos JavaScript acessíveis no código.
const bodyparser = require("body-parser");
// Importa um arquivo de configuração chamado "config.js" que pode conter dados como credenciais do banco.
const config = require("./config");
// Cria uma instância do Express, que representa o servidor da aplicação.
const app = express();
// Middleware: Habilita o Express para processar automaticamente requisições com corpo em formato JSON.
// Ele transforma o conteúdo JSON enviado pelo cliente em um objeto JavaScript no req.body.
app.use(express.json());
// Middleware: Habilita CORS para permitir que aplicações de outros domínios acessem a API.
// Exemplo: um frontend rodando em "http://localhost:3000" pode acessar o backend em "http://localhost:5000".
app.use(cors());
// Middleware: Configura o body-parser para processar o corpo das requisições no formato JSON.
// Essa linha é redundante porque "express.json()" já faz a mesma função.
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect((err) => {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", (err, result) => {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});
app.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok – Servidor disponível.");
});
app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

//rotas
app.get("/usuarios", (req, res) => {
  try {
    // Realiza uma consulta SQL no banco de dados usando o cliente PostgreSQL.
    client.query("SELECT * FROM Usuarios", function (err, result) {
      if (err) {
        // Caso ocorra um erro na consulta, exibe uma mensagem de erro no console.
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      // Envia os dados obtidos da tabela "Usuarios" como resposta da requisição.
      res.send(result.rows);
      // Exibe uma mensagem no console indicando que a rota foi chamada com sucesso.
      console.log("Rota: get usuarios");
    });
  } catch (error) {
    // Captura qualquer erro que possa ocorrer no bloco try e exibe no console.
    console.log(error);
  }
});
app.get("/usuarios/:id", (req, res) => {
  try {
    console.log("Rota: usuarios/" + req.params.id);
    client.query(
      "SELECT * FROM Usuarios WHERE id = $1",
      [req.params.id],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de SELECT id", err);
        }
        res.send(result.rows);
        //console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});
app.delete("/usuarios/:id", (req, res) => {
  try {
    console.log("Rota: delete/" + req.params.id);
    client.query(
      "DELETE FROM Usuarios WHERE id = $1",
      [req.params.id],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err);
        } else {
          if (result.rowCount == 0) {
            res.status(404).json({ info: "Registro não encontrado." });
          } else {
            res
              .status(200)
              .json({ info: `Registro excluído. Código: ${req.params.id}` });
          }
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});
app.post("/usuarios", (req, res) => {
  try {
    console.log("Alguém enviou um post com os dados:", req.body);
    const { nome, email, senha } = req.body;
    client.query(
      "INSERT INTO Usuarios (nome, email, senha) VALUES ($1, $2,$3) RETURNING * ",
      [nome, email, senha],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err);
        }
        const { id } = result.rows[0];
        res.setHeader("id", `${id}`);
        res.status(201).json(result.rows[0]);
        console.log(result);
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.put("/usuarios/:id", (req, res) => {
  try {
    console.log("Alguém enviou um update com os dados:", req.body);
    const id = req.params.id;
    const { nome, email,senha } = req.body;
    client.query(
      "UPDATE Usuarios SET nome=$1, email=$2, senha=$3 WHERE id =$4 ",
      [nome, email, senha, id],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err);
        } else {
          res.setHeader("id", id);
          res.status(202).json({ identificador: id });
          console.log(result);
        }
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});


module.exports = app;