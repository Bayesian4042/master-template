import { emailTemplateWrapper } from "./wrapper";

export const emailOTPTemplate = ({
	otp,
	validity,
}: {
	otp: string;
	validity: number;
}) =>
	emailTemplateWrapper(`
<h1 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; line-height: 30px;">
  Verification Code
</h1>
<p style="font-size: 15px; line-height: 24px; color: #717a8a; margin: 0 0 28px;">
  Use the code below to complete your verification. Do not share this code with anyone.
</p>

<!-- OTP box -->
<div style="background-color: #f4f6f9; border-radius: 10px; padding: 28px 20px; text-align: center; margin: 0 0 28px;">
  <p style="font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #717a8a; margin: 0 0 12px;">
    Your one-time password
  </p>
  <div style="display: inline-block; font-size: 40px; font-weight: 800; letter-spacing: 0.18em; color: #41637e; font-family: 'Courier New', monospace;">
    ${otp}
  </div>
</div>

<!-- Expiry notice -->
<table cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 0 28px;">
  <tr>
    <td style="background-color: #fff8e6; border-left: 4px solid #f5a623; border-radius: 0 6px 6px 0; padding: 12px 16px;">
      <p style="font-size: 13px; line-height: 20px; color: #8a6a00; margin: 0;">
        &#9203;&nbsp; This code expires in <strong>${validity} minutes</strong>. Request a new one if it has expired.
      </p>
    </td>
  </tr>
</table>

<!-- Security note -->
<p style="font-size: 13px; line-height: 20px; color: #9aa5b4; margin: 0; border-top: 1px solid #eef0f3; padding-top: 20px;">
  If you did not request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
</p>
`);
