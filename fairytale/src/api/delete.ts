import api from "./index";

export async function delete_user(user: {
  uid: number;
}) {
  const res = await api.post("/delete_user", user);
  return res.data;
}