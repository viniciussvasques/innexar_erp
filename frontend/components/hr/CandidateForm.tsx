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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Candidate, JobOpening } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, UserCheck, Upload } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import React, { useState } from 'react'

const candidateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  job_opening_id: z.number().min(1, 'Job opening is required'),
  cover_letter: z.string().optional(),
  status: z.enum(['applied', 'screening', 'interview', 'test', 'approved', 'rejected', 'hired']),
  interview_notes: z.string().optional(),
  test_score: z.string().optional(),
  overall_rating: z.number().optional(),
  interview_date: z.string().optional(),
})

type CandidateFormData = z.infer<typeof candidateSchema>

interface CandidateFormProps {
  open: boolean
  onClose: () => void
  candidate?: Candidate
  onSuccess?: () => void
}

export function CandidateForm({
  open,
  onClose,
  candidate,
  onSuccess,
}: CandidateFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEditing = !!candidate
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  // Fetch job openings
  const { data: jobOpeningsData } = useQuery({
    queryKey: ['hr', 'job-openings', 'all'],
    queryFn: () => hrApi.getJobOpenings({ page_size: 1000, status: 'open' }),
  })

  const jobOpenings = jobOpeningsData?.results || []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: candidate
      ? {
          first_name: candidate.first_name || '',
          last_name: candidate.last_name || '',
          email: candidate.email || '',
          phone: candidate.phone || '',
          job_opening_id: candidate.job_opening_id || candidate.job_opening?.id,
          cover_letter: candidate.cover_letter || '',
          status: candidate.status || 'applied',
          interview_notes: candidate.interview_notes || '',
          test_score: candidate.test_score || '',
          overall_rating: candidate.overall_rating || undefined,
          interview_date: candidate.interview_date
            ? format(new Date(candidate.interview_date), 'yyyy-MM-dd')
            : '',
        }
      : {
          status: 'applied',
        },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CandidateFormData) => {
      const formData = new FormData()
      formData.append('first_name', data.first_name)
      formData.append('last_name', data.last_name)
      formData.append('email', data.email)
      if (data.phone) formData.append('phone', data.phone)
      formData.append('job_opening_id', data.job_opening_id.toString())
      if (data.cover_letter) formData.append('cover_letter', data.cover_letter)
      formData.append('status', data.status)
      if (data.interview_notes) formData.append('interview_notes', data.interview_notes)
      if (data.test_score) formData.append('test_score', data.test_score)
      if (data.overall_rating) formData.append('overall_rating', data.overall_rating.toString())
      if (data.interview_date) formData.append('interview_date', data.interview_date)
      if (resumeFile) formData.append('resume_file', resumeFile)

      return hrApi.createCandidate(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'candidates'] })
      toast({
        title: tCommon('success'),
        description: t('createCandidateSuccess') || 'Candidate created successfully',
      })
      reset()
      setResumeFile(null)
      onSuccess?.()
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: CandidateFormData) => {
      // For updates, we can use regular JSON if no file is being uploaded
      if (resumeFile) {
        const formData = new FormData()
        formData.append('first_name', data.first_name)
        formData.append('last_name', data.last_name)
        formData.append('email', data.email)
        if (data.phone) formData.append('phone', data.phone)
        formData.append('job_opening_id', data.job_opening_id.toString())
        if (data.cover_letter) formData.append('cover_letter', data.cover_letter)
        formData.append('status', data.status)
        if (data.interview_notes) formData.append('interview_notes', data.interview_notes)
        if (data.test_score) formData.append('test_score', data.test_score)
        if (data.overall_rating) formData.append('overall_rating', data.overall_rating.toString())
        if (data.interview_date) formData.append('interview_date', data.interview_date)
        formData.append('resume_file', resumeFile)

        return hrApi.updateCandidate(candidate!.id, formData)
      } else {
        return hrApi.updateCandidate(candidate!.id, data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'candidates'] })
      toast({
        title: tCommon('success'),
        description: t('updateCandidateSuccess') || 'Candidate updated successfully',
      })
      onSuccess?.()
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const onSubmit = async (data: CandidateFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        toast({
          title: tCommon('error'),
          description: t('invalidFileType') || 'Please upload a PDF or image file',
          variant: 'destructive',
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: tCommon('error'),
          description: t('fileTooLarge') || 'File size must be less than 5MB',
          variant: 'destructive',
        })
        return
      }
      setResumeFile(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="large">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editCandidate') || 'Edit Candidate' : t('newCandidate') || 'New Candidate'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updateCandidate') || 'Update candidate details'
              : t('createCandidate') || 'Create a new candidate'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    {t('firstName') || 'First Name'} <span className="text-red-500">*</span>
                  </Label>
                  <Input id="first_name" {...register('first_name')} />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    {t('lastName') || 'Last Name'} <span className="text-red-500">*</span>
                  </Label>
                  <Input id="last_name" {...register('last_name')} />
                  {errors.last_name && (
                    <p className="text-sm text-red-500">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('email')} <span className="text-red-500">*</span>
                  </Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                </div>
              </div>

              {/* Job Opening */}
              <div className="space-y-2">
                <Label htmlFor="job_opening_id">
                  {t('jobOpening') || 'Job Opening'} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="job_opening_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={value => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectJobOpening') || 'Select job opening'} />
                      </SelectTrigger>
                      <SelectContent>
                        {jobOpenings.map((job: JobOpening) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.job_opening_id && (
                  <p className="text-sm text-red-500">{errors.job_opening_id.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  {t('status')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus') || 'Select status'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">{t('applied') || 'Applied'}</SelectItem>
                        <SelectItem value="screening">{t('screening') || 'Screening'}</SelectItem>
                        <SelectItem value="interview">{t('interview') || 'Interview'}</SelectItem>
                        <SelectItem value="test">{t('test') || 'Test'}</SelectItem>
                        <SelectItem value="approved">{t('approved') || 'Approved'}</SelectItem>
                        <SelectItem value="rejected">{t('rejected') || 'Rejected'}</SelectItem>
                        <SelectItem value="hired">{t('hired') || 'Hired'}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>

              {/* Resume File */}
              <div className="space-y-2">
                <Label htmlFor="resume_file">{t('resume') || 'Resume (PDF)'}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume_file"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {resumeFile && (
                    <span className="text-sm text-muted-foreground">{resumeFile.name}</span>
                  )}
                  {candidate?.resume_file && !resumeFile && (
                    <span className="text-sm text-muted-foreground">
                      {t('currentFile') || 'Current file attached'}
                    </span>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <Label htmlFor="cover_letter">{t('coverLetter') || 'Cover Letter'}</Label>
                <Textarea
                  id="cover_letter"
                  {...register('cover_letter')}
                  placeholder={t('coverLetterPlaceholder') || 'Cover letter...'}
                  rows={4}
                />
              </div>

              {/* Interview Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interview_date">{t('interviewDate') || 'Interview Date'}</Label>
                  <Input id="interview_date" type="date" {...register('interview_date')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_score">{t('testScore') || 'Test Score'}</Label>
                  <Input id="test_score" {...register('test_score')} placeholder="0-100" />
                </div>
              </div>

              {/* Interview Notes */}
              <div className="space-y-2">
                <Label htmlFor="interview_notes">{t('interviewNotes') || 'Interview Notes'}</Label>
                <Textarea
                  id="interview_notes"
                  {...register('interview_notes')}
                  placeholder={t('interviewNotesPlaceholder') || 'Interview notes...'}
                  rows={3}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

