import { storage } from "../firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImageToFirebase(base64DataUrl) {
  if (!base64DataUrl) {
    throw new Error("Imagem é obrigatória");
  }

  const matches = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Formato de imagem inválido");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = getExtensionFromMime(mimeType);
  const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });

  const imageRef = ref(storage, `catalog-images/${fileName}`);
  await uploadBytes(imageRef, blob);
  return await getDownloadURL(imageRef);
}

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
