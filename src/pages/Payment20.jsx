import { useLocation, useNavigate } from 'react-router-dom'
import PaymentGateway from '../components/PaymentGateway'
import { ROUTES } from '../constants/routes'
import { verifyImei } from '../api/ivs'

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
      // Runs the real CEIR check, which debits 20 tokens and returns the result.
      chargeTokens={() =>
        verifyImei({
          imei1: state?.imei,
          imei2: state?.imei2,
          deviceModel: state?.deviceModel,
          customerName: state?.customerName,
        })
      }
      onPaid={(res) => navigate(ROUTES.imeiResult, { replace: true, state: { ...state, verify: res } })}
    />
  )
}
