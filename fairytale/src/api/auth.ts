import api from "./index";

export async function login(user: {
  id: string;
  passwd: string;
}) {
  const res = await api.post("/login", user);
  return res.data;
}