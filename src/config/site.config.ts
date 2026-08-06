export const siteConfig = {
  name: "Threddo",
  description:
    "Give away or sell your used clothes, shoes, bags, and hair — connect directly with buyers over WhatsApp. No fees, no in-app payments.",
  url: "https://threddo.com.ng",
  ogImage: "/og-image.png",
  social: {
    twitter: "",
    instagram: ""
  },
  // Admin WhatsApp contact for starting an escrow transaction.
  escrowSupportWhatsAppLink:
    "https://wa.me/2349112773159?text=" +
    encodeURIComponent("Hi, I'd like to start an escrow transaction for a Threddo listing."),
  // Google sign-in is fully built (button, OAuth callback, phone-onboarding
  // step) but hidden until the Google OAuth consent screen is approved.
  // Flip to true once that's done — no other code changes needed.
  googleSignInEnabled: false
};
