import { useNavigate } from 'react-router-dom'
import PaymentGateway from '../components/PaymentGateway'
import { ROUTES } from '../constants/routes'

// ₹50 diagnosis payment (buys 50 tokens; the diagnosis debits them on success).
export default function Payment50() {
  const navigate = useNavigate()
  return (
    <PaymentGateway
      amount={50}
      payee="Grest Diagnose"
      description="Device diagnosis (₹50)"
      backTo={ROUTES.diagnose}
      onPaid={() => navigate(ROUTES.diagnoseScan, { replace: true })}
    />
  )
}
