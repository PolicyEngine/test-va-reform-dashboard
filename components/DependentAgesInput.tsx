'use client'

import { NumberInput } from '@policyengine/ui-kit'

interface DependentAgesInputProps {
  ages: number[]
  onChange: (ages: number[]) => void
}

/**
 * Dynamic array of number inputs for dependent ages.
 * Renders one input per dependent based on the count set elsewhere.
 */
export function DependentAgesInput({ ages, onChange }: DependentAgesInputProps) {
  const handleChange = (index: number, value: number) => {
    const next = [...ages]
    next[index] = value
    onChange(next)
  }

  if (ages.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Dependent ages
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        {ages.map((age, i) => (
          <NumberInput
            key={i}
            label={`Dependent ${i + 1}`}
            value={age}
            onChange={(v) => handleChange(i, v)}
            min={0}
            max={18}
            className="w-20"
          />
        ))}
      </div>
    </div>
  )
}
