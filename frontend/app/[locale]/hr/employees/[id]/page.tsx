'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmployeeForm } from '@/components/hr/EmployeeForm'
import { EmployeeDocumentForm } from '@/components/hr/EmployeeDocumentForm'
import { ContractForm } from '@/components/hr/ContractForm'
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
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { Employee, EmployeeDocument, Contract, EmployeeHistory } from '@/types/api'
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
  const [contractFormOpen, setContractFormOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

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
                                      description: error.response?.data?.detail || tCommon('error'),
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
                <CardTitle>{t('documents') || 'Documents'}</CardTitle>
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
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="mr-2 h-4 w-4" />
                              {t('view') || 'View'}
                            </a>
                          </Button>
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
                <CardTitle>{t('bankAccounts') || 'Bank Accounts'}</CardTitle>
              </CardHeader>
              <CardContent>
                {bankAccounts && bankAccounts.results && bankAccounts.results.length > 0 ? (
                  <div className="space-y-2">
                    {bankAccounts.results.map(account => (
                      <div key={account.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{account.bank_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('agency') || 'Agency'}: {account.agency} - {t('account') || 'Account'}: {account.account_number}
                            </p>
                            {account.pix_key && (
                              <p className="text-sm text-muted-foreground">
                                PIX: {account.pix_key}
                              </p>
                            )}
                          </div>
                          {account.is_primary && (
                            <Badge>{t('primary') || 'Primary'}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noBankAccounts') || 'No bank accounts found'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dependents Tab */}
          <TabsContent value="dependents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dependents') || 'Dependents'}</CardTitle>
              </CardHeader>
              <CardContent>
                {dependents && dependents.results && dependents.results.length > 0 ? (
                  <div className="space-y-2">
                    {dependents.results.map(dependent => (
                      <div key={dependent.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{dependent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(`relationships.${dependent.relationship}`) || dependent.relationship}
                          {dependent.date_of_birth && ` - ${format(new Date(dependent.date_of_birth), 'PPP')}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noDependents') || 'No dependents found'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('education') || 'Education'}</CardTitle>
              </CardHeader>
              <CardContent>
                {educations && educations.results && educations.results.length > 0 ? (
                  <div className="space-y-4">
                    {educations.results.map(education => (
                      <div key={education.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{education.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(`educationLevels.${education.level}`) || education.level}
                          {education.course && ` - ${education.course}`}
                        </p>
                        {education.graduation_year && (
                          <p className="text-sm text-muted-foreground">
                            {t('graduationYear') || 'Graduation Year'}: {education.graduation_year}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noEducation') || 'No education records found'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('workExperience') || 'Work Experience'}</CardTitle>
              </CardHeader>
              <CardContent>
                {workExperiences && workExperiences.results && workExperiences.results.length > 0 ? (
                  <div className="space-y-4">
                    {workExperiences.results.map(exp => (
                      <div key={exp.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{exp.company_name}</p>
                        <p className="text-sm text-muted-foreground">{exp.job_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(exp.start_date), 'PPP')} -{' '}
                          {exp.is_current
                            ? t('current') || 'Current'
                            : exp.end_date
                              ? format(new Date(exp.end_date), 'PPP')
                              : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noWorkExperience') || 'No work experience records found'}
                  </p>
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
      </div>
    </DashboardLayout>
  )
}

