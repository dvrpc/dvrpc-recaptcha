require("dotenv").config();
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

/**
 * Create an assessment to analyze the risk of an UI action.
 *
 * projectID: GCloud Project ID
 * recaptchaSiteKey: Site key obtained by registering a domain/app to use recaptcha services.
 * token: The token obtained from the client on passing the recaptchaSiteKey.
 * recaptchaAction: Action name corresponding to the token.
 * assessmentName: Set a name for this assessment.
 */
async function createAssessment(token, recaptchaAction) {
  let projectID = process.env.PROJECTID;
  let recaptchaSiteKey = process.env.SITEKEY;
  let assessmentName = process.env.ASSESSMENT || "default";

  // Create the reCAPTCHA client.
  const client = new RecaptchaEnterpriseServiceClient();

  // Set the properties of the event to be tracked.
  const event = {
    token: token,
    siteKey: recaptchaSiteKey,
  };

  const assessment = {
    event: event,
    name: assessmentName,
  };

  const projectPath = client.projectPath(projectID);

  // Build the assessment request.
  const request = {
    assessment: assessment,
    parent: projectPath,
  };

  return await new Promise((resolve) => {
    client.createAssessment(request, function (error, response) {
      if (error) {
        return { error };
      }
      // Check if the token is valid.
      if (!response.tokenProperties.valid) {
        resolve({
          error: `The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`,
        });
      } else {
        // Check if the expected action was executed.
        if (response.tokenProperties.action === recaptchaAction) {
          // Get the risk score and the reason(s).
          // For more information on interpreting the assessment,
          // see: https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
          resolve(response.riskAnalysis);
        } else {
          resolve({
            error:
              "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score.",
          });
        }
      }
    });
  });
}

export default createAssessment;
