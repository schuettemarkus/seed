# COPPA Consent Language

**Version**: 1.0
**Status**: DRAFT — Requires lawyer review before public launch

## Consent Screen Copy

### Heading
"Before we get started, we need your consent."

### Body
Seed collects and processes your child's educational data to create personalized learning experiences. Here's what that means in plain English:

**What we collect:**
- Your child's first name, age, and learning preferences
- Their lesson responses and progress
- Voice recordings and drawings (if they use those features)
- Questions they ask during lessons ("Wonder" questions)

**What we do with it:**
- Generate personalized lessons calibrated to their age and interests
- Track their progress so you can see how they're growing
- Build a keepsake portfolio of their work
- Improve lesson quality based on your feedback

**What we never do:**
- Show ads to your child
- Sell your family's data
- Track your child's behavior for analytics
- Share data with third parties for non-educational purposes

**Your rights:**
- View all data collected about your child at any time
- Export your family's complete data as JSON
- Delete your child's profile and all associated data
- Revoke consent (which deactivates the child's profile)

### Consent Checkbox
"I am the parent or legal guardian of the child(ren) I am adding to Seed. I have read and agree to the [Privacy Policy] and [Terms of Service]. I consent to Seed collecting and processing my child's data as described above."

### Technical Requirements
- Consent must be logged with: timestamp, IP address, user agent, consent version, privacy policy version, ToS version
- Re-consent required on any change to data practices
- Consent record must be exportable and deletable

---

*This document requires legal review before public use.*
