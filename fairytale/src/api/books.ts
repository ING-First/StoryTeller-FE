// src/books.ts
import api from './index' // 수정된 import 경로

export type FairyTale = {
  fid: number
  uid: number
  title: string
  summary: string
  contents?: string // contents는 상세 페이지에서만 필요할 수 있으므로 optional로 설정
  createDate: string
  image: string
}

export type FairyTaleResponse = {
  data: FairyTale[]
}

/**
 * DB에 저장된 기본 동화 목록을 가져오는 함수
 * @returns Promise<FairyTale[]> 동화 목록 배열
 */
export const fetchDefaultFairyTales = async (): Promise<FairyTale[]> => {
  try {
    // api 인스턴스를 사용하여 baseURL 적용
    const response = await api.get<FairyTaleResponse>('/api/fairy_tales/default')
    return response.data.data
  } catch (error) {
    console.error('Failed to fetch default fairy tales:', error)
    throw error
  }
}

/**
 * 특정 동화의 상세 정보를 가져오는 함수
 * @param id 동화 ID (fid)
 * @returns Promise<FairyTale> 동화 상세 정보
 */
export const fetchFairyTaleById = async (id: number): Promise<FairyTale> => {
  try {
    // api 인스턴스를 사용하여 baseURL 적용
    const response = await api.get<FairyTale>(`/api/fairy_tales/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch fairy tale with id ${id}:`, error)
    throw error
  }
}

/**
 * 특정 유저의 동화 목록을 가져오는 함수
 * @param uid 유저 ID
 * @returns Promise<FairyTale[]> 해당 유저의 동화 목록 배열
 */
export const fetchFairyTalesByUser = async (uid: number): Promise<FairyTale[]> => {
  try {
    // api 인스턴스를 사용하여 baseURL 적용
    const response = await api.get<FairyTaleResponse>(`/api/users/${uid}/fairy_tales`)
    return response.data.data
  } catch (error) {
    console.error(`Failed to fetch fairy tales for user ${uid}:`, error)
    throw error
  }
}
