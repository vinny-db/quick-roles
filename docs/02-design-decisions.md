# Quick Roles: Design Decisions (v1)

Decided 8 Oct 2026 by Vincent after reviewing four directions. Canvas: "Quick Roles v1 Layout" (Design artifact). Updated after the full review pass and the pastel decision the same evening.

## Direction: B, Big Type and Stickers, pastel
References: MoMoney, L'Institut Anti-Poux, the "We're hiring" poster. Research basis: Gen Z responds to saturated colour, chunky display type, visible hand-craft (stickers, outlines), and copy that sounds like a person; sterile minimalism and smooth gradients read as corporate. 93% of Gen Z search for jobs on a phone, so the phone screen is the product and the desktop is the poster.

Pastel decision: fills are soft (butter, blush, mint, lavender, sky) while outlines, text and primary buttons stay black. The black keeps the pastel from looking washed out and keeps every button obviously tappable. No fully black bands anywhere; the former black bands are lavender with a black outline.

## Tokens
| Token | Value | Use |
|---|---|---|
| Ink | #0F0F0F | Text, outlines, primary buttons |
| Ground | #FFFCF5 | Page background (warm off-white) |
| Quiz ground | #F6F3FF | Quiz page background (pale lavender) |
| Soft | #F3F0E8 | Tag chips, footer strip |
| Butter | #FFE27A | Wordmark marker, active nav marker, script accent, search bar shadow, "Hiring?" box, "find your next job" sticker |
| Blush | #FFB8D1 | "312 new roles since 6am" sticker, deadline chips and sticker, Find my match shadow, band shadows |
| Mint | #C9F2D9 | "no login · no fees" sticker, salary chips, support and finance role tiles |
| Lavender | #D8CCFF | Alerts band, apply band on job page, quiz results header, quiz bar shadow |
| Sky | #BFE4FF | Tech role tile |
| Card shadow | #E9E3FF | Hard offset shadow on cards |
| Muted text | #5A5A55 on ground, #4A4458 on lavender | Secondary copy (both pass 4.5:1) |

Type: Archivo Black (display, all headings), Instrument Serif italic (one accent word, butter with 3px black shadow), Bricolage Grotesque 500 to 700 (UI and body). All from Google Fonts, free.

Shapes: pills everywhere (999px radius), 2px black outlines on cards, chips and bands, 3px on stickers and primary buttons, hard offset shadows (4px 4px 0) in butter, blush, lavender or the card shadow tone. Stickers rotate 4 to 14 degrees. No gradients, no emoji, no characters.

## Navigation (decided in the review pass)
Desktop: wordmark left (ROLES sits on a tilted butter marker). Nav as bold text, not pills: Browse jobs · Remote · Fresh grads · Companies. The active item carries a tilted butter marker under the word. Right side: Post a job (quiet text), Get alerts (outline pill), Find my match (black pill, butter shadow). Header has a 2px black bottom rule.

Why these four: they map to how people actually look (everything, remote only, my stage, which companies). "Companies" shows off employer-direct listings with logos, which no Nigerian board does. Government moved to a footer strip plus its own search page. "NYSC" became "Fresh grads" (covers NYSC, internships, graduate trainee).

Phone: wordmark plus menu at the top; a bottom tab bar with Jobs · Remote · Match (raised black circle, blush shadow) · Alerts. Replaces the sticky alerts banner.

## Landing page structure
1. Hero: WE'RE HIRING! · sentence-case turn ("Well, they're hiring. We just made it easier.") · sub line · search bar (keyword and location, butter shadow) · "or jump to" chips · "Not sure what to search? Find my match, 30 sec". Stickers: 312 new roles since 6am (blush circle), no login · no fees (mint pill), find your next job with a sparkle (butter tag; no arrow, it must not look clickable).
2. Just dropped: two-column cards, freshness line "Checked 14 minutes ago · 312 new since 6am", sort control on the right.
3. Alerts band (lavender): Don't chase. Get chased. Keyword, email, optional phone, consent tick.
4. Two boxes: Hiring? Post it free (butter) · Straight from the source.
5. Government strip: Is that government recruitment real? Official links only. Nobody charges a fee. Check here.
6. Footer: About · Every source · Telegram channel · Report a scam listing · Privacy · Made in Lagos.

