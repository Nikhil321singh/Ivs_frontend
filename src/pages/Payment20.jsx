import { useLocation, useNavigate } from 'react-router-dom'
import PaymentGateway from '../components/PaymentGateway'
import { ROUTES } from '../constants/routes'

// ₹20 IMEI-verification payment (buys 20 tokens; the CEIR check debits them).
export default function Payment20() {
  const navigate = useNavigate()
  const { state } = useLocation()
  return (
    <PaymentGateway
      amount={20}
      payee="Grest Verify Services"
      description="IMEI verification (₹20)"
      backTo={ROUTES.imeiEnter}
      onPaid={() => navigate(ROUTES.imeiResult, { replace: true, state })}
    />
  )
}
