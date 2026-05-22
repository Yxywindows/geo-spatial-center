import { apiClient } from './client'
import type { Resource, ResourcesResponse, StatsResponse, FacetItem } from '../types/resource'

export async function listResources(params: Record<string, string | number> = {}): Promise<ResourcesResponse> {
  const { data } = await apiClient.get<ResourcesResponse>('/resources', { params })
  return data
}

export async function getResource(sourceId: string): Promise<Resource> {
  const { data } = await apiClient.get<{ data: Resource }>(`/resources/${sourceId}`)
  return data.data
}

export async function getStats(): Promise<StatsResponse> {
  const { data } = await apiClient.get<StatsResponse>('/resources/stats')
  return data
}

export async function getSubjects(): Promise<FacetItem[]> {
  const { data } = await apiClient.get<FacetItem[]>('/resources/subjects')
  return data
}

export async function getResourceTypes(): Promise<FacetItem[]> {
  const { data } = await apiClient.get<FacetItem[]>('/resources/types')
  return data
}

export async function getTopKeywords(limit = 50): Promise<FacetItem[]> {
  const { data } = await apiClient.get<Array<{ word: string; count: number }>>('/resources/keywords', { params: { limit } })
  return data.map((k) => ({ name: k.word, count: k.count }))
}
