export const CONSENT_VERSION = '1.0'
export const PRIVACY_POLICY_VERSION = '1.0'
export const TOS_VERSION = '1.0'

export const COPPA_CONSENT_TEXT = `By checking this box, I confirm that I am the parent or legal guardian of the child(ren) I am adding to Seed. I consent to Seed collecting and processing my child's educational data as described in the Privacy Policy. I understand that:

- Seed collects my child's name, age, learning preferences, and lesson responses to provide personalized education
- AI-generated lesson content is created server-side and stored securely
- Voice recordings (if used) are auto-deleted after 90 days unless I mark them as favorites
- No behavioral advertising is ever shown to my child
- I can export or delete all of my family's data at any time
- I will be asked to re-consent if Seed's data practices change`

export function buildConsentRecord(parentId: string, childId: string) {
  return {
    parent_id: parentId,
    child_id: childId,
    consent_version: CONSENT_VERSION,
    privacy_policy_version: PRIVACY_POLICY_VERSION,
    tos_version: TOS_VERSION,
    user_agent: navigator.userAgent,
  }
}
