export const emailTemplateWrapper = (content: string) => `
<table style="border-collapse: collapse; table-layout: fixed; width: 100%; background-color: #fff;" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <div style="margin: 0 auto; max-width: 600px; min-width: 320px; width: 100%">
        <div style="font-size: 26px; line-height: 32px; margin-top: 16px; margin-bottom: 20px; color: #41637e; text-align: center;">
          <a href="https://heizen.work" style="text-decoration: none; color: #41637e">
            <img src="https://d2iyl9s54la9ej.cloudfront.net/heizen.png" alt="Heizen" style="display: block; height: auto; width: 100%; max-width: 80px;  border: 0; border-radius: 3px;" />
          </a>
        </div>
      </div>
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Courier New', monospace; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; padding: 20px 15px;">
        ${content}
      </div>
      
      <!-- Footer -->
      <div style="margin: 0 auto; max-width: 600px; min-width: 320px; width: 100%; border-top: 1px solid #999; background-color: #ffffff;">
        <div style="padding: 20px; text-align: center">
          <div style="padding-top: 8px">
            <a href="https://x.com/HeizenOfficial" style="text-decoration: none; display: inline-block; border-radius: 50%; width: 24px; height: 24px; background-color: #7f7f7f; margin-right: 4px;">
              <img src="https://i4.createsend1.com/static/eb/master/13-the-blueprint-3/images/socialmedia/twitter-white-small.png" alt="Twitter" style="border: 0; width: 100%; height: 100%" />
            </a>
            <a href="https://www.youtube.com/@heizen-official" style="text-decoration: none; display: inline-block; border-radius: 50%; width: 24px; height: 24px; background-color: #7f7f7f; margin-right: 4px;">
              <img src="https://i6.createsend1.com/static/eb/master/13-the-blueprint-3/images/socialmedia/youtube-white-small.png" alt="YouTube" style="border: 0; width: 100%; height: 100%" />
            </a>
            <a href="https://www.linkedin.com/company/heizenofficial" style="text-decoration: none; display: inline-block; border-radius: 50%; width: 24px; height: 24px; background-color: #7f7f7f;">
              <img src="https://i2.createsend1.com/static/eb/master/13-the-blueprint-3/images/socialmedia/linkedin-white-small.png" alt="LinkedIn" style="border: 0; width: 100%; height: 100%" />
            </a>
          </div>
          <div style="font-size: 12px; line-height: 19px; color: #999; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-top: 10px;">
            <p style="margin: 0">Heizen Inc.</p>
            <p style="margin: 0">
              We Build and Launch Fully Functional Enterprise-Grade AI Apps.
            </p>
            <p style="margin: 0">
              <a href="https://heizen.work" style="text-decoration: underline; color: #999">heizen.work</a>
              |
              <a href="https://studio.heizen.work/unsubscribe" style="text-decoration: underline; color: #999">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
`;
