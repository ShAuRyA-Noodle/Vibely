# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | ✅ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: shauryapunj404@gmail.com
Subject: `[HONEY-CHILLY SECURITY] <brief description>`

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive an acknowledgment within 48 hours. Critical issues are aimed for a patch within 7 days. You can also use GitHub's "Security › Report a vulnerability" tab on the repo.

## Security Controls

- Clerk-managed auth with `clerkMiddleware().protect()` on every protected route (feed, profile, connections, search, messages, analytics, and matching `/api/*` paths).
- Mongoose queries take string-only inputs derived from request params after explicit `Types.ObjectId.isValid` checks; no raw request bodies are spread into `.find({ ... })`.
- Cloudinary upload signed server-side, MIME + size validation before upload, signed delete on failure.
- CodeQL `security-extended` on every push, PR, and weekly schedule.
- Dependabot weekly security + version updates with `npm overrides` to pin transitive deps to advisory-clean versions.
- Branch protection on `main`: required CodeQL status checks, required linear history, no force-push, no deletion, conversation resolution required.
