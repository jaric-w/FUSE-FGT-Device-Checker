# FGT Donation Checker

A prototype donation checker for Free Geek Toronto, built for the FUSE Blueprint 2026 case competition.

**Live site:** https://jaric-w.github.io/FUSE-FGT-Device-Checker/

> Student prototype. This is not an official Free Geek Toronto website.

## The problem

Free Geek Toronto refurbishes donated computers and gets them to people who need them. Two things slow it down:

- Many donations are items it can't use, which cost staff time to sort and recycle.
- It has few corporate partners, even though businesses replace large batches of the same laptops every few years.

## What the checker does

The checker asks a few quick questions and tells the donor what to do next.

1. **Pick a device.** Choose a tile or search, for example laptop, monitor or printer.
2. **How many?** Fewer than 5 computers means drop-off. 5 or more opens the pickup flow.
3. **How old?** Under 4 years, 4 to 8 years, over 8 years, or not sure.
4. **Does it work?** Yes, some, no, or not sure.
5. **Result.** One of:
   - **Drop it off.** The result gives the address (180 Sudbury St, Unit C3), the hours (Fridays and Saturdays, 12:15 to 4:45 PM), and what Free Geek needs most.
   - **Book a pickup.** For bulk donations, a short form asks for business or individual, contact details, address, area, day and model.
   - **We can't take this.** The result suggests where else the item can go.

### Business pickup

- Pickup fees follow Free Geek Toronto's published rates by area: $60 downtown up to $100 for Peel or York.
- Free drop-off at the shop is always offered as an alternative to paying the fee.
- **Free pickup:** a business qualifies with 10 or more working, similar computers that are under 8 years old.
- After booking, businesses see a **sample data-wipe certificate** listing serial numbers, devices wiped and kilograms kept out of landfill. It shows the kind of proof a company needs before it donates.

## How it fits the plan

The checker is the first working piece of our solution, **TRUST**:

| Step | What it means |
| --- | --- |
| **T**arget businesses | Reach out to companies that refresh laptops in batches |
| **R**oute & receive | This checker and pickup form send each donation to the right place |
| **U**phold privacy | A data-wipe certificate for every business batch |
| **S**hare impact | An impact report showing where the devices went |
| **T**hank & retain | Partner page, recognition tiers and refresh reminders |

## Built with

- Plain HTML, CSS and JavaScript in a single `index.html`, with no frameworks or build step.
- Works on phones and computers and supports light and dark mode.
- Hosted free on GitHub Pages.

## Run it locally

Open `index.html` in any browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Data sources

- Accepted and not-accepted items, and pickup fees, come from Free Geek Toronto's public donation page.
- The certificate and serial numbers are samples for the demo.
- Data wiping is proposed to follow the NIST SP 800-88 standard.

## Author

[jaric-w](https://github.com/jaric-w), FUSE Blueprint 2026
