'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Employee } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'

// Schema expandido com todos os campos
const employeeSchema = z.object({
  user_id: z.number().optional(),
  // Dados pessoais
  date_of_birth: z.string().optional(),
  cpf: z.string().optional(),
  ssn: z.string().optional(),
  rg: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed', 'common_law']).optional(),
  nationality: z.string().optional(),
  ethnicity: z.string().optional(),
  has_disability: z.boolean().optional(),
  disability_description: z.string().optional(),
  // Endereço
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  // Contatos de emergência
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  // Dados profissionais
  job_position_id: z.number().optional().nullable(),
  job_title: z.string().optional(),
  department_id: z.number().optional().nullable(),
  supervisor_id: z.number().optional().nullable(),
  // Contrato
  contract_type: z.enum([
    'w2_employee',
    '1099_contractor',
    'llc',
    's_corp',
    'c_corp',
    'partnership',
    'clt',
    'pj',
    'intern',
    'temporary',
  ]),
  hire_type: z.enum(['individual', 'company']),
  company_id: z.number().optional().nullable(),
  hire_date: z.string().min(1, 'Hire date is required'),
  termination_date: z.string().optional().nullable(),
  probation_period_days: z.number().optional().nullable(),
  probation_end_date: z.string().optional().nullable(),
  // Jornada de trabalho
  work_shift: z.enum(['morning', 'afternoon', 'night', 'full_time', 'flexible']).optional(),
  weekly_hours: z.string().optional(),
  work_schedule_start: z.string().optional(),
  work_schedule_end: z.string().optional(),
  days_off: z.string().optional(),
  // Salário
  base_salary: z.string().min(1, 'Base salary is required'),
  commission_percent: z.string().optional(),
  // Status
  status: z.enum(['active', 'on_leave', 'terminated', 'resigned']),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  open: boolean
  onClose: () => void
  employee?: Employee
  onSuccess?: () => void
}

export function EmployeeForm({ open, onClose, employee, onSuccess }: EmployeeFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const isEditing = !!employee
  const [activeTab, setActiveTab] = useState('professional')

  // Buscar dados para selects
  const { data: departments } = useQuery({
    queryKey: ['hr', 'departments'],
    queryFn: () => hrApi.getDepartments({ active_only: true }),
  })

  const { data: jobPositions } = useQuery({
    queryKey: ['hr', 'job-positions'],
    queryFn: () => hrApi.getJobPositions({ active_only: true }),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          user_id: employee.user_id,
          date_of_birth: employee.date_of_birth || '',
          cpf: employee.cpf || '',
          ssn: employee.ssn || '',
          rg: employee.rg || '',
          gender: employee.gender || undefined,
          marital_status: (employee.marital_status as any) || undefined,
          nationality: employee.nationality || '',
          ethnicity: employee.ethnicity || '',
          has_disability: employee.has_disability || false,
          disability_description: employee.disability_description || '',
          address: employee.address || '',
          city: employee.city || '',
          state: employee.state || '',
          zip_code: employee.zip_code || '',
          country: employee.country || '',
          emergency_contact_name: employee.emergency_contact_name || '',
          emergency_contact_phone: employee.emergency_contact_phone || '',
          emergency_contact_relation: employee.emergency_contact_relation || '',
          job_position_id: employee.job_position_id || null,
          job_title: employee.job_title || '',
          department_id: employee.department_id || null,
          supervisor_id: employee.supervisor_id || null,
          contract_type: employee.contract_type,
          hire_type: employee.hire_type,
          company_id: employee.company_id || null,
          hire_date: employee.hire_date,
          termination_date: employee.termination_date || null,
          probation_period_days: employee.probation_period_days || null,
          probation_end_date: employee.probation_end_date || null,
          work_shift: employee.work_shift || undefined,
          weekly_hours: employee.weekly_hours || '',
          work_schedule_start: employee.work_schedule_start || '',
          work_schedule_end: employee.work_schedule_end || '',
          days_off: employee.days_off || '',
          base_salary: employee.base_salary,
          commission_percent: employee.commission_percent || '',
          status: employee.status,
        }
      : {
          contract_type: 'w2_employee',
          hire_type: 'individual',
          status: 'active',
          base_salary: '0.00',
          has_disability: false,
        },
  })

  const hireType = watch('hire_type')
  
  const { data: companies } = useQuery({
    queryKey: ['hr', 'companies'],
    queryFn: () => hrApi.getCompanies({ active_only: true }),
    enabled: hireType === 'company',
  })

  const { data: employees } = useQuery({
    queryKey: ['hr', 'employees', 'supervisors'],
    queryFn: () => hrApi.getEmployees({ status: 'active' }),
  })

  React.useEffect(() => {
    if (open) {
      reset(
        employee
          ? {
              user_id: employee.user_id,
              date_of_birth: employee.date_of_birth || '',
              cpf: employee.cpf || '',
              ssn: employee.ssn || '',
              rg: employee.rg || '',
              gender: employee.gender || undefined,
              marital_status: (employee.marital_status as any) || undefined,
              nationality: employee.nationality || '',
              ethnicity: employee.ethnicity || '',
              has_disability: employee.has_disability || false,
              disability_description: employee.disability_description || '',
              address: employee.address || '',
              city: employee.city || '',
              state: employee.state || '',
              zip_code: employee.zip_code || '',
              country: employee.country || '',
              emergency_contact_name: employee.emergency_contact_name || '',
              emergency_contact_phone: employee.emergency_contact_phone || '',
              emergency_contact_relation: employee.emergency_contact_relation || '',
              job_position_id: employee.job_position_id || null,
              job_title: employee.job_title || '',
              department_id: employee.department_id || null,
              supervisor_id: employee.supervisor_id || null,
              contract_type: employee.contract_type,
              hire_type: employee.hire_type,
              company_id: employee.company_id || null,
              hire_date: employee.hire_date,
              termination_date: employee.termination_date || null,
              probation_period_days: employee.probation_period_days || null,
              probation_end_date: employee.probation_end_date || null,
              work_shift: employee.work_shift || undefined,
              weekly_hours: employee.weekly_hours || '',
              work_schedule_start: employee.work_schedule_start || '',
              work_schedule_end: employee.work_schedule_end || '',
              days_off: employee.days_off || '',
              base_salary: employee.base_salary,
              commission_percent: employee.commission_percent || '',
              status: employee.status,
            }
          : {
              contract_type: 'w2_employee',
              hire_type: 'individual',
              status: 'active',
              base_salary: '0.00',
              has_disability: false,
            }
      )
      setActiveTab('professional')
    }
  }, [open, employee, reset])

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const submitData = {
        ...data,
        department_id: data.department_id ?? undefined,
        supervisor_id: data.supervisor_id ?? undefined,
        company_id: data.company_id ?? undefined,
        job_position_id: data.job_position_id ?? undefined,
        termination_date: data.termination_date ?? undefined,
        commission_percent: data.commission_percent || undefined,
        probation_period_days: data.probation_period_days ?? undefined,
        probation_end_date: data.probation_end_date ?? undefined,
      }

      if (isEditing && employee) {
        await hrApi.updateEmployee(employee.id, submitData)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess') || 'Employee updated successfully',
        })
      } else {
        await hrApi.createEmployee(submitData)
        toast({
          title: tCommon('success'),
          description: t('createSuccess') || 'Employee created successfully',
        })
      }
      reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || tCommon('error'),
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" size="large">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') : t('new')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateEmployee') : t('createEmployee')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="personal">{t('personalInfo') || 'Personal'}</TabsTrigger>
              <TabsTrigger value="address">{t('address') || 'Address'}</TabsTrigger>
              <TabsTrigger value="contacts">{t('contacts') || 'Contacts'}</TabsTrigger>
              <TabsTrigger value="professional">{t('professionalInfo')}</TabsTrigger>
              <TabsTrigger value="contract">{t('contract') || 'Contract'}</TabsTrigger>
              <TabsTrigger value="schedule">{t('workSchedule') || 'Schedule'}</TabsTrigger>
              <TabsTrigger value="compensation">{t('compensation') || 'Compensation'}</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Aba: Dados Pessoais */}
              <TabsContent value="personal" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('personalInfo') || 'Personal Information'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">{t('dateOfBirth') || 'Date of Birth'}</Label>
                    <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t('nationality') || 'Nationality'}</Label>
                    <Input id="nationality" {...register('nationality')} placeholder="Brasileiro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">{t('cpf') || 'CPF'}</Label>
                    <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssn">{t('ssn') || 'SSN'}</Label>
                    <Input id="ssn" {...register('ssn')} placeholder="000-00-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">{t('rg') || 'RG/ID'}</Label>
                    <Input id="rg" {...register('rg')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('gender') || 'Gender'}</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || 'none'} onValueChange={value => field.onChange(value === 'none' ? undefined : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectGender') || 'Select gender'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('none')}</SelectItem>
                            <SelectItem value="male">{t('genders.male') || 'Male'}</SelectItem>
                            <SelectItem value="female">{t('genders.female') || 'Female'}</SelectItem>
                            <SelectItem value="other">{t('genders.other') || 'Other'}</SelectItem>
                            <SelectItem value="prefer_not_to_say">{t('genders.prefer_not_to_say') || 'Prefer not to say'}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">{t('maritalStatus') || 'Marital Status'}</Label>
                    <Controller
                      name="marital_status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || 'none'} onValueChange={value => field.onChange(value === 'none' ? undefined : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectMaritalStatus') || 'Select marital status'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('none')}</SelectItem>
                            <SelectItem value="single">{t('maritalStatuses.single') || 'Single'}</SelectItem>
                            <SelectItem value="married">{t('maritalStatuses.married') || 'Married'}</SelectItem>
                            <SelectItem value="divorced">{t('maritalStatuses.divorced') || 'Divorced'}</SelectItem>
                            <SelectItem value="widowed">{t('maritalStatuses.widowed') || 'Widowed'}</SelectItem>
                            <SelectItem value="common_law">{t('maritalStatuses.common_law') || 'Common Law'}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">{t('ethnicity') || 'Ethnicity (Optional)'}</Label>
                    <Input id="ethnicity" {...register('ethnicity')} placeholder={t('optional') || 'Optional'} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="has_disability"
                        control={control}
                        render={({ field }) => (
                          <Switch checked={field.value || false} onCheckedChange={field.onChange} id="has_disability" />
                        )}
                      />
                      <Label htmlFor="has_disability" className="cursor-pointer">
                        {t('hasDisability') || 'Has Disability (Optional)'}
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="disability_description">{t('disabilityDescription') || 'Disability Description'}</Label>
                    <Textarea
                      id="disability_description"
                      {...register('disability_description')}
                      rows={2}
                      disabled={!watch('has_disability')}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Endereço */}
              <TabsContent value="address" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('address') || 'Address'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">{t('address') || 'Address'}</Label>
                    <Input id="address" {...register('address')} placeholder={t('streetAddress') || 'Street address'} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('city') || 'City'}</Label>
                    <Input id="city" {...register('city')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{t('state') || 'State'}</Label>
                    <Input id="state" {...register('state')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">{t('zipCode') || 'ZIP Code'}</Label>
                    <Input id="zip_code" {...register('zip_code')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('country') || 'Country'}</Label>
                    <Input id="country" {...register('country')} placeholder="Brasil" />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Contatos */}
              <TabsContent value="contacts" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('emergencyContact') || 'Emergency Contact'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">{t('contactName') || 'Contact Name'}</Label>
                    <Input id="emergency_contact_name" {...register('emergency_contact_name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">{t('contactPhone') || 'Contact Phone'}</Label>
                    <Input id="emergency_contact_phone" {...register('emergency_contact_phone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_relation">{t('contactRelation') || 'Relation'}</Label>
                    <Input id="emergency_contact_relation" {...register('emergency_contact_relation')} placeholder={t('spouseParent') || 'Spouse, Parent, etc.'} />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Dados Profissionais */}
              <TabsContent value="professional" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('professionalInfo')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_position_id">{t('jobPosition') || 'Job Position'}</Label>
                    <Controller
                      name="job_position_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString() || 'none'}
                          onValueChange={value => field.onChange(value === 'none' ? null : parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectJobPosition') || 'Select job position'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('none')}</SelectItem>
                            {jobPositions?.results.map(pos => (
                              <SelectItem key={pos.id} value={pos.id.toString()}>
                                {pos.code} - {pos.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">{t('jobTitle')} {t('or') || '(or)'}</Label>
                    <Input id="job_title" {...register('job_title')} placeholder={t('jobTitle')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department_id">{t('department')}</Label>
                    <Controller
                      name="department_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString() || 'none'}
                          onValueChange={value => field.onChange(value === 'none' ? null : parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectDepartment')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('none')}</SelectItem>
                            {departments?.results.map(dept => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisor_id">{t('supervisor')}</Label>
                    <Controller
                      name="supervisor_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString() || 'none'}
                          onValueChange={value => field.onChange(value === 'none' ? null : parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectSupervisor')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('none')}</SelectItem>
                            {employees?.results
                              .filter(emp => !employee || emp.id !== employee.id)
                              .map(emp => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                  {emp.user
                                    ? `${emp.user.first_name || ''} ${emp.user.last_name || ''}`.trim() ||
                                      emp.user.email
                                    : emp.employee_number}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">{t('status')}</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">{t('statuses.active')}</SelectItem>
                            <SelectItem value="on_leave">{t('statuses.on_leave')}</SelectItem>
                            <SelectItem value="terminated">{t('statuses.terminated')}</SelectItem>
                            <SelectItem value="resigned">{t('statuses.resigned')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Contrato */}
              <TabsContent value="contract" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('contract') || 'Contract Information'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_type">{t('contractType')}</Label>
                    <Controller
                      name="contract_type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="w2_employee">{t('contractTypes.w2_employee')}</SelectItem>
                            <SelectItem value="1099_contractor">{t('contractTypes.1099_contractor')}</SelectItem>
                            <SelectItem value="clt">{t('contractTypes.clt')}</SelectItem>
                            <SelectItem value="pj">{t('contractTypes.pj')}</SelectItem>
                            <SelectItem value="llc">{t('contractTypes.llc')}</SelectItem>
                            <SelectItem value="s_corp">{t('contractTypes.s_corp')}</SelectItem>
                            <SelectItem value="c_corp">{t('contractTypes.c_corp')}</SelectItem>
                            <SelectItem value="partnership">{t('contractTypes.partnership')}</SelectItem>
                            <SelectItem value="intern">{t('contractTypes.intern')}</SelectItem>
                            <SelectItem value="temporary">{t('contractTypes.temporary')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_type">{t('hireType')}</Label>
                    <Controller
                      name="hire_type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">{t('individual')}</SelectItem>
                            <SelectItem value="company">{t('hireTypeCompany')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {hireType === 'company' && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="company_id">{t('company')}</Label>
                      <Controller
                        name="company_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || 'none'}
                            onValueChange={value => field.onChange(value === 'none' ? null : parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectCompany')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t('none')}</SelectItem>
                              {companies?.results.map(company => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.legal_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">{t('hireDate')}</Label>
                    <Input id="hire_date" type="date" {...register('hire_date')} />
                    {errors.hire_date && (
                      <p className="text-sm text-red-500 mt-1">{errors.hire_date.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termination_date">{t('terminationDate') || 'Termination Date'}</Label>
                    <Input id="termination_date" type="date" {...register('termination_date')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probation_period_days">{t('probationPeriodDays') || 'Probation Period (days)'}</Label>
                    <Input
                      id="probation_period_days"
                      type="number"
                      {...register('probation_period_days', { valueAsNumber: true })}
                      placeholder="90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probation_end_date">{t('probationEndDate') || 'Probation End Date'}</Label>
                    <Input id="probation_end_date" type="date" {...register('probation_end_date')} />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Jornada de Trabalho */}
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('workSchedule') || 'Work Schedule'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work_shift">{t('workShift') || 'Work Shift'}</Label>
                    <Controller
                      name="work_shift"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || 'none'} onValueChange={value => field.onChange(value === 'none' ? undefined : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectWorkShift') || 'Select work shift'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('none')}</SelectItem>
                            <SelectItem value="morning">{t('workShifts.morning') || 'Morning'}</SelectItem>
                            <SelectItem value="afternoon">{t('workShifts.afternoon') || 'Afternoon'}</SelectItem>
                            <SelectItem value="night">{t('workShifts.night') || 'Night'}</SelectItem>
                            <SelectItem value="full_time">{t('workShifts.full_time') || 'Full Time'}</SelectItem>
                            <SelectItem value="flexible">{t('workShifts.flexible') || 'Flexible'}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekly_hours">{t('weeklyHours') || 'Weekly Hours'}</Label>
                    <Input
                      id="weekly_hours"
                      type="number"
                      step="0.01"
                      {...register('weekly_hours')}
                      placeholder="40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_schedule_start">{t('workScheduleStart') || 'Work Schedule Start'}</Label>
                    <Input id="work_schedule_start" type="time" {...register('work_schedule_start')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_schedule_end">{t('workScheduleEnd') || 'Work Schedule End'}</Label>
                    <Input id="work_schedule_end" type="time" {...register('work_schedule_end')} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="days_off">{t('daysOff') || 'Days Off'}</Label>
                    <Input id="days_off" {...register('days_off')} placeholder={t('daysOffPlaceholder') || 'e.g., Saturday, Sunday'} />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Compensação */}
              <TabsContent value="compensation" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('compensation') || 'Compensation'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_salary">{t('baseSalary')}</Label>
                    <Input
                      id="base_salary"
                      type="number"
                      step="0.01"
                      {...register('base_salary')}
                      placeholder="0.00"
                    />
                    {errors.base_salary && (
                      <p className="text-sm text-red-500 mt-1">{errors.base_salary.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission_percent">{t('commissionPercent')}</Label>
                    <Input
                      id="commission_percent"
                      type="number"
                      step="0.01"
                      {...register('commission_percent')}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-4 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

