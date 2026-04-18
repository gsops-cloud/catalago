import { storage } from "../firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Faz upload de uma imagem para Firebase Storage
 * @param {string} base64DataUrl - Imagem em base64 (data:image/...)
 * @returns {Promise<string>} URL pública da imagem
 */
export async function uploadImageToFirebase(base64DataUrl) {
  if (!base64DataUrl) {
    throw new Error("Imagem é obrigatória");
  }

  // Extrai MIME type e dados do base64
  const matches = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Formato de imagem inválido");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = getExtensionFromMime(mimeType);
  
  // Cria nome único para a imagem
  const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  
  // Converte base64 para Blob
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });

  // Faz upload para Firebase Storage
  const imageRef = ref(storage, `catalog-images/${fileName}`);
  await uploadBytes(imageRef, blob);

  // Retorna URL pública
  const downloadUrl = await getDownloadURL(imageRef);
  return downloadUrl;
}

/**
 * Extrai extensão do arquivo baseado no MIME type
 */
function getExtensionFromMime(mimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "png";
  }
}
