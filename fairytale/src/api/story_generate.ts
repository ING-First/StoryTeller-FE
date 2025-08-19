import api from "./index";

export async function generate(story: {
  name: string;
  age: number;
  genre: string;
  uid: number;
  type: 2;
}) {
  const res = await api.post("/generate", story);
  return res.data;
}