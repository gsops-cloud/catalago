import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

async function loadDb() {
  try {
    const content = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      const defaultDb = { products: [], users: [] };
      await saveDb(defaultDb);
      return defaultDb;
    }
    throw error;
  }
}

async function saveDb(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
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
  const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  const buffer = Buffer.from(base64Data, "base64");

  await fs.writeFile(filePath, buffer);

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
  res.status(201).json({ url: imageUrl });
});

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", async (req, res) => {
  const db = await loadDb();
  res.json(db.products);
});

app.post("/api/products", async (req, res) => {
  const product = req.body;
  const db = await loadDb();
  db.products.push(product);
  await saveDb(db);
  res.status(201).json(product);
});

app.put("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const changes = req.body;
  const db = await loadDb();
  const index = db.products.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }
  db.products[index] = { ...db.products[index], ...changes };
  await saveDb(db);
  res.json(db.products[index]);
});

app.get("/api/users", async (req, res) => {
  const db = await loadDb();
  res.json(db.users.map((user) => ({ username: user.username, role: user.role })));
});

app.post("/api/users", async (req, res) => {
  const { username, password, role = "user" } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username e password são obrigatórios" });
  }

  const db = await loadDb();
  const existing = db.users.find((user) => user.username === username);
  if (existing) {
    return res.status(409).json({ error: "Usuário já existe" });
  }

  const user = { username, password, role };
  db.users.push(user);
  await saveDb(db);
  res.status(201).json({ username, role });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const db = await loadDb();
  const user = db.users.find((item) => item.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  res.json({ username: user.username, role: user.role });
});

await fs.mkdir(UPLOADS_DIR, { recursive: true });

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
