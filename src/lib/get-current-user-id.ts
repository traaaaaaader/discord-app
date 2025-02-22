import { jwtDecode } from "jwt-decode";

export const getCurrentUserId = (accessToken: string | null): string | null => {
  if (!accessToken) return null;

  try {
    const decoded: { userId?: string } = jwtDecode(accessToken);
    return decoded.userId || null;
  } catch (error) {
    console.error("Ошибка при декодировании токена:", error);
    return null;
  }
};
