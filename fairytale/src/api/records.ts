import api from "./index";

export interface FairyTale {
  id: number
  imageSrc: string
  title: string
  date: string
  subText: string
}

export async function check_records(uid: number) {
  const res = await api.get(`/users/${uid}/check_records`);
  return res.data;
}