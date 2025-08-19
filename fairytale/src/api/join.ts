import api from "./index";

export async function join(user: {
  id: string;
  passwd: string;
  repasswd: string;
  name: string;
  address: string;
}) {
  const res = await api.post("/join", user);
  return res.data;
}