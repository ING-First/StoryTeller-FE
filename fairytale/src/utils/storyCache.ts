// src/utils/storyCache.ts
import localforage from 'localforage'

// localForage 설정
const imageCache = localforage.createInstance({
  name: 'FairyTaleApp',
  storeName: 'images',
  description: '동화책 이미지 캐시'
})

const metaCache = localforage.createInstance({
  name: 'FairyTaleApp',
  storeName: 'metadata',
  description: '동화책 메타데이터 캐시'
})

interface CachedImage {
  data: string
  timestamp: number
}

interface CachedMeta {
  title: string
  pages: Array<{text: string; page: number}>
  timestamp: number
}

interface CachedData<T> {
  data: T
  timestamp: number
}

// ===== 이미지 캐싱 =====

export const saveImage = async (fid: string, pageIndex: number, imageData: string) => {
  try {
    await imageCache.setItem(`${fid}_${pageIndex}`, {
      data: imageData,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('이미지 캐시 저장 실패:', error)
  }
}

export const getImage = async (
  fid: string,
  pageIndex: number
): Promise<string | null> => {
  try {
    const cached = await imageCache.getItem<CachedImage>(`${fid}_${pageIndex}`)

    if (!cached) return null

    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - cached.timestamp > maxAge) {
      await imageCache.removeItem(`${fid}_${pageIndex}`)
      return null
    }

    return cached.data
  } catch (error) {
    console.error('이미지 캐시 로드 실패:', error)
    return null
  }
}

// ===== 동화책 메타데이터 캐싱 =====

export const saveFairyTaleMeta = async (fid: string, title: string, pages: any[]) => {
  try {
    await metaCache.setItem(fid, {
      title,
      pages: pages.map(p => ({text: p.text, page: p.page})),
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('메타데이터 캐시 저장 실패:', error)
  }
}

export const getFairyTaleMeta = async (fid: string): Promise<CachedMeta | null> => {
  try {
    const cached = await metaCache.getItem<CachedMeta>(fid)

    if (!cached) return null

    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - cached.timestamp > maxAge) {
      await metaCache.removeItem(fid)
      return null
    }

    return cached
  } catch (error) {
    console.error('메타데이터 캐시 로드 실패:', error)
    return null
  }
}

// ===== 동화책 리스트 캐싱 =====

const LIST_CACHE_KEY = 'fairytale_list'

export const saveFairyTaleList = async (list: any[]) => {
  try {
    await metaCache.setItem(LIST_CACHE_KEY, {
      data: list,
      timestamp: Date.now()
    })
    console.log('동화책 리스트 캐시 저장 완료')
  } catch (error) {
    console.error('리스트 캐시 저장 실패:', error)
  }
}

export const getFairyTaleList = async (): Promise<any[] | null> => {
  try {
    const cached = await metaCache.getItem<CachedData<any[]>>(LIST_CACHE_KEY)

    if (!cached) return null

    const maxAge = 60 * 60 * 1000 // 1시간
    if (Date.now() - cached.timestamp > maxAge) {
      await metaCache.removeItem(LIST_CACHE_KEY)
      return null
    }

    console.log('캐시에서 동화책 리스트 로드됨')
    return cached.data
  } catch (error) {
    console.error('리스트 캐시 로드 실패:', error)
    return null
  }
}

// ===== 독서기록 캐싱 =====

const getRecordsCacheKey = (uid: string) => `reading_records_${uid}`

export const saveReadingRecords = async (uid: string, records: any[]) => {
  try {
    await metaCache.setItem(getRecordsCacheKey(uid), {
      data: records,
      timestamp: Date.now()
    })
    console.log('독서기록 캐시 저장 완료')
  } catch (error) {
    console.error('독서기록 캐시 저장 실패:', error)
  }
}

export const getReadingRecords = async (uid: string): Promise<any[] | null> => {
  try {
    const cached = await metaCache.getItem<CachedData<any[]>>(getRecordsCacheKey(uid))

    if (!cached) return null

    const maxAge = 30 * 60 * 1000 // 30분
    if (Date.now() - cached.timestamp > maxAge) {
      await metaCache.removeItem(getRecordsCacheKey(uid))
      return null
    }

    console.log('캐시에서 독서기록 로드됨')
    return cached.data
  } catch (error) {
    console.error('독서기록 캐시 로드 실패:', error)
    return null
  }
}

// ===== 동화책 상세정보 캐싱 =====

const getDetailCacheKey = (fid: number) => `fairytale_detail_${fid}`

export const saveFairyTaleDetail = async (fid: number, detail: any) => {
  try {
    await metaCache.setItem(getDetailCacheKey(fid), {
      data: detail,
      timestamp: Date.now()
    })
    console.log(`동화책 ${fid} 상세정보 캐시 저장 완료`)
  } catch (error) {
    console.error('상세정보 캐시 저장 실패:', error)
  }
}

export const getFairyTaleDetailCache = async (fid: number): Promise<any | null> => {
  try {
    const cached = await metaCache.getItem<CachedData<any>>(getDetailCacheKey(fid))

    if (!cached) return null

    const maxAge = 60 * 60 * 1000 // 1시간
    if (Date.now() - cached.timestamp > maxAge) {
      await metaCache.removeItem(getDetailCacheKey(fid))
      return null
    }

    console.log(`캐시에서 동화책 ${fid} 상세정보 로드됨`)
    return cached.data
  } catch (error) {
    console.error('상세정보 캐시 로드 실패:', error)
    return null
  }
}

// ===== 캐시 관리 =====

export const clearOldCache = async () => {
  try {
    const maxAge = 7 * 24 * 60 * 60 * 1000
    const now = Date.now()

    const imageKeys = await imageCache.keys()
    for (const key of imageKeys) {
      const item = await imageCache.getItem<CachedImage>(key)
      if (item && now - item.timestamp > maxAge) {
        await imageCache.removeItem(key)
      }
    }

    const metaKeys = await metaCache.keys()
    for (const key of metaKeys) {
      const item = await metaCache.getItem<CachedData<any>>(key)
      if (item && now - item.timestamp > maxAge) {
        await metaCache.removeItem(key)
      }
    }

    console.log('오래된 캐시 정리 완료')
  } catch (error) {
    console.error('캐시 정리 실패:', error)
  }
}

export const clearFairyTaleCache = async (fid: string) => {
  try {
    await metaCache.removeItem(fid)

    const imageKeys = await imageCache.keys()
    const targetKeys = imageKeys.filter(key => key.startsWith(`${fid}_`))

    for (const key of targetKeys) {
      await imageCache.removeItem(key)
    }

    console.log(`동화책 ${fid} 캐시 삭제 완료`)
  } catch (error) {
    console.error('캐시 삭제 실패:', error)
  }
}
