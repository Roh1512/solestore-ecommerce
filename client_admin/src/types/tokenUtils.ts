// src/utils/tokenUtils.ts
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; // Expiration time in Unix timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Other claims
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decodedToken: DecodedToken = jwtDecode(token);
    // console.log("TOKEN DATA: ", decodedToken);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decodedToken.exp < currentTime; // Token is expired if exp < current time
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Treat invalid tokens as expired
  }
};
