import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "dist");
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Serve o frontend React (arquivos estáticos)
app.use(express.static(DIST_DIR));

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Variável obrigatória ausente: ${name}`);
  return v;
}

const dbPool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
  connectionLimit: 5,
  enableKeepAlive: true,
});

async function initDb() {
  requireEnv("MYSQL_HOST");
  requireEnv("MYSQL_USER");
  requireEnv("MYSQL_PASSWORD");
  requireEnv("MYSQL_DATABASE");

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mime VARCHAR(100) NOT NULL,
      data LONGBLOB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      image TEXT
    ) ENGINE=InnoDB;
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      username VARCHAR(120) PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL
    ) ENGINE=InnoDB;
  `);
}

function imageTypeToExt(mime) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    case "image/gif":
      return "gif";
    default:
      return "png";
  }
}

app.post("/api/upload", async (req, res) => {
  const { imageDataUrl } = req.body;
  if (!imageDataUrl) {
    return res.status(400).json({ error: "imageDataUrl é obrigatório" });
  }

  const matches = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ error: "Formato de imagem inválido" });
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = imageTypeToExt(mimeType);
  const buffer = Buffer.from(base64Data, "base64");

  try {
    const [result] = await dbPool.execute(
      "INSERT INTO images (mime, data) VALUES (?, ?)",
      [mimeType, buffer]
    );
    const id = result.insertId;
    res.status(201).json({ url: `/api/images/${id}` });
  } catch (error) {
    console.error("Falha no upload MySQL:", error);
    res.status(500).json({ error: error.message || "Falha no upload" });
  }
});

app.get("/api/images/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

  try {
    const [rows] = await dbPool.execute(
      "SELECT mime, data FROM images WHERE id = ?",
      [id]
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Imagem não encontrada" });

    res.setHeader("Content-Type", row.mime);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(row.data);
  } catch (error) {
    console.error("Falha ao buscar imagem:", error);
    res.status(500).json({ error: "Erro ao buscar imagem" });
  }
});

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await dbPool.execute(
      "SELECT id, name, price, image FROM products ORDER BY id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Falha ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
});

app.post("/api/products", async (req, res) => {
  const product = req.body;
  if (!product || !Number.isFinite(Number(product.id)) || !product.name) {
    return res.status(400).json({ error: "Produto inválido" });
  }

  try {
    await dbPool.execute(
      "INSERT INTO products (id, name, price, image) VALUES (?, ?, ?, ?)",
      [Number(product.id), product.name, Number(product.price), product.image || null]
    );
    res.status(201).json({ ...product, id: Number(product.id), price: Number(product.price) });
  } catch (error) {
    console.error("Falha ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const changes = req.body;
  if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

  try {
    const [existingRows] = await dbPool.execute(
      "SELECT id, name, price, image FROM products WHERE id = ?",
      [id]
    );
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: "Produto não encontrado" });

    const next = {
      ...existing,
      ...changes,
      id,
      price: changes?.price !== undefined ? Number(changes.price) : Number(existing.price),
    };

    await dbPool.execute(
      "UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?",
      [next.name, next.price, next.image || null, id]
    );
    res.json(next);
  } catch (error) {
    console.error("Falha ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

  try {
    const [existingRows] = await dbPool.execute(
      "SELECT id, name, price, image FROM products WHERE id = ?",
      [id]
    );
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: "Produto não encontrado" });

    await dbPool.execute("DELETE FROM products WHERE id = ?", [id]);
    res.json(existing);
  } catch (error) {
    console.error("Falha ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await dbPool.execute(
      "SELECT username, role FROM users ORDER BY username ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Falha ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

app.post("/api/users", async (req, res) => {
  const { username, password, role = "user" } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username e password são obrigatórios" });
  }

  try {
    const [existingRows] = await dbPool.execute(
      "SELECT username FROM users WHERE username = ?",
      [username]
    );
    if (existingRows[0]) return res.status(409).json({ error: "Usuário já existe" });

    await dbPool.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, password, role]
    );
    res.status(201).json({ username, role });
  } catch (error) {
    console.error("Falha ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await dbPool.execute(
      "SELECT username, password, role FROM users WHERE username = ?",
      [username]
    );
    const user = rows[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }
    res.json({ username: user.username, role: user.role });
  } catch (error) {
    console.error("Falha no login:", error);
    res.status(500).json({ error: "Erro no login" });
  }
});

// Fallback para SPA - se requisição não matchear API, retorna index.html
app.get("*", async (req, res) => {
  const indexPath = path.join(DIST_DIR, "index.html");
  try {
    const fs = await import("fs/promises");
    const html = await fs.readFile(indexPath, "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: "Frontend não foi compilado. Execute: npm run build" });
  }
});

await initDb();
await (await import("fs/promises")).mkdir(DIST_DIR, { recursive: true }).catch(() => {});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Frontend: ${path.join(DIST_DIR, "index.html")}`);
  console.log(`🗄️  MySQL: ${process.env.MYSQL_HOST}/${process.env.MYSQL_DATABASE}\n`);
});
