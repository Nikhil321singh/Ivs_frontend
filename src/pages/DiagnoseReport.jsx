import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: "Diagnose App — Report" (§6.4). The report is produced by the companion
// Grest Diagnose app and stored on the diagnose session. This app displays it
// once a fetch endpoint exists. Placeholder for now — TODO: bind to the session
// result (GET diagnose session) when the backend endpoint lands.
export default function DiagnoseReport() {
  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.home} />

          <h1 className="text-h1 font-bold text-ink">Diagnosis report</h1>

          <div className="rounded-[16px] border-[1.5px] border-dashed border-line bg-white/60 px-4 py-10 text-center">
            <p className="text-[13px] font-medium text-muted">
              Report loads from the diagnose session once the device check completes.
            </p>
          </div>
        </div>

        <PrimaryButton onClick={() => {}} disabled>
          Share PDF Report
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
