import apiClient from './client'
import { Project, Task, TimeEntry, PaginatedResponse } from '@/types/api'

export const projectsApi = {
  // Projects
  getProjects: async (params?: {
    page?: number
    page_size?: number
    status?: string
    customer_id?: number
    search?: string
  }): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<PaginatedResponse<Project>>('/api/v1/projects/', {
      params,
    })
    return response.data
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/api/v1/projects/${id}/`)
    return response.data
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.post<Project>('/api/v1/projects/', data)
    return response.data
  },

  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/api/v1/projects/${id}/`, data)
    return response.data
  },

  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/projects/${id}/`)
  },

  // Tasks
  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/api/v1/projects/${projectId}/tasks/`)
    return response.data
  },

  createTask: async (projectId: number, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post<Task>(`/api/v1/projects/${projectId}/tasks/`, data)
    return response.data
  },

  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/api/v1/projects/tasks/${id}/`, data)
    return response.data
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/projects/tasks/${id}/`)
  },

  // Time Entries
  createTimeEntry: async (taskId: number, data: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await apiClient.post<TimeEntry>(
      `/api/v1/projects/tasks/${taskId}/time-entries/`,
      data
    )
    return response.data
  },

  // Gantt
  getGanttData: async (projectId: number): Promise<{
    tasks: Array<{
      id: number
      title: string
      start: string
      end: string
      progress: number
      dependencies: number[]
    }>
  }> => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/gantt/`)
    return response.data
  },
}


