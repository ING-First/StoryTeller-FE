import api from "./index";

export interface FairyTale {
  fid: number
  imageSrc: string
  title: string
  create_date: string
  summary: string
}

export async function check_records(uid: number) {
  const res = await api.get(`/users/${uid}/check_records`);
  return res.data;
}