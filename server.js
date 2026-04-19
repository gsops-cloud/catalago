import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

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

function initFirebaseAdmin() {
  if (admin.apps.length > 0) return;

  const raw = requireEnv("FIREBASE_SERVICE_ACCOUNT_JSON");
  const serviceAccount = JSON.parse(raw);

  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    // Alguns projetos novos do Firebase usam bucket padrão em *.firebasestorage.app
    `${serviceAccount.project_id}.firebasestorage.app`;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });
}

function firestore() {
  initFirebaseAdmin();
  return admin.firestore();
}

function storageBucket() {
  initFirebaseAdmin();
  return admin.storage().bucket();
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
  const buffer = Buffer.from(base64Data, "base64");

  try {
    const bucket = storageBucket();
    const objectPath = `catalog-images/${fileName}`;
    const file = bucket.file(objectPath);

    await file.save(buffer, {
      contentType: mimeType,
      resumable: false,
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
    });

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: "2500-01-01",
    });

    res.status(201).json({ url: signedUrl });
  } catch (error) {
    console.error("Falha no upload Firebase Storage:", error);
    res.status(500).json({ error: error.message || "Falha no upload" });
  }
});

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", async (req, res) => {
  try {
    const db = firestore();
    const snapshot = await db.collection("products").orderBy("id", "asc").get();
    const items = snapshot.docs.map((doc) => doc.data());
    res.json(items);
  } catch (error) {
    console.error("Falha ao listar produtos:", error);
    res.status(500).json({ error: error.message || "Erro ao listar produtos" });
  }
});

app.post("/api/products", async (req, res) => {
  const product = req.body;
  if (!product || !Number.isFinite(Number(product.id)) || !product.name) {
    return res.status(400).json({ error: "Produto inválido" });
  }

  try {
    const db = firestore();
    const next = {
      id: Number(product.id),
      name: String(product.name),
      price: Number(product.price),
      image: product.image || "",
    };
    await db.collection("products").doc(String(next.id)).set(next);
    res.status(201).json(next);
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
    const db = firestore();
    const ref = db.collection("products").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Produto não encontrado" });

    const existing = snap.data();
    const next = {
      ...existing,
      ...changes,
      id,
    };
    if (next.price !== undefined) next.price = Number(next.price);
    if (next.name !== undefined) next.name = String(next.name);
    if (next.image === undefined) next.image = existing.image || "";

    await ref.set(next);
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
    const db = firestore();
    const ref = db.collection("products").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Produto não encontrado" });
    const existing = snap.data();
    await ref.delete();
    res.json(existing);
  } catch (error) {
    console.error("Falha ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const db = firestore();
    const snapshot = await db.collection("users").orderBy("username", "asc").get();
    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return { username: data.username, role: data.role };
    });
    res.json(items);
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
    const db = firestore();
    const ref = db.collection("users").doc(String(username));
    const snap = await ref.get();
    if (snap.exists) return res.status(409).json({ error: "Usuário já existe" });

    const user = { username: String(username), password: String(password), role: String(role) };
    await ref.set(user);
    res.status(201).json({ username: user.username, role: user.role });
  } catch (error) {
    console.error("Falha ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = firestore();
    const snap = await db.collection("users").doc(String(username)).get();
    const user = snap.exists ? snap.data() : null;
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

await (await import("fs/promises")).mkdir(DIST_DIR, { recursive: true }).catch(() => {});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Frontend: ${path.join(DIST_DIR, "index.html")}`);
  console.log(`🔥 Firebase Admin: pronto\n`);
});
