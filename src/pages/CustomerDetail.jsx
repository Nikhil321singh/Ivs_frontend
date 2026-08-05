import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import Field from '../components/Field'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: "Customer Detail" (§6.7). Payout details for the trade-in. UI-only.
export default function CustomerDetail() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [payout, setPayout] = useState('')
  const [address, setAddress] = useState('')

  const valid = name.trim() && payout.trim() && address.trim()

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.tradeIn} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Seller details</h1>
            <p className="text-[13px] font-normal text-muted">Where should we pay you?</p>
          </div>

          <p className="text-[14px] font-normal text-muted">
            Payout info · we'll transfer within 24 hours.
          </p>

          <div className="flex flex-col gap-3">
            <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Gaurav Sharma" />
            <Field
              label="UPI ID / Bank account"
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
              placeholder="gaurav@okhdfc"
            />
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[12px] font-medium text-muted">Pickup address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 MG Road, Camp, Pune, Maharashtra 411001"
                className="w-full resize-none rounded-[11px] border-[1.5px] border-line bg-white px-3.5 py-3 text-[14px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
          </div>
        </div>

        <PrimaryButton onClick={() => navigate(ROUTES.tradeInVerify)} disabled={!valid}>
          Continue
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
