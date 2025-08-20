import api from "./index";

export async function update_user(user: {
  uid: number;
  name: string,
  currentPasswd: string;
  passwd: string;
  repasswd: string;
}) {
  const res = await api.post("/update_user", user);
  return res.data;
}