/**
 * Privacy Utility Functions
 * Functions to mask and protect customer PII (Personally Identifiable Information)
 */

/**
 * Mask phone number - show only last 4 digits
 * Example: +1234567890 -> ******7890
 */
const maskPhone = (phone) => {
  if (!phone || phone.length < 4) return "****";
  return "*".repeat(Math.max(phone.length - 4, 0)) + phone.slice(-4);
};

/**
 * Mask email address - show only first letter and domain
 * Example: john.doe@example.com -> j*******@example.com
 */
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "*****@*****.com";

  const [localPart, domain] = email.split("@");
  const maskedLocal =
    localPart.charAt(0) + "*".repeat(Math.max(localPart.length - 1, 3));

  return `${maskedLocal}@${domain}`;
};

/**
 * Mask customer name - show only first name initial and last name
 * Example: John Doe Smith -> J. Smith
 */
const maskName = (name) => {
  if (!name) return "****";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0) + "*".repeat(Math.max(parts[0].length - 1, 2));
  }

  // Show first initial and last name
  const firstInitial = parts[0].charAt(0);
  const lastName = parts[parts.length - 1];

  return `${firstInitial}. ${lastName}`;
};

/**
 * Mask customer data object for staff views
 * Returns object with masked phone and email
 */
const maskCustomerData = (customer) => {
  if (!customer) return null;

  return {
    name: customer.name || "Anonymous",
    phone: customer.phone ? maskPhone(customer.phone) : "",
    email: customer.email ? maskEmail(customer.email) : "",
  };
};

/**
 * Mask customer data for public/list views
 * Returns object with fully masked name and no contact info
 */
const maskCustomerDataPublic = (customer) => {
  if (!customer) return null;

  return {
    name: customer.name ? maskName(customer.name) : "Anonymous",
    phone: "", // Don't expose phone at all
    email: "", // Don't expose email at all
  };
};

/**
 * Check if user has permission to view full customer data
 * Only admin can see full customer information
 */
const canViewFullCustomerData = (userRole) => {
  return userRole === "admin";
};

module.exports = {
  maskPhone,
  maskEmail,
  maskName,
  maskCustomerData,
  maskCustomerDataPublic,
  canViewFullCustomerData,
};
