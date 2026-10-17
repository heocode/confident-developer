import type { ContactOption } from '../presentation/contact-options.ts'
import styles from './ContactDrawer.module.css'

interface ContactChoiceGroupProps<TValue extends string> {
  errorMessage?: string
  inputType: 'checkbox' | 'radio'
  label: string
  name: string
  options: readonly ContactOption<TValue>[]
  selectedValues: readonly TValue[]
  onSelect: (value: TValue) => void
}

export function ContactChoiceGroup<TValue extends string>({
  errorMessage,
  inputType,
  label,
  name,
  options,
  selectedValues,
  onSelect,
}: ContactChoiceGroupProps<TValue>) {
  const errorId = `${name}-contact-error`

  return (
    <fieldset
      className={styles.choiceGroup}
      aria-describedby={errorMessage ? errorId : undefined}
      aria-invalid={Boolean(errorMessage)}
    >
      <legend>{label}</legend>
      <div className={styles.choices}>
        {options.map(({ label: optionLabel, value }) => (
          <label className={styles.choice} key={value}>
            <input
              checked={selectedValues.includes(value)}
              name={name}
              type={inputType}
              value={value}
              onChange={() => onSelect(value)}
            />
            <span>{optionLabel}</span>
          </label>
        ))}
      </div>
      {errorMessage && (
        <span className={styles.fieldError} id={errorId}>
          {errorMessage}
        </span>
      )}
    </fieldset>
  )
}
