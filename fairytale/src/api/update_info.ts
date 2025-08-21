import api from "./index";

export async function user_update_search(user: {
  uid: number;
}) {
  const res = await api.post("/user_update_search", user);
  return res.data;
}