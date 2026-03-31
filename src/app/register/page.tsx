"use client"

import React, { useState } from 'react'
import Welcome from '@/Components/Welcome'
import RegisterForm from '@/Components/RegisterForm'

const RegisterPage = () => {
  const [step, setStep] = useState(1)

  return (
    <div>
      {step === 1
        ? <Welcome nextStep={setStep} />
        : <RegisterForm prevStep={setStep} />   // ✅ fixed: was nextStep, prop is prevStep
      }
    </div>
  )
}

export default RegisterPage
