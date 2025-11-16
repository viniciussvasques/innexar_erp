import apiClient from './client'
import {
  Employee,
  Department,
  Company,
  Payroll,
  TimeRecord,
  Vacation,
  Benefit,
  EmployeeBenefit,
  PerformanceReview,
  Training,
  EmployeeTraining,
  JobOpening,
  Candidate,
  JobPosition,
  BankAccount,
  Dependent,
  Education,
  WorkExperience,
  Contract,
  EmployeeDocument,
  EmployeeHistory,
  HRNotification,
  PaginatedResponse,
} from '@/types/api'

export const hrApi = {
  // Employees
  getEmployees: async (params?: {
    page?: number
    page_size?: number
    search?: string
    status?: string
    department_id?: number
    // warehouse_id?: number  // TODO: Uncomment when warehouse module is ready
    supervisor_id?: number
    hire_type?: 'individual' | 'company'
    ordering?: string
  }): Promise<PaginatedResponse<Employee>> => {
    const response = await apiClient.get<PaginatedResponse<Employee>>('/api/v1/hr/employees/', {
      params,
    })
    return response.data
  },

  getEmployee: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<Employee>(`/api/v1/hr/employees/${id}/`)
    return response.data
  },

  getEmployeeByUser: async (userId: number): Promise<Employee> => {
    const response = await apiClient.get<Employee>('/api/v1/hr/employees/by_user/', {
      params: { user_id: userId },
    })
    return response.data
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.post<Employee>('/api/v1/hr/employees/', data)
    return response.data
  },

  updateEmployee: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.patch<Employee>(`/api/v1/hr/employees/${id}/`, data)
    return response.data
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/employees/${id}/`)
  },

  // Departments
  getDepartments: async (params?: {
    page?: number
    page_size?: number
    search?: string
    is_active?: boolean
    active_only?: boolean
  }): Promise<PaginatedResponse<Department>> => {
    const response = await apiClient.get<PaginatedResponse<Department>>('/api/v1/hr/departments/', {
      params,
    })
    return response.data
  },

  getDepartment: async (id: number): Promise<Department> => {
    const response = await apiClient.get<Department>(`/api/v1/hr/departments/${id}/`)
    return response.data
  },

  createDepartment: async (data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.post<Department>('/api/v1/hr/departments/', data)
    return response.data
  },

  updateDepartment: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.patch<Department>(`/api/v1/hr/departments/${id}/`, data)
    return response.data
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/departments/${id}/`)
  },

  // Job Positions
  getJobPositions: async (params?: {
    page?: number
    page_size?: number
    search?: string
    department?: number
    level?: string
    is_active?: boolean
    active_only?: boolean
    ordering?: string
  }): Promise<PaginatedResponse<JobPosition>> => {
    const response = await apiClient.get<PaginatedResponse<JobPosition>>('/api/v1/hr/job-positions/', {
      params,
    })
    return response.data
  },

  getJobPosition: async (id: number): Promise<JobPosition> => {
    const response = await apiClient.get<JobPosition>(`/api/v1/hr/job-positions/${id}/`)
    return response.data
  },

  createJobPosition: async (data: Partial<JobPosition>): Promise<JobPosition> => {
    const response = await apiClient.post<JobPosition>('/api/v1/hr/job-positions/', data)
    return response.data
  },

  updateJobPosition: async (id: number, data: Partial<JobPosition>): Promise<JobPosition> => {
    const response = await apiClient.patch<JobPosition>(`/api/v1/hr/job-positions/${id}/`, data)
    return response.data
  },

  deleteJobPosition: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/job-positions/${id}/`)
  },

  // Companies
  getCompanies: async (params?: {
    page?: number
    page_size?: number
    search?: string
    is_active?: boolean
    active_only?: boolean
    owner_id?: number
  }): Promise<PaginatedResponse<Company>> => {
    const response = await apiClient.get<PaginatedResponse<Company>>('/api/v1/hr/companies/', {
      params,
    })
    return response.data
  },

  getCompany: async (id: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`/api/v1/hr/companies/${id}/`)
    return response.data
  },

  createCompany: async (data: Partial<Company>): Promise<Company> => {
    const response = await apiClient.post<Company>('/api/v1/hr/companies/', data)
    return response.data
  },

  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> => {
    const response = await apiClient.patch<Company>(`/api/v1/hr/companies/${id}/`, data)
    return response.data
  },

  deleteCompany: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/companies/${id}/`)
  },

  // Payroll
  getPayrolls: async (params?: {
    page?: number
    page_size?: number
    employee_id?: number
    month?: number
    year?: number
    department_id?: number
  }): Promise<PaginatedResponse<Payroll>> => {
    const response = await apiClient.get<PaginatedResponse<Payroll>>('/api/v1/hr/payroll/', {
      params,
    })
    return response.data
  },

  getPayroll: async (id: number): Promise<Payroll> => {
    const response = await apiClient.get<Payroll>(`/api/v1/hr/payroll/${id}/`)
    return response.data
  },

  processPayroll: async (data: {
    employee_ids: number[]
    month: number
    year: number
  }): Promise<{ processed: any[]; errors: string[] }> => {
    const response = await apiClient.post('/api/v1/hr/payroll/process/', data)
    return response.data
  },

  recalculatePayroll: async (id: number): Promise<Payroll> => {
    const response = await apiClient.post<Payroll>(`/api/v1/hr/payroll/${id}/recalculate/`)
    return response.data
  },

  // Time Records
  getTimeRecords: async (params?: {
    page?: number
    page_size?: number
    employee_id?: number
    date_from?: string
    date_to?: string
    is_approved?: boolean
  }): Promise<PaginatedResponse<TimeRecord>> => {
    const response = await apiClient.get<PaginatedResponse<TimeRecord>>(
      '/api/v1/hr/time-records/',
      {
        params,
      }
    )
    return response.data
  },

  getTimeRecord: async (id: number): Promise<TimeRecord> => {
    const response = await apiClient.get<TimeRecord>(`/api/v1/hr/time-records/${id}/`)
    return response.data
  },

  createTimeRecord: async (data: Partial<TimeRecord>): Promise<TimeRecord> => {
    const response = await apiClient.post<TimeRecord>('/api/v1/hr/time-records/', data)
    return response.data
  },

  updateTimeRecord: async (id: number, data: Partial<TimeRecord>): Promise<TimeRecord> => {
    const response = await apiClient.patch<TimeRecord>(`/api/v1/hr/time-records/${id}/`, data)
    return response.data
  },

  deleteTimeRecord: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/time-records/${id}/`)
  },

  approveTimeRecord: async (id: number): Promise<TimeRecord> => {
    const response = await apiClient.post<TimeRecord>(`/api/v1/hr/time-records/${id}/approve/`)
    return response.data
  },

  // Vacations
  getVacations: async (params?: {
    page?: number
    page_size?: number
    employee_id?: number
    status?: string
    date_from?: string
    date_to?: string
  }): Promise<PaginatedResponse<Vacation>> => {
    const response = await apiClient.get<PaginatedResponse<Vacation>>('/api/v1/hr/vacations/', {
      params,
    })
    return response.data
  },

  getVacation: async (id: number): Promise<Vacation> => {
    const response = await apiClient.get<Vacation>(`/api/v1/hr/vacations/${id}/`)
    return response.data
  },

  createVacation: async (data: Partial<Vacation>): Promise<Vacation> => {
    const response = await apiClient.post<Vacation>('/api/v1/hr/vacations/', data)
    return response.data
  },

  updateVacation: async (id: number, data: Partial<Vacation>): Promise<Vacation> => {
    const response = await apiClient.patch<Vacation>(`/api/v1/hr/vacations/${id}/`, data)
    return response.data
  },

  deleteVacation: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/vacations/${id}/`)
  },

  approveVacation: async (id: number): Promise<Vacation> => {
    const response = await apiClient.post<Vacation>(`/api/v1/hr/vacations/${id}/approve/`)
    return response.data
  },

  rejectVacation: async (id: number, reason?: string): Promise<Vacation> => {
    const response = await apiClient.post<Vacation>(`/api/v1/hr/vacations/${id}/reject/`, {
      rejection_reason: reason,
    })
    return response.data
  },

  getVacationBalance: async (employeeId: number, asOfDate?: string): Promise<any> => {
    const response = await apiClient.get('/api/v1/hr/vacations/balance/', {
      params: {
        employee_id: employeeId,
        as_of_date: asOfDate,
      },
    })
    return response.data
  },

  calculateTimeRecordHours: async (params: {
    employee_id: number
    year: number
    month: number
  }): Promise<any> => {
    const response = await apiClient.get('/api/v1/hr/time-records/calculate_hours/', {
      params,
    })
    return response.data
  },

  // Benefits
  getBenefits: async (params?: {
    page?: number
    page_size?: number
    benefit_type?: string
    is_active?: boolean
  }): Promise<PaginatedResponse<Benefit>> => {
    const response = await apiClient.get<PaginatedResponse<Benefit>>('/api/v1/hr/benefits/', {
      params,
    })
    return response.data
  },

  getBenefit: async (id: number): Promise<Benefit> => {
    const response = await apiClient.get<Benefit>(`/api/v1/hr/benefits/${id}/`)
    return response.data
  },

  createBenefit: async (data: Partial<Benefit>): Promise<Benefit> => {
    const response = await apiClient.post<Benefit>('/api/v1/hr/benefits/', data)
    return response.data
  },

  updateBenefit: async (id: number, data: Partial<Benefit>): Promise<Benefit> => {
    const response = await apiClient.patch<Benefit>(`/api/v1/hr/benefits/${id}/`, data)
    return response.data
  },

  deleteBenefit: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/benefits/${id}/`)
  },

  // Employee Benefits
  getEmployeeBenefits: async (params?: {
    page?: number
    page_size?: number
    employee_id?: number
    benefit_id?: number
    is_active?: boolean
  }): Promise<PaginatedResponse<EmployeeBenefit>> => {
    const response = await apiClient.get<PaginatedResponse<EmployeeBenefit>>(
      '/api/v1/hr/employee-benefits/',
      {
        params,
      }
    )
    return response.data
  },

  getEmployeeBenefit: async (id: number): Promise<EmployeeBenefit> => {
    const response = await apiClient.get<EmployeeBenefit>(`/api/v1/hr/employee-benefits/${id}/`)
    return response.data
  },

  createEmployeeBenefit: async (data: Partial<EmployeeBenefit>): Promise<EmployeeBenefit> => {
    const response = await apiClient.post<EmployeeBenefit>('/api/v1/hr/employee-benefits/', data)
    return response.data
  },

  updateEmployeeBenefit: async (
    id: number,
    data: Partial<EmployeeBenefit>
  ): Promise<EmployeeBenefit> => {
    const response = await apiClient.patch<EmployeeBenefit>(
      `/api/v1/hr/employee-benefits/${id}/`,
      data
    )
    return response.data
  },

  deleteEmployeeBenefit: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/employee-benefits/${id}/`)
  },

  // Performance Reviews
  getPerformanceReviews: async (params?: {
    page?: number
    page_size?: number
    employee_id?: number
    reviewer_id?: number
    status?: string
  }): Promise<PaginatedResponse<PerformanceReview>> => {
    const response = await apiClient.get<PaginatedResponse<PerformanceReview>>(
      '/api/v1/hr/performance-reviews/',
      {
        params,
      }
    )
    return response.data
  },

  getPerformanceReview: async (id: number): Promise<PerformanceReview> => {
    const response = await apiClient.get<PerformanceReview>(`/api/v1/hr/performance-reviews/${id}/`)
    return response.data
  },

  createPerformanceReview: async (data: Partial<PerformanceReview>): Promise<PerformanceReview> => {
    const response = await apiClient.post<PerformanceReview>(
      '/api/v1/hr/performance-reviews/',
      data
    )
    return response.data
  },

  updatePerformanceReview: async (
    id: number,
    data: Partial<PerformanceReview>
  ): Promise<PerformanceReview> => {
    const response = await apiClient.patch<PerformanceReview>(
      `/api/v1/hr/performance-reviews/${id}/`,
      data
    )
    return response.data
  },

  deletePerformanceReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/performance-reviews/${id}/`)
  },

  // Trainings
  getTrainings: async (params?: {
    page?: number
    page_size?: number
    search?: string
    is_active?: boolean
    training_type?: string
  }): Promise<PaginatedResponse<Training>> => {
    const response = await apiClient.get<PaginatedResponse<Training>>('/api/v1/hr/trainings/', {
      params,
    })
    return response.data
  },

  getTraining: async (id: number): Promise<Training> => {
    const response = await apiClient.get<Training>(`/api/v1/hr/trainings/${id}/`)
    return response.data
  },

  createTraining: async (data: Partial<Training>): Promise<Training> => {
    const response = await apiClient.post<Training>('/api/v1/hr/trainings/', data)
    return response.data
  },

  updateTraining: async (id: number, data: Partial<Training>): Promise<Training> => {
    const response = await apiClient.patch<Training>(`/api/v1/hr/trainings/${id}/`, data)
    return response.data
  },

  deleteTraining: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/trainings/${id}/`)
  },

  enrollEmployee: async (trainingId: number, employeeId: number): Promise<EmployeeTraining> => {
    const response = await apiClient.post<EmployeeTraining>(
      `/api/v1/hr/trainings/${trainingId}/enroll/`,
      {
        employee_id: employeeId,
      }
    )
    return response.data
  },

  // Employee Trainings
  getEmployeeTrainings: async (params?: {
    page?: number
    page_size?: number
    employee_id?: number
    training_id?: number
    status?: string
  }): Promise<PaginatedResponse<EmployeeTraining>> => {
    const response = await apiClient.get<PaginatedResponse<EmployeeTraining>>(
      '/api/v1/hr/employee-trainings/',
      {
        params,
      }
    )
    return response.data
  },

  getEmployeeTraining: async (id: number): Promise<EmployeeTraining> => {
    const response = await apiClient.get<EmployeeTraining>(`/api/v1/hr/employee-trainings/${id}/`)
    return response.data
  },

  createEmployeeTraining: async (data: Partial<EmployeeTraining>): Promise<EmployeeTraining> => {
    const response = await apiClient.post<EmployeeTraining>('/api/v1/hr/employee-trainings/', data)
    return response.data
  },

  updateEmployeeTraining: async (id: number, data: Partial<EmployeeTraining>): Promise<EmployeeTraining> => {
    const response = await apiClient.patch<EmployeeTraining>(`/api/v1/hr/employee-trainings/${id}/`, data)
    return response.data
  },

  deleteEmployeeTraining: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/employee-trainings/${id}/`)
  },

  // Job Openings
  getJobOpenings: async (params?: {
    page?: number
    page_size?: number
    search?: string
    status?: string
    department_id?: number
    // warehouse_id?: number  // TODO: Uncomment when warehouse module is ready
  }): Promise<PaginatedResponse<JobOpening>> => {
    const response = await apiClient.get<PaginatedResponse<JobOpening>>(
      '/api/v1/hr/job-openings/',
      {
        params,
      }
    )
    return response.data
  },

  getJobOpening: async (id: number): Promise<JobOpening> => {
    const response = await apiClient.get<JobOpening>(`/api/v1/hr/job-openings/${id}/`)
    return response.data
  },

  createJobOpening: async (data: Partial<JobOpening>): Promise<JobOpening> => {
    const response = await apiClient.post<JobOpening>('/api/v1/hr/job-openings/', data)
    return response.data
  },

  updateJobOpening: async (id: number, data: Partial<JobOpening>): Promise<JobOpening> => {
    const response = await apiClient.patch<JobOpening>(`/api/v1/hr/job-openings/${id}/`, data)
    return response.data
  },

  deleteJobOpening: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/job-openings/${id}/`)
  },

  // Candidates
  getCandidates: async (params?: {
    page?: number
    page_size?: number
    job_opening_id?: number
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Candidate>> => {
    const response = await apiClient.get<PaginatedResponse<Candidate>>('/api/v1/hr/candidates/', {
      params,
    })
    return response.data
  },

  getCandidate: async (id: number): Promise<Candidate> => {
    const response = await apiClient.get<Candidate>(`/api/v1/hr/candidates/${id}/`)
    return response.data
  },

  createCandidate: async (data: FormData): Promise<Candidate> => {
    const response = await apiClient.post<Candidate>('/api/v1/hr/candidates/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  updateCandidate: async (id: number, data: Partial<Candidate> | FormData): Promise<Candidate> => {
    const response = await apiClient.patch<Candidate>(`/api/v1/hr/candidates/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
    return response.data
  },

  deleteCandidate: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/candidates/${id}/`)
  },

  // Bank Accounts
  getBankAccounts: async (params?: {
    page?: number
    page_size?: number
    search?: string
    employee?: number
    is_primary?: boolean
    is_active?: boolean
  }): Promise<PaginatedResponse<BankAccount>> => {
    const response = await apiClient.get<PaginatedResponse<BankAccount>>('/api/v1/hr/bank-accounts/', {
      params,
    })
    return response.data
  },

  createBankAccount: async (data: Partial<BankAccount>): Promise<BankAccount> => {
    const response = await apiClient.post<BankAccount>('/api/v1/hr/bank-accounts/', data)
    return response.data
  },

  updateBankAccount: async (id: number, data: Partial<BankAccount>): Promise<BankAccount> => {
    const response = await apiClient.patch<BankAccount>(`/api/v1/hr/bank-accounts/${id}/`, data)
    return response.data
  },

  deleteBankAccount: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/bank-accounts/${id}/`)
  },

  // Dependents
  getDependents: async (params?: {
    page?: number
    page_size?: number
    search?: string
    employee?: number
    relationship?: string
    is_tax_dependent?: boolean
    is_active?: boolean
  }): Promise<PaginatedResponse<Dependent>> => {
    const response = await apiClient.get<PaginatedResponse<Dependent>>('/api/v1/hr/dependents/', {
      params,
    })
    return response.data
  },

  createDependent: async (data: Partial<Dependent>): Promise<Dependent> => {
    const response = await apiClient.post<Dependent>('/api/v1/hr/dependents/', data)
    return response.data
  },

  updateDependent: async (id: number, data: Partial<Dependent>): Promise<Dependent> => {
    const response = await apiClient.patch<Dependent>(`/api/v1/hr/dependents/${id}/`, data)
    return response.data
  },

  deleteDependent: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/dependents/${id}/`)
  },

  // Education
  getEducations: async (params?: {
    page?: number
    page_size?: number
    search?: string
    employee?: number
    level?: string
    is_completed?: boolean
  }): Promise<PaginatedResponse<Education>> => {
    const response = await apiClient.get<PaginatedResponse<Education>>('/api/v1/hr/educations/', {
      params,
    })
    return response.data
  },

  createEducation: async (data: Partial<Education> | FormData): Promise<Education> => {
    const response = await apiClient.post<Education>('/api/v1/hr/educations/', data, {
      headers: data instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    })
    return response.data
  },

  updateEducation: async (id: number, data: Partial<Education> | FormData): Promise<Education> => {
    const response = await apiClient.patch<Education>(`/api/v1/hr/educations/${id}/`, data, {
      headers: data instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    })
    return response.data
  },

  deleteEducation: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/educations/${id}/`)
  },

  // Work Experience
  getWorkExperiences: async (params?: {
    page?: number
    page_size?: number
    search?: string
    employee?: number
    is_current?: boolean
  }): Promise<PaginatedResponse<WorkExperience>> => {
    const response = await apiClient.get<PaginatedResponse<WorkExperience>>('/api/v1/hr/work-experiences/', {
      params,
    })
    return response.data
  },

  createWorkExperience: async (data: Partial<WorkExperience>): Promise<WorkExperience> => {
    const response = await apiClient.post<WorkExperience>('/api/v1/hr/work-experiences/', data)
    return response.data
  },

  updateWorkExperience: async (id: number, data: Partial<WorkExperience>): Promise<WorkExperience> => {
    const response = await apiClient.patch<WorkExperience>(`/api/v1/hr/work-experiences/${id}/`, data)
    return response.data
  },

  deleteWorkExperience: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/work-experiences/${id}/`)
  },

  // Contracts
  getContracts: async (params?: {
    page?: number
    page_size?: number
    search?: string
    employee?: number
    contract_type?: string
    status?: string
  }): Promise<PaginatedResponse<Contract>> => {
    const response = await apiClient.get<PaginatedResponse<Contract>>('/api/v1/hr/contracts/', {
      params,
    })
    return response.data
  },

  getContract: async (id: number): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`/api/v1/hr/contracts/${id}/`)
    return response.data
  },

  createContract: async (data: Partial<Contract>): Promise<Contract> => {
    const response = await apiClient.post<Contract>('/api/v1/hr/contracts/', data)
    return response.data
  },

  updateContract: async (id: number, data: Partial<Contract>): Promise<Contract> => {
    const response = await apiClient.patch<Contract>(`/api/v1/hr/contracts/${id}/`, data)
    return response.data
  },

  deleteContract: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/contracts/${id}/`)
  },

  generateContractPDF: async (id: number): Promise<Contract> => {
    const response = await apiClient.post<Contract>(`/api/v1/hr/contracts/${id}/generate_pdf/`)
    return response.data
  },

  generateContractForEmployee: async (data: {
    employee_id: number
    contract_type: string
    start_date?: string
    contract_data?: Record<string, any>
  }): Promise<Contract> => {
    const response = await apiClient.post<Contract>('/api/v1/hr/contracts/generate_for_employee/', data)
    return response.data
  },

  // Employee Documents
  getEmployeeDocuments: async (params?: {
    page?: number
    page_size?: number
    search?: string
    employee?: number
    document_type?: string
    is_active?: boolean
  }): Promise<PaginatedResponse<EmployeeDocument>> => {
    const response = await apiClient.get<PaginatedResponse<EmployeeDocument>>('/api/v1/hr/employee-documents/', {
      params,
    })
    return response.data
  },

  getEmployeeDocument: async (id: number): Promise<EmployeeDocument> => {
    const response = await apiClient.get<EmployeeDocument>(`/api/v1/hr/employee-documents/${id}/`)
    return response.data
  },

  createEmployeeDocument: async (data: FormData): Promise<EmployeeDocument> => {
    const response = await apiClient.post<EmployeeDocument>('/api/v1/hr/employee-documents/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  updateEmployeeDocument: async (id: number, data: Partial<EmployeeDocument> | FormData): Promise<EmployeeDocument> => {
    const response = await apiClient.patch<EmployeeDocument>(`/api/v1/hr/employee-documents/${id}/`, data, {
      headers: data instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    })
    return response.data
  },

  deleteEmployeeDocument: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/hr/employee-documents/${id}/`)
  },

  downloadEmployeeDocument: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/hr/employee-documents/${id}/download/`, {
      responseType: 'blob',
    })
    return response.data
  },

  getExpiringDocuments: async (days?: number): Promise<EmployeeDocument[]> => {
    const response = await apiClient.get<EmployeeDocument[]>('/api/v1/hr/employee-documents/expiring_soon/', {
      params: { days },
    })
    return response.data
  },

  // Employee History
  getEmployeeHistory: async (params?: {
    page?: number
    page_size?: number
    employee?: number
    change_type?: string
    ordering?: string
  }): Promise<PaginatedResponse<EmployeeHistory>> => {
    const response = await apiClient.get<PaginatedResponse<EmployeeHistory>>('/api/v1/hr/employee-history/', {
      params,
    })
    return response.data
  },

  getEmployeeHistoryEntry: async (id: number): Promise<EmployeeHistory> => {
    const response = await apiClient.get<EmployeeHistory>(`/api/v1/hr/employee-history/${id}/`)
    return response.data
  },

  // HR Notifications
  getNotifications: async (params?: {
    page?: number
    page_size?: number
    employee?: number
    notification_type?: string
    is_read?: boolean
  }): Promise<PaginatedResponse<HRNotification>> => {
    const response = await apiClient.get<PaginatedResponse<HRNotification>>('/api/v1/hr/notifications/', {
      params,
    })
    return response.data
  },

  getNotification: async (id: number): Promise<HRNotification> => {
    const response = await apiClient.get<HRNotification>(`/api/v1/hr/notifications/${id}/`)
    return response.data
  },

  markNotificationAsRead: async (id: number): Promise<HRNotification> => {
    const response = await apiClient.post<HRNotification>(`/api/v1/hr/notifications/${id}/mark_read/`)
    return response.data
  },

  markAllNotificationsAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/api/v1/hr/notifications/mark_all_read/')
    return response.data
  },

  getUnreadNotificationsCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/api/v1/hr/notifications/unread_count/')
    return response.data
  },
}
