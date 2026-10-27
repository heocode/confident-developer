import type {
  ReferenceSubmissionDetails,
  ReferenceSubmissionErrors,
  ReferenceSubmissionTextField,
} from '../model/reference-submission-form.ts'
import styles from './ReferenceSubmission.module.css'
import { ReferenceRatingInput } from './ReferenceRatingInput.tsx'

interface TextFieldProps {
  autoComplete: string
  errorMessage?: string
  label: string
  maxLength: number
  name: ReferenceSubmissionTextField
  placeholder: string
  type?: 'email' | 'text'
  value: string
  onChange: (name: ReferenceSubmissionTextField, value: string) => void
}

function TextField({
  autoComplete,
  errorMessage,
  label,
  maxLength,
  name,
  placeholder,
  type = 'text',
  value,
  onChange,
}: TextFieldProps) {
  const errorId = `${name}-reference-error`

  return (
    <label className={styles.textField}>
      <span>{label}</span>
      <input
        aria-describedby={errorMessage ? errorId : undefined}
        aria-invalid={Boolean(errorMessage)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {errorMessage && (
        <span className={styles.fieldError} id={errorId}>
          {errorMessage}
        </span>
      )}
    </label>
  )
}

interface ReferenceSubmissionFieldsProps {
  details: ReferenceSubmissionDetails
  errors: ReferenceSubmissionErrors
  onTextFieldChange: (name: ReferenceSubmissionTextField, value: string) => void
  onRatingChange: (name: keyof ReferenceSubmissionDetails['ratings'], value: number) => void
}

export function ReferenceSubmissionFields({
  details,
  errors,
  onTextFieldChange,
  onRatingChange,
}: ReferenceSubmissionFieldsProps) {
  return (
    <>
      <div className={styles.textFields}>
        <TextField
          autoComplete="name"
          errorMessage={errors.name}
          label="NAME"
          maxLength={80}
          name="name"
          placeholder="Your name"
          value={details.name}
          onChange={onTextFieldChange}
        />
        <TextField
          autoComplete="email"
          errorMessage={errors.email}
          label="EMAIL"
          maxLength={254}
          name="email"
          placeholder="Your email (It will never be displayed publicly)"
          type="email"
          value={details.email}
          onChange={onTextFieldChange}
        />
        <TextField
          autoComplete="organization"
          errorMessage={errors.company}
          label="COMPANY"
          maxLength={120}
          name="company"
          placeholder="Company or organization"
          value={details.company}
          onChange={onTextFieldChange}
        />
        <TextField
          autoComplete="organization-title"
          errorMessage={errors.position}
          label="POSITION"
          maxLength={120}
          name="position"
          placeholder="Your role or position"
          value={details.position}
          onChange={onTextFieldChange}
        />
      </div>

      <div className={styles.ratingFields}>
        <ReferenceRatingInput
          errorMessage={errors.overall}
          label="OVERALL EXPERIENCE"
          name="overall"
          value={details.ratings.overall}
          onChange={(value) => onRatingChange('overall', value)}
        />
        <ReferenceRatingInput
          errorMessage={errors.technical}
          label="TECHNICAL SKILLS"
          name="technical"
          value={details.ratings.technical}
          onChange={(value) => onRatingChange('technical', value)}
        />
        <ReferenceRatingInput
          errorMessage={errors.communication}
          label="COMMUNICATION"
          name="communication"
          value={details.ratings.communication}
          onChange={(value) => onRatingChange('communication', value)}
        />
      </div>
    </>
  )
}
