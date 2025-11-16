'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmployeeForm } from '@/components/hr/EmployeeForm'
import { EmployeeDocumentForm } from '@/components/hr/EmployeeDocumentForm'
import { DocumentViewer } from '@/components/hr/DocumentViewer'
import { ContractForm } from '@/components/hr/ContractForm'
import { EmployeeBenefitForm } from '@/components/hr/EmployeeBenefitForm'
import { BankAccountForm } from '@/components/hr/BankAccountForm'
import { DependentForm } from '@/components/hr/DependentForm'
import { EducationForm } from '@/components/hr/EducationForm'
import { WorkExperienceForm } from '@/components/hr/WorkExperienceForm'
import { EmployeeTrainingForm } from '@/components/hr/EmployeeTrainingForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  ArrowLeft,
  Edit,
  User,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  Award,
  GraduationCap,
  Building2,
  Users,
  History,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileCheck,
  Trash2,
  Plus,
} from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import {
  Employee,
  EmployeeDocument,
  Contract,
  EmployeeHistory,
  EmployeeBenefit,
  BankAccount,
  Dependent,
  Education,
  WorkExperience,
  EmployeeTraining,
} from '@/types/api'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/lib/hooks/use-toast'

export default function EmployeeProfilePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [documentFormOpen, setDocumentFormOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [documentToView, setDocumentToView] = useState<EmployeeDocument | null>(null)
  const [contractFormOpen, setContractFormOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [benefitFormOpen, setBenefitFormOpen] = useState(false)
  const [selectedBenefit, setSelectedBenefit] = useState<EmployeeBenefit | null>(null)
  const [deleteBenefitDialogOpen, setDeleteBenefitDialogOpen] = useState(false)
  const [benefitToDelete, setBenefitToDelete] = useState<EmployeeBenefit | null>(null)
  const [bankAccountFormOpen, setBankAccountFormOpen] = useState(false)
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null)
  const [dependentFormOpen, setDependentFormOpen] = useState(false)
  const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(null)
  const [educationFormOpen, setEducationFormOpen] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null)
  const [workExperienceFormOpen, setWorkExperienceFormOpen] = useState(false)
  const [selectedWorkExperience, setSelectedWorkExperience] = useState<WorkExperience | null>(null)
  const [employeeTrainingFormOpen, setEmployeeTrainingFormOpen] = useState(false)
  const [selectedEmployeeTraining, setSelectedEmployeeTraining] = useState<EmployeeTraining | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'bankAccount' | 'dependent' | 'education' | 'workExperience' | 'employeeTraining'
    id: number
  } | null>(null)

  const employeeId = parseInt(id)

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['hr', 'employees', employeeId],
    queryFn: () => hrApi.getEmployee(employeeId),
    enabled: !isNaN(employeeId),
    retry: false,
  })

  const { data: bankAccounts } = useQuery({
    queryKey: ['hr', 'bank-accounts', employeeId],
    queryFn: () => hrApi.getBankAccounts({ employee: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: dependents } = useQuery({
    queryKey: ['hr', 'dependents', employeeId],
    queryFn: () => hrApi.getDependents({ employee: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: educations } = useQuery({
    queryKey: ['hr', 'educations', employeeId],
    queryFn: () => hrApi.getEducations({ employee: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: workExperiences } = useQuery({
    queryKey: ['hr', 'work-experiences', employeeId],
    queryFn: () => hrApi.getWorkExperiences({ employee: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: documents } = useQuery({
    queryKey: ['hr', 'employee-documents', employeeId],
    queryFn: () => hrApi.getEmployeeDocuments({ employee: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: contracts } = useQuery({
    queryKey: ['hr', 'contracts', employeeId],
    queryFn: () => hrApi.getContracts({ employee: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: history } = useQuery({
    queryKey: ['hr', 'employee-history', employeeId],
    queryFn: () => hrApi.getEmployeeHistory({ employee: employeeId, ordering: '-effective_date' }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: employeeBenefits } = useQuery({
    queryKey: ['hr', 'employee-benefits', employeeId],
    queryFn: () => hrApi.getEmployeeBenefits({ employee: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const { data: employeeTrainings } = useQuery({
    queryKey: ['hr', 'employee-trainings', employeeId],
    queryFn: () => hrApi.getEmployeeTrainings({ employee_id: employeeId }),
    enabled: !isNaN(employeeId) && !!employee,
  })

  const deleteBenefitMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteEmployeeBenefit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee-benefits', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees', employeeId] })
      toast({
        title: tCommon('success'),
        description: t('deleteEmployeeBenefitSuccess') || 'Benefit removed successfully',
      })
      setDeleteBenefitDialogOpen(false)
      setBenefitToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail ||
          error?.message ||
          tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const deleteBankAccountMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'bank-accounts', employeeId] })
      toast({
        title: tCommon('success'),
        description: t('deleteBankAccountSuccess') || 'Bank account deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const deleteDependentMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteDependent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'dependents', employeeId] })
      toast({
        title: tCommon('success'),
        description: t('deleteDependentSuccess') || 'Dependent deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const deleteEducationMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'educations', employeeId] })
      toast({
        title: tCommon('success'),
        description: t('deleteEducationSuccess') || 'Education deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const deleteWorkExperienceMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteWorkExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'work-experiences', employeeId] })
      toast({
        title: tCommon('success'),
        description: t('deleteWorkExperienceSuccess') || 'Work experience deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const deleteEmployeeTrainingMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteEmployeeTraining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee-trainings', employeeId] })
      toast({
        title: tCommon('success'),
        description: t('deleteEmployeeTrainingSuccess') || 'Employee training deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteEmployeeDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee-documents', employeeId] })
      toast({
        title: tCommon('success'),
        description: t('deleteDocumentSuccess') || 'Document deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (
    type: 'bankAccount' | 'dependent' | 'education' | 'workExperience' | 'employeeTraining' | 'document',
    id: number
  ) => {
    setItemToDelete({ type, id })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      switch (itemToDelete.type) {
        case 'bankAccount':
          deleteBankAccountMutation.mutate(itemToDelete.id)
          break
        case 'dependent':
          deleteDependentMutation.mutate(itemToDelete.id)
          break
        case 'education':
          deleteEducationMutation.mutate(itemToDelete.id)
          break
        case 'workExperience':
          deleteWorkExperienceMutation.mutate(itemToDelete.id)
          break
        case 'employeeTraining':
          deleteEmployeeTrainingMutation.mutate(itemToDelete.id)
          break
        case 'document':
          deleteDocumentMutation.mutate(itemToDelete.id)
          break
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">{tCommon('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <User className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">{tCommon('error')}</p>
          <p className="text-sm text-muted-foreground">
            {(error as any)?.response?.status === 404
              ? t('employeeNotFound') || 'Employee not found'
              : tCommon('error')}
          </p>
          <Button onClick={() => router.push('/hr/employees')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const userName = employee.user
    ? `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() || employee.user.email
    : employee.employee_number

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'resigned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/hr/employees')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700">
              <AvatarImage src={employee.photo_url} alt={userName} />
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                <User className="h-8 w-8 text-slate-400" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{userName}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t('employeeNumber')}: {employee.employee_number}
              </p>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {tCommon('edit')}
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(employee.status)}>
            {t(`statuses.${employee.status}`)}
          </Badge>
          {employee.job_position_name && (
            <Badge variant="outline">{employee.job_position_name}</Badge>
          )}
          {employee.department_name && (
            <Badge variant="outline">{employee.department_name}</Badge>
          )}
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">
              <User className="mr-2 h-4 w-4" />
              {t('personalInfo')}
            </TabsTrigger>
            <TabsTrigger value="professional">
              <Briefcase className="mr-2 h-4 w-4" />
              {t('professionalInfo')}
            </TabsTrigger>
            <TabsTrigger value="contract">
              <FileText className="mr-2 h-4 w-4" />
              {t('contract')}
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileCheck className="mr-2 h-4 w-4" />
              {t('documents') || 'Documents'}
            </TabsTrigger>
            <TabsTrigger value="bank">
              <CreditCard className="mr-2 h-4 w-4" />
              {t('bankAccounts') || 'Bank Accounts'}
            </TabsTrigger>
            <TabsTrigger value="dependents">
              <Users className="mr-2 h-4 w-4" />
              {t('dependents') || 'Dependents'}
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="mr-2 h-4 w-4" />
              {t('education') || 'Education'}
            </TabsTrigger>
            <TabsTrigger value="experience">
              <Building2 className="mr-2 h-4 w-4" />
              {t('workExperience') || 'Work Experience'}
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              {t('history') || 'History'}
            </TabsTrigger>
            <TabsTrigger value="benefits">
              <Award className="mr-2 h-4 w-4" />
              {t('benefits') || 'Benefits'}
            </TabsTrigger>
            <TabsTrigger value="training">
              <GraduationCap className="mr-2 h-4 w-4" />
              {t('training') || 'Training'}
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('personalInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.date_of_birth && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('dateOfBirth')}</p>
                      <p className="font-medium">
                        {format(new Date(employee.date_of_birth), 'PPP')}
                      </p>
                    </div>
                  )}
                  {employee.nationality && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('nationality')}</p>
                      <p className="font-medium">{employee.nationality}</p>
                    </div>
                  )}
                  {employee.cpf && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('cpf')}</p>
                      <p className="font-medium">{employee.cpf}</p>
                    </div>
                  )}
                  {employee.ssn && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('ssn')}</p>
                      <p className="font-medium">{employee.ssn}</p>
                    </div>
                  )}
                  {employee.rg && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('rg')}</p>
                      <p className="font-medium">{employee.rg}</p>
                    </div>
                  )}
                  {employee.gender && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('gender')}</p>
                      <p className="font-medium">{t(`genders.${employee.gender}`)}</p>
                    </div>
                  )}
                  {employee.marital_status && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('maritalStatus')}</p>
                      <p className="font-medium">
                        {t(`maritalStatuses.${employee.marital_status}`)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('address')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('address')}</p>
                      <p className="font-medium">{employee.address}</p>
                    </div>
                  )}
                  {(employee.city || employee.state || employee.zip_code) && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('city')} / {t('state')} / {t('zipCode')}
                      </p>
                      <p className="font-medium">
                        {[employee.city, employee.state, employee.zip_code]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  {employee.country && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('country')}</p>
                      <p className="font-medium">{employee.country}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('emergencyContact')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.emergency_contact_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('contactName')}</p>
                      <p className="font-medium">{employee.emergency_contact_name}</p>
                    </div>
                  )}
                  {employee.emergency_contact_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('contactPhone')}</p>
                      <p className="font-medium">{employee.emergency_contact_phone}</p>
                    </div>
                  )}
                  {employee.emergency_contact_relation && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('contactRelation')}</p>
                      <p className="font-medium">{employee.emergency_contact_relation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('professionalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {employee.job_position_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('jobPosition')}</p>
                      <p className="font-medium">{employee.job_position_name}</p>
                    </div>
                  )}
                  {employee.job_title && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('jobTitle')}</p>
                      <p className="font-medium">{employee.job_title}</p>
                    </div>
                  )}
                  {employee.department_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('department')}</p>
                      <p className="font-medium">{employee.department_name}</p>
                    </div>
                  )}
                  {employee.supervisor_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('supervisor')}</p>
                      <p className="font-medium">{employee.supervisor_name}</p>
                    </div>
                  )}
                  {employee.hire_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('hireDate')}</p>
                      <p className="font-medium">
                        {format(new Date(employee.hire_date), 'PPP')}
                      </p>
                    </div>
                  )}
                  {employee.base_salary && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('baseSalary')}</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(parseFloat(employee.base_salary))}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contract Tab */}
          <TabsContent value="contract" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('contract')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('contractType')}</p>
                    <p className="font-medium">{t(`contractTypes.${employee.contract_type}`)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('hireType')}</p>
                    <p className="font-medium">{t(employee.hire_type === 'individual' ? 'individual' : 'hireTypeCompany')}</p>
                  </div>
                  {employee.company_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('company')}</p>
                      <p className="font-medium">{employee.company_name}</p>
                    </div>
                  )}
                  {employee.probation_period_days && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('probationPeriodDays')}</p>
                      <p className="font-medium">{employee.probation_period_days} {t('days') || 'days'}</p>
                    </div>
                  )}
                  {employee.work_shift && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('workShift')}</p>
                      <p className="font-medium">{t(`workShifts.${employee.work_shift}`)}</p>
                    </div>
                  )}
                  {employee.weekly_hours && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('weeklyHours')}</p>
                      <p className="font-medium">{employee.weekly_hours} {t('hours') || 'hours'}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{t('contracts') || 'Contracts'}</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedContract(null)
                        setContractFormOpen(true)
                      }}
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      {t('generateContract') || 'Generate Contract'}
                    </Button>
                  </div>
                  {contracts && contracts.results && contracts.results.length > 0 ? (
                    <div className="space-y-2">
                      {contracts.results.map(contract => (
                        <div
                          key={contract.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{contract.contract_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {t(`contractTypes.${contract.contract_type}`)} - {t(`statuses.${contract.status}`)}
                            </p>
                            {contract.start_date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('startDate') || 'Start'}: {format(new Date(contract.start_date), 'PPP')}
                                {contract.end_date && ` - ${t('endDate') || 'End'}: ${format(new Date(contract.end_date), 'PPP')}`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {contract.pdf_file_url ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={contract.pdf_file_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="mr-2 h-4 w-4" />
                                  {t('download') || 'Download'}
                                </a>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await hrApi.generateContractPDF(contract.id)
                                    queryClient.invalidateQueries({ queryKey: ['hr', 'contracts', employeeId] })
                                    toast({
                                      title: tCommon('success'),
                                      description: t('contractPDFGenerated') || 'PDF generated successfully',
                                    })
                                  } catch (error: any) {
                                    toast({
                                      title: tCommon('error'),
                                      description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
                                      variant: 'destructive',
                                    })
                                  }
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                {t('generatePDF') || 'Generate PDF'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedContract(contract)
                                setContractFormOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg">
                      <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">{t('noContracts') || 'No contracts found'}</p>
                      <Button
                        onClick={() => {
                          setSelectedContract(null)
                          setContractFormOpen(true)
                        }}
                        variant="outline"
                      >
                        <FileCheck className="mr-2 h-4 w-4" />
                        {t('generateContract') || 'Generate Contract'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('documents') || 'Documents'}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDocument(null)
                      setDocumentFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newDocument') || 'New Document'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documents && documents.results && documents.results.length > 0 ? (
                  <div className="space-y-2">
                    {documents.results.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t(`documentTypes.${doc.document_type}`) || doc.document_type}
                            {doc.expiry_date && ` - ${t('expires') || 'Expires'}: ${format(new Date(doc.expiry_date), 'PPP')}`}
                          </p>
                        </div>
                        {doc.file_url && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDocumentToView(doc)
                                setDocumentViewerOpen(true)
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {t('view') || 'View'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedDocument(doc)
                                setDocumentFormOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete('document', doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noDocuments') || 'No documents found'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Accounts Tab */}
          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('bankAccounts') || 'Bank Accounts'}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedBankAccount(null)
                      setBankAccountFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newBankAccount') || 'New Bank Account'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bankAccounts && bankAccounts.results && bankAccounts.results.length > 0 ? (
                  <div className="space-y-2">
                    {bankAccounts.results.map(account => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{account.bank_name}</p>
                            {account.is_primary && (
                              <Badge variant="default">{t('primary') || 'Primary'}</Badge>
                            )}
                            {account.is_active ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                {t('active')}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
                                {t('inactive')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('agency') || 'Agency'}: {account.agency} - {t('accountNumber') || 'Account'}: {account.account_number}
                            {account.account_type && ` (${t(account.account_type) || account.account_type})`}
                          </p>
                          {account.pix_key && (
                            <p className="text-sm text-muted-foreground">
                              PIX: {account.pix_key}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBankAccount(account)
                              setBankAccountFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('bankAccount', account.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('noBankAccounts') || 'No bank accounts found'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedBankAccount(null)
                        setBankAccountFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newBankAccount') || 'New Bank Account'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dependents Tab */}
          <TabsContent value="dependents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('dependents') || 'Dependents'}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDependent(null)
                      setDependentFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newDependent') || 'New Dependent'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dependents && dependents.results && dependents.results.length > 0 ? (
                  <div className="space-y-2">
                    {dependents.results.map(dependent => (
                      <div key={dependent.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{dependent.name}</p>
                            {dependent.is_tax_dependent && (
                              <Badge variant="outline">{t('isTaxDependent') || 'Tax Dependent'}</Badge>
                            )}
                            {dependent.is_active ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                {t('active')}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
                                {t('inactive')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t(`relationships.${dependent.relationship}`) || dependent.relationship}
                            {dependent.date_of_birth && ` - ${format(new Date(dependent.date_of_birth), 'PPP')}`}
                          </p>
                          {dependent.cpf && (
                            <p className="text-sm text-muted-foreground">CPF: {dependent.cpf}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDependent(dependent)
                              setDependentFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('dependent', dependent.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('noDependents') || 'No dependents found'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDependent(null)
                        setDependentFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newDependent') || 'New Dependent'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('education') || 'Education'}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedEducation(null)
                      setEducationFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newEducation') || 'New Education'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {educations && educations.results && educations.results.length > 0 ? (
                  <div className="space-y-4">
                    {educations.results.map(education => (
                      <div key={education.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{education.institution}</p>
                            {education.is_completed && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                {t('completed')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t(`educationLevels.${education.level}`) || education.level}
                            {education.course && ` - ${education.course}`}
                          </p>
                          {education.graduation_year && (
                            <p className="text-sm text-muted-foreground">
                              {t('graduationYear') || 'Graduation Year'}: {education.graduation_year}
                            </p>
                          )}
                          {education.start_date && education.end_date && (
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(education.start_date), 'PPP')} - {format(new Date(education.end_date), 'PPP')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEducation(education)
                              setEducationFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('education', education.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('noEducation') || 'No education records found'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedEducation(null)
                        setEducationFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newEducation') || 'New Education'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('workExperience') || 'Work Experience'}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedWorkExperience(null)
                      setWorkExperienceFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newWorkExperience') || 'New Work Experience'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {workExperiences && workExperiences.results && workExperiences.results.length > 0 ? (
                  <div className="space-y-4">
                    {workExperiences.results.map(exp => (
                      <div key={exp.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{exp.company_name}</p>
                            {exp.is_current && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                {t('current') || 'Current'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{exp.job_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(exp.start_date), 'PPP')} -{' '}
                            {exp.is_current
                              ? t('current') || 'Current'
                              : exp.end_date
                                ? format(new Date(exp.end_date), 'PPP')
                                : ''}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {exp.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedWorkExperience(exp)
                              setWorkExperienceFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('workExperience', exp.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('noWorkExperience') || 'No work experience records found'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedWorkExperience(null)
                        setWorkExperienceFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newWorkExperience') || 'New Work Experience'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('history') || 'Employee History'}</CardTitle>
              </CardHeader>
              <CardContent>
                {history && history.results && history.results.length > 0 ? (
                  <div className="space-y-4">
                    {history.results.map((entry: EmployeeHistory) => (
                      <div key={entry.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {entry.change_type_display || t(`changeTypes.${entry.change_type}`) || entry.change_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(entry.effective_date), 'PPP')}
                            </span>
                          </div>
                          {entry.changed_by_name && (
                            <span className="text-sm text-muted-foreground">
                              {t('changedBy') || 'Changed by'}: {entry.changed_by_name}
                            </span>
                          )}
                        </div>
                        
                        {(entry.old_job_title || entry.new_job_title) && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">{t('jobTitle') || 'Job Title'}: </span>
                            {entry.old_job_title && (
                              <span className="line-through text-muted-foreground mr-2">{entry.old_job_title}</span>
                            )}
                            {entry.new_job_title && (
                              <span className="font-medium">{entry.new_job_title}</span>
                            )}
                          </div>
                        )}

                        {(entry.old_department_name || entry.new_department_name) && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">{t('department') || 'Department'}: </span>
                            {entry.old_department_name && (
                              <span className="line-through text-muted-foreground mr-2">{entry.old_department_name}</span>
                            )}
                            {entry.new_department_name && (
                              <span className="font-medium">{entry.new_department_name}</span>
                            )}
                          </div>
                        )}

                        {(entry.old_salary || entry.new_salary) && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">{t('salary') || 'Salary'}: </span>
                            {entry.old_salary && (
                              <span className="line-through text-muted-foreground mr-2">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                }).format(parseFloat(entry.old_salary))}
                              </span>
                            )}
                            {entry.new_salary && (
                              <span className="font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                }).format(parseFloat(entry.new_salary))}
                              </span>
                            )}
                          </div>
                        )}

                        {entry.reason && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">{t('reason') || 'Reason'}: </span>
                            <span>{entry.reason}</span>
                          </div>
                        )}

                        {entry.notes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">{t('notes') || 'Notes'}: </span>
                            <span>{entry.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noHistory') || 'No history records found'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('benefits') || 'Benefits'}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedBenefit(null)
                      setBenefitFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newEmployeeBenefit') || 'Assign Benefit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {employeeBenefits && employeeBenefits.results && employeeBenefits.results.length > 0 ? (
                  <div className="space-y-2">
                    {employeeBenefits.results.map((benefit: EmployeeBenefit) => (
                      <div
                        key={benefit.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {benefit.benefit?.name || t('benefit') || 'Benefit'}
                            </p>
                            {benefit.is_active ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {t('active') || 'Active'}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                {t('inactive') || 'Inactive'}
                              </Badge>
                            )}
                          </div>
                          {benefit.benefit?.benefit_type && (
                            <p className="text-sm text-muted-foreground text-sm">
                              {t(`benefitTypes.${benefit.benefit.benefit_type}`) ||
                                t(benefit.benefit.benefit_type) ||
                                benefit.benefit.benefit_type}
                            </p>
                          )}
                          {benefit.value && (
                            <p className="text-sm text-muted-foreground">
                              {t('value') || 'Value'}:{' '}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(Number(benefit.value))}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('startDate') || 'Start'}:{' '}
                            {benefit.start_date
                              ? format(new Date(benefit.start_date), 'PPP')
                              : '-'}
                            {benefit.end_date &&
                              ` - ${t('endDate') || 'End'}: ${format(new Date(benefit.end_date), 'PPP')}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBenefit(benefit)
                              setBenefitFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBenefitToDelete(benefit)
                              setDeleteBenefitDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('noEmployeeBenefits') || 'No benefits assigned'}
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedBenefit(null)
                        setBenefitFormOpen(true)
                      }}
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newEmployeeBenefit') || 'Assign Benefit'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('training') || 'Training'}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedEmployeeTraining(null)
                      setEmployeeTrainingFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newEmployeeTraining') || 'New Training'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {employeeTrainings && employeeTrainings.results && employeeTrainings.results.length > 0 ? (
                  <div className="space-y-4">
                    {employeeTrainings.results.map(training => (
                      <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{training.training?.name || t('training') || 'Training'}</p>
                            {training.status && (
                              <Badge variant="outline" className={
                                training.status === 'completed'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : training.status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                              }>
                                {t(`trainingStatuses.${training.status}`) || training.status}
                              </Badge>
                            )}
                          </div>
                          {training.training?.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {training.training.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {training.enrollment_date && (
                              <span>
                                {t('enrollmentDate') || 'Enrollment'}: {format(new Date(training.enrollment_date), 'PPP')}
                              </span>
                            )}
                            {training.completion_date && (
                              <span>
                                {t('completionDate') || 'Completion'}: {format(new Date(training.completion_date), 'PPP')}
                              </span>
                            )}
                            {training.score && (
                              <span>
                                {t('score') || 'Score'}: {training.score}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEmployeeTraining(training)
                              setEmployeeTrainingFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('employeeTraining', training.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('noEmployeeTrainings') || 'No training records found'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedEmployeeTraining(null)
                        setEmployeeTrainingFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newEmployeeTraining') || 'New Training'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Form */}
        <EmployeeForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          employee={employee}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'employees', employeeId] })
            queryClient.invalidateQueries({ queryKey: ['hr'] })
          }}
        />
        <EmployeeDocumentForm
          open={documentFormOpen}
          onClose={() => {
            setDocumentFormOpen(false)
            setSelectedDocument(null)
          }}
          employeeId={employeeId}
          document={selectedDocument || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'employee-documents', employeeId] })
          }}
        />
        <ContractForm
          open={contractFormOpen}
          onClose={() => {
            setContractFormOpen(false)
            setSelectedContract(null)
          }}
          employeeId={employeeId}
          contract={selectedContract || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'contracts', employeeId] })
          }}
        />
        <EmployeeBenefitForm
          open={benefitFormOpen}
          onClose={() => {
            setBenefitFormOpen(false)
            setSelectedBenefit(null)
          }}
          employeeId={employeeId}
          employeeBenefit={selectedBenefit || undefined}
        />
        <ConfirmDialog
          open={deleteBenefitDialogOpen}
          onClose={() => {
            setDeleteBenefitDialogOpen(false)
            setBenefitToDelete(null)
          }}
          onConfirm={() => {
            if (benefitToDelete) {
              deleteBenefitMutation.mutate(benefitToDelete.id)
            }
          }}
          title={tCommon('confirmDelete') || 'Confirm Delete'}
          description={
            benefitToDelete
              ? t('deleteEmployeeBenefitConfirm', {
                  name: benefitToDelete.benefit?.name || t('benefit') || 'Benefit',
                }) ||
                `Are you sure you want to remove ${benefitToDelete.benefit?.name || 'this benefit'}? This action cannot be undone.`
              : t('deleteEmployeeBenefitConfirmGeneric') ||
                'Are you sure you want to remove this benefit? This action cannot be undone.'
          }
          confirmText={tCommon('delete')}
          cancelText={tCommon('cancel')}
          variant="destructive"
          isLoading={deleteBenefitMutation.isPending}
        />

        {/* Secondary Forms */}
        <BankAccountForm
          open={bankAccountFormOpen}
          onClose={() => {
            setBankAccountFormOpen(false)
            setSelectedBankAccount(null)
          }}
          employeeId={employeeId}
          bankAccount={selectedBankAccount || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'bank-accounts', employeeId] })
          }}
        />
        <DependentForm
          open={dependentFormOpen}
          onClose={() => {
            setDependentFormOpen(false)
            setSelectedDependent(null)
          }}
          employeeId={employeeId}
          dependent={selectedDependent || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'dependents', employeeId] })
          }}
        />
        <EducationForm
          open={educationFormOpen}
          onClose={() => {
            setEducationFormOpen(false)
            setSelectedEducation(null)
          }}
          employeeId={employeeId}
          education={selectedEducation || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'educations', employeeId] })
          }}
        />
        <WorkExperienceForm
          open={workExperienceFormOpen}
          onClose={() => {
            setWorkExperienceFormOpen(false)
            setSelectedWorkExperience(null)
          }}
          employeeId={employeeId}
          workExperience={selectedWorkExperience || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'work-experiences', employeeId] })
          }}
        />
        <EmployeeTrainingForm
          open={employeeTrainingFormOpen}
          onClose={() => {
            setEmployeeTrainingFormOpen(false)
            setSelectedEmployeeTraining(null)
          }}
          employeeId={employeeId}
          employeeTraining={selectedEmployeeTraining || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'employee-trainings', employeeId] })
          }}
        />

        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => {
            setDocumentViewerOpen(false)
            setDocumentToView(null)
          }}
          document={documentToView}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('confirmDelete') || 'Confirm Delete'}
          description={
            itemToDelete
              ? t('deleteItemConfirm') ||
                `Are you sure you want to delete this item? This action cannot be undone.`
              : t('deleteItemConfirmGeneric') ||
                'Are you sure you want to delete this item? This action cannot be undone.'
          }
          confirmText={tCommon('delete')}
          cancelText={tCommon('cancel')}
          variant="destructive"
          isLoading={
            deleteBankAccountMutation.isPending ||
            deleteDependentMutation.isPending ||
            deleteEducationMutation.isPending ||
            deleteWorkExperienceMutation.isPending ||
            deleteEmployeeTrainingMutation.isPending ||
            deleteDocumentMutation.isPending
          }
        />
      </div>
    </DashboardLayout>
  )
}

