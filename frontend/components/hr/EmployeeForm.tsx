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
  DialogBody,
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
import { Loader2, Upload, X, User } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  const queryClient = useQueryClient()
  const isEditing = !!employee
  const [activeTab, setActiveTab] = useState('professional')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

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
          marital_status: employee.marital_status || undefined,
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
              marital_status: employee.marital_status || undefined,
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
      // Reset photo state
      setPhotoFile(null)
      setPhotoPreview(employee?.photo_url || null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: tCommon('error'),
          description: t('invalidImageType') || 'Please upload an image file',
          variant: 'destructive',
        })
        return
      }
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: tCommon('error'),
          description: t('imageTooLarge') || 'File size must be less than 5MB',
          variant: 'destructive',
        })
        return
      }
      setPhotoFile(file)
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      // Função auxiliar para criar/atualizar
      const saveEmployee = async (payload: FormData | any) => {
        if (isEditing && employee) {
          await hrApi.updateEmployee(employee.id, payload)
          toast({
            title: tCommon('success'),
            description: t('updateSuccess') || 'Employee updated successfully',
          })
        } else {
          await hrApi.createEmployee(payload)
          toast({
            title: tCommon('success'),
            description: t('createSuccess') || 'Employee created successfully',
          })
        }
      }

      // Função para limpar valores vazios e converter tipos
      const cleanValue = (value: any): any => {
        if (value === '' || value === null || value === undefined) {
          return undefined
        }
        return value
      }

      // Se houver foto, usar FormData
      if (photoFile) {
        const formData = new FormData()
        
        // Adicionar todos os campos do formulário
        if (data.user_id) formData.append('user_id', data.user_id.toString())
        if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth)
        if (data.cpf) formData.append('cpf', data.cpf)
        if (data.ssn) formData.append('ssn', data.ssn)
        if (data.rg) formData.append('rg', data.rg)
        if (data.gender) formData.append('gender', data.gender)
        if (data.marital_status) formData.append('marital_status', data.marital_status)
        if (data.nationality) formData.append('nationality', data.nationality)
        if (data.ethnicity) formData.append('ethnicity', data.ethnicity)
        formData.append('has_disability', (data.has_disability || false).toString())
        if (data.disability_description) formData.append('disability_description', data.disability_description)
        if (data.address) formData.append('address', data.address)
        if (data.city) formData.append('city', data.city)
        if (data.state) formData.append('state', data.state)
        if (data.zip_code) formData.append('zip_code', data.zip_code)
        if (data.country) formData.append('country', data.country)
        if (data.emergency_contact_name) formData.append('emergency_contact_name', data.emergency_contact_name)
        if (data.emergency_contact_phone) formData.append('emergency_contact_phone', data.emergency_contact_phone)
        if (data.emergency_contact_relation) formData.append('emergency_contact_relation', data.emergency_contact_relation)
        if (data.job_position_id) formData.append('job_position_id', data.job_position_id.toString())
        if (data.job_title) formData.append('job_title', data.job_title)
        if (data.department_id) formData.append('department_id', data.department_id.toString())
        if (data.supervisor_id) formData.append('supervisor_id', data.supervisor_id.toString())
        formData.append('contract_type', data.contract_type)
        formData.append('hire_type', data.hire_type)
        if (data.company_id) formData.append('company_id', data.company_id.toString())
        formData.append('hire_date', data.hire_date)
        if (data.termination_date) formData.append('termination_date', data.termination_date)
        if (data.probation_period_days) formData.append('probation_period_days', data.probation_period_days.toString())
        if (data.probation_end_date) formData.append('probation_end_date', data.probation_end_date)
        if (data.work_shift) formData.append('work_shift', data.work_shift)
        if (data.weekly_hours) formData.append('weekly_hours', data.weekly_hours)
        if (data.work_schedule_start) formData.append('work_schedule_start', data.work_schedule_start)
        if (data.work_schedule_end) formData.append('work_schedule_end', data.work_schedule_end)
        if (data.days_off) formData.append('days_off', data.days_off)
        formData.append('base_salary', data.base_salary)
        if (data.commission_percent) formData.append('commission_percent', data.commission_percent)
        formData.append('status', data.status)

        // Adicionar foto
        formData.append('photo', photoFile)

        await saveEmployee(formData)
      } else {
        // Sem foto, usar JSON normal - limpar campos vazios e converter tipos
        const submitData: any = {
          contract_type: data.contract_type,
          hire_type: data.hire_type,
          hire_date: data.hire_date,
          base_salary: data.base_salary,
          status: data.status,
        }

        // Campos opcionais - só adicionar se tiver valor
        if (data.user_id) submitData.user_id = data.user_id
        if (cleanValue(data.date_of_birth)) submitData.date_of_birth = data.date_of_birth
        if (cleanValue(data.cpf)) submitData.cpf = data.cpf
        if (cleanValue(data.ssn)) submitData.ssn = data.ssn
        if (cleanValue(data.rg)) submitData.rg = data.rg
        if (cleanValue(data.gender)) submitData.gender = data.gender
        if (cleanValue(data.marital_status)) submitData.marital_status = data.marital_status
        if (cleanValue(data.nationality)) submitData.nationality = data.nationality
        if (cleanValue(data.ethnicity)) submitData.ethnicity = data.ethnicity
        submitData.has_disability = data.has_disability || false
        if (cleanValue(data.disability_description)) submitData.disability_description = data.disability_description
        if (cleanValue(data.address)) submitData.address = data.address
        if (cleanValue(data.city)) submitData.city = data.city
        if (cleanValue(data.state)) submitData.state = data.state
        if (cleanValue(data.zip_code)) submitData.zip_code = data.zip_code
        if (cleanValue(data.country)) submitData.country = data.country
        if (cleanValue(data.emergency_contact_name)) submitData.emergency_contact_name = data.emergency_contact_name
        if (cleanValue(data.emergency_contact_phone)) submitData.emergency_contact_phone = data.emergency_contact_phone
        if (cleanValue(data.emergency_contact_relation)) submitData.emergency_contact_relation = data.emergency_contact_relation
        if (data.job_position_id) submitData.job_position_id = data.job_position_id
        if (cleanValue(data.job_title)) submitData.job_title = data.job_title
        if (data.department_id !== null && data.department_id !== undefined) submitData.department_id = data.department_id
        if (data.supervisor_id !== null && data.supervisor_id !== undefined) submitData.supervisor_id = data.supervisor_id
        if (data.company_id !== null && data.company_id !== undefined) submitData.company_id = data.company_id
        if (cleanValue(data.termination_date)) submitData.termination_date = data.termination_date
        if (data.probation_period_days !== null && data.probation_period_days !== undefined) {
          submitData.probation_period_days = Number(data.probation_period_days)
        }
        if (cleanValue(data.probation_end_date)) submitData.probation_end_date = data.probation_end_date
        if (cleanValue(data.work_shift)) submitData.work_shift = data.work_shift
        if (cleanValue(data.weekly_hours)) submitData.weekly_hours = data.weekly_hours
        if (cleanValue(data.work_schedule_start)) submitData.work_schedule_start = data.work_schedule_start
        if (cleanValue(data.work_schedule_end)) submitData.work_schedule_end = data.work_schedule_end
        if (cleanValue(data.days_off)) submitData.days_off = data.days_off
        if (cleanValue(data.commission_percent)) {
          submitData.commission_percent = data.commission_percent
        }

        await saveEmployee(submitData)
      }

      queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] })
      reset()
      setPhotoFile(null)
      setPhotoPreview(null)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      // Tratar erros de validação do Django REST Framework
      let errorMessage = tCommon('errorOccurred')
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Se for um objeto de validação (DRF)
        if (typeof errorData === 'object' && !errorData.detail) {
          // Coletar todas as mensagens de erro
          const errorMessages: string[] = []
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`)
            } else if (typeof messages === 'object') {
              errorMessages.push(`${field}: ${JSON.stringify(messages)}`)
            }
          }
          errorMessage = errorMessages.length > 0 
            ? errorMessages.join('; ') 
            : JSON.stringify(errorData)
        } else {
          errorMessage = errorData.detail || errorData.message || errorMessage
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: tCommon('error'),
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="large">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') : t('new')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateEmployee') : t('createEmployee')}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="p-0 flex-1 flex flex-col overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 px-8 w-full">
                <TabsList className="grid grid-cols-7 w-full" style={{ width: '100%' }}>
                  <TabsTrigger value="personal">{t('personalInfo') || 'Personal'}</TabsTrigger>
                  <TabsTrigger value="address">{t('address') || 'Address'}</TabsTrigger>
                  <TabsTrigger value="contacts">{t('contacts') || 'Contacts'}</TabsTrigger>
                  <TabsTrigger value="professional">{t('professionalInfo')}</TabsTrigger>
                  <TabsTrigger value="contract">{t('contract') || 'Contract'}</TabsTrigger>
                  <TabsTrigger value="schedule">{t('workSchedule') || 'Schedule'}</TabsTrigger>
                  <TabsTrigger value="compensation">{t('compensation') || 'Compensation'}</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-4">
              {/* Aba: Dados Pessoais */}
              <TabsContent value="personal" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">{t('personalInfo') || 'Personal Information'}</h3>
                
                {/* Upload de Foto */}
                <div className="space-y-2 col-span-2 mb-6">
                  <Label>{t('photo') || 'Photo'}</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-slate-200 dark:border-slate-700">
                        <AvatarImage src={photoPreview || employee?.photo_url} alt={t('employeePhoto') || 'Employee photo'} />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                          <User className="h-12 w-12 text-slate-400" />
                        </AvatarFallback>
                      </Avatar>
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={removePhoto}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <Label htmlFor="photo" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              {photoPreview || employee?.photo_url ? t('changePhoto') || 'Change Photo' : t('uploadPhoto') || 'Upload Photo'}
                            </span>
                          </Button>
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('photoHint') || 'JPG, PNG or GIF. Max size 5MB'}
                      </p>
                    </div>
                  </div>
                </div>

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tCommon('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

