import PhoneFrame from './PhoneFrame'
import BackButton from './BackButton'
import { PrimaryButton } from './Button'

// Placeholder for the payment step. The real Razorpay checkout (frontend) will
// be dropped in here later; for now this just keeps the flow navigable so the
// screens on either side can be walked end-to-end. `onContinue` simulates a
// successful payment and advances the flow.
export default function PaymentPlaceholder({ amount, payee, backTo, onContinue }) {
  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={backTo} />
          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Payment</h1>
            <p className="text-[13px] font-normal text-muted">Pay to {payee}</p>
          </div>

          {/* amount summary (kept so the flow reads correctly pre-Razorpay) */}
          <div className="flex items-center justify-between rounded-[18px] border-[1.5px] border-line bg-white px-[18px] py-4">
            <span className="text-[13px] font-normal text-muted">Amount</span>
            <span className="text-[18px] font-bold text-primary">₹{amount}</span>
          </div>

          <div className="rounded-[14px] border-[1.5px] border-dashed border-line bg-white/60 px-4 py-6 text-center">
            <p className="text-[13px] font-medium text-muted">
              Razorpay payment gateway will be integrated here.
            </p>
          </div>
        </div>

        <PrimaryButton onClick={onContinue}>Pay ₹{amount}</PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
