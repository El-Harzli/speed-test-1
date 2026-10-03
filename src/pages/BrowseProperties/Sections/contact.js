// Used only as a fallback — if a listing's agent record has no phone number
// on file (or the agent lookup failed entirely, see FALLBACK_AGENT in
// PropertiesContext), routing to the general agency line beats sending the
// lead to a broken wa.me link with no number at all.
//
// This used to be a hardcoded constant here; it's now passed in by the
// caller (PropertyDetail.jsx), which reads the real value from Settings
// (admin dashboard) via PropertiesContext — this file stays a plain
// function with no context/hook dependency of its own.
function sanitizePhone(phone) {
  return (phone || "").replace(/[^\d]/g, "");
}

// `phone` should be the specific listing's agent phone (property.agent.phone)
// so the lead reaches the person actually responsible for that property,
// not a generic inbox. `fallbackPhone` is the site-wide agency number, used
// only when the agent has none on file.
export function buildWhatsAppLink(propertyTitle, phone, fallbackPhone) {
  const sanitized = sanitizePhone(phone) || sanitizePhone(fallbackPhone);
  const message = `I am interested in '${propertyTitle}' and want to check availability`;
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}
