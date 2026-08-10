import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function Home() {
  const isAuthed = cookies().get("bpd_auth")?.value === "1";
  redirect(isAuthed ? "/dashboard" : "/login");
}
