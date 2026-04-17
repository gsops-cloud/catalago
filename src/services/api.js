const apiBase = import.meta.env.DEV ? "http://localhost:4000" : "";

async function request(path, options) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro na API");
  }
  return data;
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

export async function createProduct(product) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
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
