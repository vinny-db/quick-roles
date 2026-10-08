# Quick Roles: Design Decisions (v1)

Decided 8 Oct 2026 by Vincent. Canvas: "Quick Roles v1 Layout" (Design artifact). Round 6 the same night replaced the sticker look with the Soft minimal system after the live site read as cluttered on a phone.

## Direction: Soft (minimalist), chosen in round 6
Vincent's brief: "the look and feel is very clumsy, explore minimalist styles." Three were shown as phone screens (A Paper, B Soft, C Mono). B Soft was chosen "but could be more aesthetic"; it was refined before building (soft elevation instead of borders, a warm gradient wash behind the hero, airier cards, pastel icon tiles in the quiz).

Principles: warm cream ground, white surfaces that float on soft shadows, no hard outlines, no stickers, no rotation, one yellow dot as the brand mark, mint for anything live or selected. Headline stays "We're hiring!" with the turn line, because it is the one playful moment we keep.

## Tokens
| Token | Value | Use |
|---|---|---|
| Ink | #1A1A1A | Text, primary buttons, selected states |
| Ground | #FAF7F1 | Page background (warm cream) |
| Surface | #FFFFFF | Cards, header pills, search bar |
| Well | #F3F0E9 | Chips, soft buttons, input fields |
| Line | rgba(20,20,10,.08) | Hairlines, chip borders |
| Mint | #DDF5E8 (dot #1DB469) | Live pill, apply band, selected quiz tiles, salary chips, progress bar |
| Butter | #FFF1BF (dot #F2C230) | Brand dot, the "!" in the headline, Hiring? box, alert side box |
| Blush | #FFE3EC | Deadline block and urgent deadline chips |
| Lilac #E9E3FF · Sky #DCEEFF · Peach #FFE6D5 | Role tiles and quiz icon tints |
| Muted | #6B6B66 | Secondary copy (passes 4.5:1 on cream) |

Shadows: card 0 1px 2px .04 + 0 10px 30px .06; float 0 18px 44px .10. Radius: 18px cards, 999px pills, 12px inputs and tiles. Type: Bricolage Grotesque only (500 to 800), headings 800 with tight tracking. Fonts self-hosted by Next.js, no runtime Google request.

## Navigation
Desktop: dot wordmark "Quick Roles" left; pill nav Browse jobs · Remote · Fresh grads (active = white pill with shadow); right: Post a job (quiet), Get alerts (outline pill), Find my match (ink pill). No header rule.
Phone: wordmark plus a bell icon (alerts). Bottom tab bar Jobs · Remote · Match (raised ink circle) · Alerts, white with blur, active item marked by a yellow dot.

## Landing page structure
1. Hero (gradient wash top-right mint, bottom-left butter): live pill "1,293 new roles since yesterday" · We're hiring! · Well, they're hiring. We just made it easier. · sub line · one search field ("Try 'accountant, Lagos' or 'remote design'") with an ink Search pill inside · scrollable jump chips Remote · Lagos · Abuja · NYSC · Fresh grads · Pays well · Dropped today · mint match card "Not sure what to search? Find my match · four taps, 30 seconds".
2. Just dropped: two-column cards, "Checked 17 min ago", All jobs → on the right, "See all 1,324 jobs" button under the grid.
3. Alerts band (white card): Don't chase. Get chased. Keyword, location, email, optional phone, consent tick with a privacy link.
4. Two boxes: Hiring? Post it free (butter) · Straight from the source.
5. Government strip (white pill): Is that government recruitment real? Check →.
6. Footer: About · Every source · Telegram · Post a job · Report a scam · Privacy · Terms · quickroles.africa.

## Search
One field. The server splits "accountant, Lagos", "remote design" or "nurse in Abuja" into keyword and place (known Nigerian cities, remote, hybrid, work from home). The jobs page shows the same field with the parsed text put back together.

## Cards
White, borderless, soft shadow, lift on hover. 44px tile: employer logo (served through our own /api/logo route) or a pastel lane icon, never an initial. Title (links to the job page), "Company · City", time on the right. Chips: level, mode (not for remote), salary (mint), deadline (blush when urgent). Footer: source name, Learn more (soft pill), Apply ↗ (ink pill), tight padding.

## Find my match (rebuilt in round 6)
One question per screen, four screens: How do you want to work? (Remote, Hybrid, On site) · Where are you at? (NYSC or fresh grad, Entry, 3 to 6 years, 6+) · What's your lane? (ten lanes, two-column tiles with icons) · Where should it be? (five cities, Anywhere in Nigeria, Remote only). All multi-select. Back circle button, mint progress bar, "2 / 4". Floating action bar: Skip (or Clear once something is picked) and Next; the last step says Review. Summary screen "Your picks" lists every answer as mint chips with Edit per question, then Show my matches. No footer on the quiz page. Results: city picks OR remote jobs, best matches first.

## Job page
Breadcrumb · tile · title · "Company · City" · chips (level, lane, mode, Dropped 3h ago) · blush deadline block (CLOSES / 8 Nov / 2026). Mint apply band: "Go apply. It's still open." / "Seen live on jobgurus.com.ng 37 min ago. Closes 8 Nov 2026." / ink button "Apply on jobgurus.com.ng ↗". Four fact cards (Salary, Deadline in blush, Level, Source). The role (full text only from employer pages). Foot note: Nobody here charges a fee. Ever. · Report this listing · Share on WhatsApp. Side: butter alert box, Also dropped.

## Component rules
- Nothing decorative may look clickable.
- Alerts: explicit consent tick on every form with a privacy link (NDPA). Employer post form accepts the terms.
- Apply always leaves to the source site. Learn more opens our job page.
- Favicon: ink rounded square, white Q, yellow dot.

## Earlier rounds (kept on canvas for reference)
Rounds 1 to 5: Big Type and Stickers (pastel), four directions A to D, logo sheets, live-count options. Round 6: MinA Paper, MinB Soft (chosen), MinC Mono.

## Still open
- Logo decision for marketing use (headers use the dot wordmark)
- Empty, loading and error states beyond the current text versions
- Telegram channel name and bot setup
- Admin screen for employer post moderation and logo overrides
