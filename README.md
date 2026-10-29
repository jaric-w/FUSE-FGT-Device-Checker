# Free Geek Toronto: website prototype

A prototype website for Free Geek Toronto, built for the FUSE Blueprint 2026 case competition. It includes a working donation checker and a business pickup flow.

**Live site:** https://jaric-w.github.io/FUSE-FGT-Device-Checker/

> Student prototype. This is not an official Free Geek Toronto website.

## The problem

Free Geek Toronto refurbishes donated computers and gets them to people who need them. Two things slow it down:

- Many donations are items it can't use, which cost staff time to sort and recycle.
- It has few corporate partners, even though businesses replace large batches of the same laptops every few years.

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | Landing page with a quick "can we take it?" search, impact numbers, the second life of a donated laptop, and ways to help |
| `donate.html` | The full donation checker, the complete list of accepted items, data-wipe info and donation questions |
| `business.html` | The proposed business program: free pickup, a data-wipe certificate, an impact report, pickup rates and partner levels |
| `shop.html` | Refurbished computers, pricing facts, why Linux Mint, nonprofit bulk buying and store info |
| `about.html` | Mission, programs, history in numbers and volunteering |
| `contact.html` | Address, hours, map, entrance notes, social links and common questions |

## How the donation checker works

1. **Pick a device.** Choose a tile or search, for example laptop, monitor or printer.
2. **How many?** Fewer than 5 computers means drop-off. 5 or more opens the pickup flow.
3. **How old?** Under 4 years, 4 to 8 years, over 8 years, or not sure.
4. **Does it work?** Yes, some, no, or not sure.
5. **Result.** One of:
   - **Drop it off,** with the address, the hours and what's needed most.
   - **Book a pickup,** through a short form for bulk donations.
   - **We can't take this,** with suggestions for where else it can go.

Free pickup applies to businesses giving 10 or more similar, working computers under 8 years old. After booking, businesses see a sample data-wipe certificate. The home page's quick search links straight into the checker, for example `donate.html?d=laptop`.

## How it fits the plan

The website is the working piece of our solution, **TRUST**:

| Step | What it means |
| --- | --- |
| **T**arget businesses | Reach out to companies that refresh laptops in batches |
| **R**oute & receive | The checker and pickup form send each donation to the right place |
| **U**phold privacy | A data-wipe certificate for every business batch |
| **S**hare impact | An impact report showing where the devices went |
| **T**hank & retain | Partner page, recognition levels and refresh reminders |

## Files

```
index.html, donate.html, business.html, shop.html, about.html, contact.html
css/site.css      shared styles: colours, type, header, footer, animations
css/home.css      landing page only
css/checker.css   donation checker and certificate
js/devices.js     what Free Geek accepts (edit this list to change the checker)
js/checker.js     the donation checker
js/site.js        menu, scroll animations, counters, quick search
assets/           logo and photos
```

Built with plain HTML, CSS and JavaScript, with no frameworks or build step. It works on phones and computers, supports light and dark mode, and respects the reduced-motion setting.

## Run it locally

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Sources and credits

- Facts, accepted items, hours and pickup fees come from freegeektoronto.org. Free Geek's own pages list slightly different drop-off hours, so confirm them before launch.
- Free business pickup, certificates, impact reports and partner levels are proposed features. The certificate on the business page uses sample figures.
- The logo belongs to Free Geek Toronto and is used for this case competition prototype.
- Photos are from Wikimedia Commons under open licences. Each one is credited in the site footer under "Photo credits".

## Author

[jaric-w](https://github.com/jaric-w), FUSE Blueprint 2026