## Copy system (hype voice, mixed case)
| Where | Copy |
|---|---|
| Hero | WE'RE HIRING! then sentence case: Well, they're hiring. We just made it easier. |
| Hero sub | Every open role in Nigeria plus the remote ones that take you. Checked every hour. No login, no fees, no stories. |
| Hero stickers | 312 new roles since 6am · no login · no fees · find your next job |
| Buttons | Find my match · 30 sec / More, please / Send me jobs |
| Freshness | Section line under Just dropped: Checked 14 minutes ago · 312 new since 6am. No total job count anywhere. |
| Chips | Remote · Lagos · Abuja · NYSC · Fresh grad · Pays well · Dropped today |
| Jobs section | Just dropped |
| Cards | Learn more (job page) · Apply (employer site) |
| Alerts | Don't chase. Get chased. / New jobs that match you, in your inbox or on Telegram. No account. Stop anytime. / Email, phone, or both. All optional. |
| Government strip | Is that government recruitment real? Official links only. Nobody charges a fee. |
| Employers | Hiring? Post it free. We put it in front of the right people. |
| Sources | Straight from the source. Employer pages, public boards, NGO feeds. Every listing links home. |
| Quiz | Tap what fits. Pick as many as you like. / 30 seconds, tops / Your matches. Go get them. / Keep this list alive. |
| Job page | Go apply. 13 days left. / Checked 40 minutes ago on Airtel's site. / More like this, sent to you. / Also dropped / Nobody here charges a fee. Ever. |
| States | Nothing yet. We check again in 42 minutes. / Finding the fresh ones. / This job left. Others didn't. |

## Component rules
- Card tile: employer logo when the job comes from an employer page or a known company; otherwise a role sticker (design blush, support mint, tech sky, finance mint, sales butter, health blush). Never a first initial.
- Deadline: blush chip on the card when known ("Closes in 13 days" or "Closes 30 Oct"); on the job page a rotated blush sticker beside the title, a blush Deadline cell, and the apply band says "Go apply. 13 days left." When unknown: "No deadline stated. Apply early."
- Quiz: one screen, four questions, all multi-select, no gating. White sticky bar shows "n of 4 answered" and the Show my matches button (black when enabled). Results show every answer as an editable chip; Edit answers returns to the form with answers kept. Matching: any of the picks within a question; jobs matching more picks sort first.
- Alerts: email, optional phone, explicit consent tick on every form (NDPA). Email and Telegram in v1. Telegram needs the person to tap Start on our bot once; phone mainly powers WhatsApp later.
- Apply always leaves to the source site. Learn more opens our job page.
- Nothing decorative may look clickable: stickers never carry arrows or chevrons.

## Logos in the build
The mockup shows real marks for Airtel and Andela (open-licence icon set) and grey LOGO tiles elsewhere, because the design tool cannot fetch from company websites. Live site: each employer has a domain; on first sight we try a logo service (logo.dev free tier), then the site icon, then the social-share image; first hit is stored. Weekly re-check per employer. Fallback is the role sticker. Admin override page for manual uploads.

## Government recruitment
Decision: off the landing grid. One strip above the footer, plus a standalone search-optimised page ("Is it real? Official link, dates, no fees") hand-curated by Vincent during recruitment waves. Rationale: 843,008 applicants for 10,000 police roles in one round; Immigration issues fake-portal warnings every cycle. Cheapest acquisition channel on the budget.

## Not chosen (kept on canvas for later)
A. Plug In (orange poster, cables), C. Green Room (mascot), D. Colour Blocks (arches, photos). Elements can be borrowed for campaigns.

## Still open
- Final illustration pass on the six role stickers (coded sketches today)
- Empty, loading and error states to be drawn
- Companies page, Every source page, About, Privacy, government page (built in code, not mocked)
- Employer "Post a job" form and moderation screen
- Telegram channel name and bot setup
- Phone menu contents (hamburger) to be defined
