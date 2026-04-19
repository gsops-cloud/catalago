// URLs relativas funcionam em ambos os casos:
// - Em dev: vite.config.js faz proxy para localhost:4000
// - Em prod (Hostinger): mesma origem (frontend + backend)
const apiBase = "";

async function request(path, options) {
  const url = `${apiBase}${path}`;
  
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    // Se a resposta não é JSON, mostra o erro real
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Resposta não é JSON: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Erro HTTP ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Erro na requisição para:", url);
    console.error("Detalhes:", error);
    throw error;
  }
}

export async function getProducts() {
  return request("/api/products");
}

export async function updateProduct(id, changes) {
  return request(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });
}

export async function deleteProduct(id) {
  return request(`/api/products/${id}`, {
    method: "DELETE",
  });
}

export async function createProduct(product) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function uploadImage(imageDataUrl) {
  return request("/api/upload", {
    method: "POST",
    body: JSON.stringify({ imageDataUrl }),
  });
}

export async function login(username, password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getUsers() {
  return request("/api/users");
}

export async function createUser(username, password) {
  return request("/api/users", {
    method: "POST",
    body: JSON.stringify({ username, password, role: "user" }),
  });
}
