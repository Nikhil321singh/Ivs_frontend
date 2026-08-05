// Certificate-of-verification markup, ported from the supplied certificate.html
// (Figma export) into a data-bound HTML string. Rendered offscreen and rasterised
// by src/lib/pdf.js (html2canvas → jsPDF) so the PDF matches the design pixel-for-
// pixel. Absolute positioning from the export is replaced with a plain flex column
// so the node sizes to its content (html2canvas-friendly). All image slots use
// local assets under /assets/certificate so there are no cross-origin taint issues.
//
// Natural render width is 2058px (the Figma content width); pdf.js scales the
// resulting canvas down to fit an A4 page.
export const CERT_WIDTH = 2058

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// data: { imei, device, dateTime, statusLabel } — statusLabel defaults to SAFE.
export function certificateHtml({ imei, device, dateTime, statusLabel = 'SAFE' } = {}) {
  return `
  <div style="width:${CERT_WIDTH}px; box-sizing:border-box; padding:132px 0 120px;
              background:linear-gradient(180deg,#F0EEEF 0%,#FFFFFF 100%);
              font-family:'Spline Sans',Inter,sans-serif;
              display:flex; flex-direction:column; align-items:center; gap:72px;">

    <!-- header: Grest × Sanchar Saathi -->
    <img src="/assets/certificate/header.png" style="width:1700px; height:auto; display:block;" />

    <!-- safe hero -->
    <div style="display:flex; flex-direction:column; align-items:center; gap:32px; padding-top:10px;">
      <img src="/assets/certificate/shield.png" style="width:251px; height:auto; display:block;" />
      <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
        <div style="font-size:100px; font-weight:500; color:#17171C;">
          YOUR DEVICE IS <span style="font-weight:700; color:#129E5E;">${esc(statusLabel)}</span>
        </div>
        <div style="font-size:62px; font-weight:400; color:#6B7280; text-align:center;">
          Not blacklisted · safe to trade
        </div>
      </div>
    </div>

    <div style="font-size:82px; font-weight:400; color:#000; text-align:center; line-height:1.25;">
      This device has been successfully verified using the<br/>official Sanchar Saathi verification service.
    </div>

    <!-- IMEI details card -->
    <div style="width:1902px; box-sizing:border-box; padding:82px 110px;
                background:rgba(255,255,255,0.24); border:9px solid #ECE7EC; border-radius:62px;
                display:flex; flex-direction:column; gap:56px;">
      <div style="font-size:92px; font-weight:600; color:#17171C;">IMEI Details</div>
      <div style="height:6px; background:#ECE7EC;"></div>

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:82px; font-weight:400; color:#6B7280;">IMEI</div>
        <div style="font-size:82px; font-weight:600; color:#17171C;">${esc(imei)}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:82px; font-weight:400; color:#6B7280;">Device</div>
        <div style="font-size:82px; font-weight:600; color:#17171C;">${esc(device)}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:82px; font-weight:400; color:#6B7280;">Date &amp; time</div>
        <div style="font-size:82px; font-weight:600; color:#17171C;">${esc(dateTime)}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:82px; font-weight:400; color:#6B7280;">Status</div>
        <div style="display:flex; align-items:center; gap:31px; padding:31px 62px;
                    background:#E7F6EE; border-radius:123px;">
          <div style="font-size:74px; font-weight:600; color:#129E5E;">✓ ${esc(statusLabel)}</div>
        </div>
      </div>
    </div>

    <!-- source note -->
    <div style="width:1902px; box-sizing:border-box; padding:80px 67px;
                background:rgba(236,236,248,0.40); border:3px solid rgba(143,144,251,0.60);
                border-radius:62px;">
      <div style="font-size:62px; font-weight:400; color:#6B7280; line-height:1.3;">
        This data is securely provided by the <span style="color:#2E2F81; font-weight:500;">Sanchar Saathi</span> App.
        GOI. <span style="color:#2E2F81; font-weight:500;">Grest</span> simply provides you this information to help you
        make confident &amp; informed decisions.
      </div>
    </div>

    <!-- certified seal -->
    <img src="/assets/certificate/seal.png" style="width:730px; height:auto; display:block; margin-top:20px;" />
  </div>`
}
