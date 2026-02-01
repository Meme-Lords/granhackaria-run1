import { cookies } from "next/headers";
import type { Locale } from "./translations";

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale");
  return localeCookie?.value === "es" ? "es" : "en";
}
