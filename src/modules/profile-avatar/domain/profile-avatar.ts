const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const avatarTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const ignoredNamePrefixes = new Set([
  "dr",
  "dra",
  "doctor",
  "doctora",
]);

type AvatarExtension = (typeof avatarTypes)[keyof typeof avatarTypes];

type AvatarValidation =
  | { success: true; extension: AvatarExtension; file: File }
  | { success: false; message: string };

function normalizeNamePart(value: string) {
  return value.toLocaleLowerCase("es-AR").replace(/[.]/g, "");
}

export function getProfileInitials(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const meaningfulWords = words.filter(
    (word) => !ignoredNamePrefixes.has(normalizeNamePart(word)),
  );
  const nameWords = meaningfulWords.length > 0 ? meaningfulWords : words;

  if (nameWords.length === 0) {
    return "?";
  }

  const selectedWords =
    nameWords.length === 1
      ? nameWords
      : [nameWords[0], nameWords[nameWords.length - 1]];

  return selectedWords
    .map((word) => word[0]?.toLocaleUpperCase("es-AR"))
    .join("");
}

function matchesDeclaredImageType(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    return signature.every((byte, index) => bytes[index] === byte);
  }

  if (type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

export async function validateProfileAvatarFile(
  value: unknown,
): Promise<AvatarValidation> {
  if (!(value instanceof File) || value.size === 0) {
    return { success: false, message: "Elegí una imagen para continuar." };
  }

  if (value.size > MAX_AVATAR_SIZE) {
    return {
      success: false,
      message: "La imagen debe pesar 2 MB o menos.",
    };
  }

  if (!(value.type in avatarTypes)) {
    return {
      success: false,
      message: "Usá una imagen JPEG, PNG o WebP.",
    };
  }

  const bytes = new Uint8Array(await value.slice(0, 12).arrayBuffer());

  if (!matchesDeclaredImageType(bytes, value.type)) {
    return {
      success: false,
      message: "El contenido del archivo no coincide con una imagen válida.",
    };
  }

  return {
    success: true,
    extension: avatarTypes[value.type as keyof typeof avatarTypes],
    file: value,
  };
}
