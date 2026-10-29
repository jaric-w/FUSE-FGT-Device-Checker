// Shared data: what Free Geek Toronto accepts, from its public donation page.
// Used by the quick check on the home page and the full checker on donate.html.
const BULK = 5;          // computers needed before we offer pickup
const FREE_MIN = 10;     // business batch size that qualifies for free pickup
const ADDRESS = "180 Sudbury St, Unit C3, Toronto";
const HOURS = "Fridays and Saturdays, 12:15 to 4:45 PM";

// tier: need = most needed, ok = accepted, no = not accepted.
// computer: ask age + condition; eligible for bulk pickup.
const DEVICES = [
  { id: "laptop", name: "Laptop", plural: "laptops", tier: "need", computer: true, keys: "notebook macbook chromebook thinkpad dell hp lenovo" },
  { id: "desktop", name: "Desktop", plural: "desktops", tier: "need", computer: true, keys: "pc tower imac computer" },
  { id: "monitor", name: "Monitor", plural: "monitors", tier: "need", keys: "screen display lcd flat" },
  { id: "keyboard", name: "Keyboard or mouse", tier: "need", keys: "trackpad mice" },
  { id: "webcam", name: "Webcam", tier: "need", keys: "camera usb" },
  { id: "cables", name: "Cables and chargers", tier: "need", keys: "charger adapter usb hdmi power cord" },
  { id: "parts", name: "Computer parts (RAM, SSD, GPU)", tier: "need", keys: "ram ssd hdd hard drive gpu graphics card psu memory component" },
  { id: "server", name: "Server", plural: "servers", tier: "ok", computer: true, keys: "rack" },
  { id: "phone", name: "Phone", tier: "ok", keys: "iphone android smartphone cell samsung mobile" },
  { id: "tablet", name: "Tablet", tier: "ok", keys: "ipad kindle" },
  { id: "router", name: "Modem, router or switch", tier: "ok", keys: "wifi networking" },
  { id: "console", name: "Gaming console and games", tier: "ok", keys: "xbox playstation ps4 ps5 nintendo switch wii controller" },
  { id: "tv", name: "Flat-screen TV", tier: "ok", keys: "television lcd plasma" },
  { id: "scanner", name: "Scanner", tier: "ok", keys: "" },
  { id: "camera", name: "Digital camera", tier: "ok", keys: "camera" },
  { id: "audio", name: "Stereo, radio or amplifier", tier: "ok", keys: "audio receiver" },
  { id: "turntable", name: "Turntable", tier: "ok", keys: "record player vinyl" },
  { id: "speakers", name: "Speakers", tier: "ok", keys: "bluetooth audio" },
  { id: "projector", name: "Video projector", tier: "ok", keys: "" },
  { id: "dvd", name: "DVD or Blu-ray player", tier: "ok", keys: "" },
  { id: "vcr", name: "VCR player", tier: "ok", keys: "" },
  { id: "batteries", name: "Batteries", tier: "no", keys: "battery aa lithium", alt: "Many hardware and electronics stores collect household batteries." },
  { id: "flashlight", name: "Flashlight", tier: "no", keys: "torch" },
  { id: "typewriter", name: "Electric typewriter", tier: "no", keys: "" },
  { id: "tools", name: "Power tools", tier: "no", keys: "drill saw motorized electric tool" },
  { id: "microwave", name: "Microwave", tier: "no", keys: "oven" },
  { id: "smoke", name: "Smoke detector", tier: "no", keys: "alarm", alt: "Some contain radioactive material, so follow the manufacturer's disposal instructions." },
  { id: "appliance", name: "Appliance or air conditioner", tier: "no", keys: "fridge washer dryer kettle toaster" },
  { id: "register", name: "Cash register", tier: "no", keys: "" },
  { id: "motor", name: "Motor", tier: "no", keys: "" },
  { id: "vhs", name: "VHS tapes", tier: "no", keys: "video tape" },
  { id: "fax", name: "Fax machine", tier: "no", keys: "" },
  { id: "telephone", name: "Landline phone or answering machine", tier: "no", keys: "landline cordless telephone" },
];
const CHOICES = ["laptop", "desktop", "monitor", "phone", "tablet", "keyboard"];
const TIER = { need: ["Most needed", "t-need"], ok: ["Accepted", "t-ok"], no: ["Not accepted", "t-no"] };
const AGE = [
  { v: "new", t: "Under 4 years", s: "Bought fairly recently" },
  { v: "mid", t: "4 to 8 years", s: "A few upgrades ago" },
  { v: "old", t: "Over 8 years", s: "From before most of today's phones" },
  { v: "unsure", t: "Not sure", s: "That's fine, we'll check" },
];
const WORKS = [
  { v: "yes", t: "Yes, they turn on" },
  { v: "some", t: "Some of them do" },
  { v: "no", t: "No, they don't" },
  { v: "unsure", t: "Not sure" },
];
const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four"];

const byId = (id) => DEVICES.find(d => d.id === id);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
