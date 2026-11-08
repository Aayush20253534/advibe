export type PublicFAQ = {
  question: string;
  answer: string;
  category: "General" | "Advertisers" | "Drivers" | "Payments" | "Technical";
};
export const publicFAQs: PublicFAQ[] = [
  {
    question: "What is BlinkMyAd and how does it work?",
    answer:
      "BlinkMyAd is a planned mobile outdoor advertising platform connecting advertisers and eligible driver partners. Advertisers create campaigns, select vehicle-screen placements and submit creatives for review.",
    category: "General",
  },
  {
    question: "How can I book an advertising campaign?",
    answer:
      "Create an advertiser account and add your business. Upload a creative, which an admin checks against the screen specifications. Then build a campaign draft with your dates, daily hours and days, and submit it for review. An admin approves the campaign before anything is scheduled, and the price is confirmed before anything is booked.",
    category: "Advertisers",
  },
  {
    question: "What types of vehicle screens are available?",
    answer:
      "The reference designs include bike-mounted screens, auto-rickshaw displays, car interior screens and helmet advertising. Real formats depend on verified inventory.",
    category: "Advertisers",
  },
  {
    question: "How is the pricing calculated?",
    answer:
      "Pricing depends on screen placement, location, quantity, dates, creative duration and delivery settings. The public calculator is an illustrative estimate, not a payable quote.",
    category: "Payments",
  },
  {
    question: "Which cities and areas are currently available?",
    answer:
      "BlinkMyAd is focusing on Prayagraj for its first launch. The locations page shows only locations published by the backend, not a promise of available screens. Availability is checked when you plan a campaign.",
    category: "General",
  },
  {
    question: "How can I become a driver partner?",
    answer:
      "Register to apply as a Prayagraj driver partner and enter your vehicle details. The partner agreement and document submission steps remain unavailable until the required approval process and secure storage are ready. A submitted application is not an approval.",
    category: "Drivers",
  },
  {
    question: "Are there installation or maintenance charges for drivers?",
    answer:
      "The approved design describes supported installation. Actual commercial terms and responsibilities must be confirmed in the driver agreement before enrolment.",
    category: "Drivers",
  },
  {
    question: "How and when do drivers receive payments?",
    answer:
      "Driver payouts depend on verified campaign delivery and the applicable partner agreement. The reference flow shows bank settlements and payout-history tracking.",
    category: "Payments",
  },
  {
    question: "What type of content is not allowed on screens?",
    answer:
      "Ad content must follow the platform creative rules and applicable laws. Prohibited or misleading content may be rejected during approval.",
    category: "Technical",
  },
  {
    question: "How can I contact support?",
    answer:
      "If you have an account, open a support ticket from your portal. Otherwise use the contact page: verified site integrations can send an enquiry directly, and the fallback prepares an email in your email app.",
    category: "General",
  },
  {
    question: "Can I change or pause a campaign?",
    answer:
      "You can edit a campaign while it is a draft. Once it has been submitted or approved, changes depend on its status and may need another review.",
    category: "Advertisers",
  },
  {
    question: "How do I prepare an ad creative?",
    answer:
      "Start from your chosen format's aspect ratio and size limits. After you upload, an admin checks the file against the format's specifications and the content rules before it can be used in a campaign.",
    category: "Technical",
  },
];
