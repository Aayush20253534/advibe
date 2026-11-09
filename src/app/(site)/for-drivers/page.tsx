import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Headphones,
  Info,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";
import { DriverVehicleTabs } from "@/components/public/driver-vehicle-tabs";
import { publicMetadata } from "@/config/public-metadata";
import "./for-drivers.css";

export const metadata = publicMetadata(
  "/for-drivers",
  "Become a BlinkMyAd Driver Partner | Drive & Earn in Prayagraj",
  "Find out how the BlinkMyAd driver partnership works: eligible vehicles, verification, installation, earnings terms and applying in Prayagraj.",
);

const benefits = [
  {
    icon: Wallet,
    title: "Earn on routes you already drive",
    text: "Approved campaigns can run while you work as usual, using the routes you already travel.",
  },
  {
    icon: CarFront,
    title: "Installation is arranged for you",
    text: "After approval and subject to availability, hardware can be installed and linked to your account.",
  },
  {
    icon: Clock3,
    title: "Earnings you can check",
    text: "View recorded earning entries and payout status through the partner portal when enabled.",
  },
  {
    icon: Wrench,
    title: "Help when the screen has a problem",
    text: "Report screen faults and follow support or maintenance cases through the partner team.",
  },
];

const applicationSteps = [
  {
    icon: UserRound,
    title: "Create your account",
    text: "Register as a driver partner and verify your email.",
  },
  {
    icon: FileText,
    title: "Apply and submit documents",
    text: "Provide vehicle details and verification documents when secure uploads are available.",
  },
  {
    icon: CarFront,
    title: "Get the screen installed",
    text: "If approved and hardware is available, arrange a supervised installation.",
  },
  {
    icon: BarChart3,
    title: "Start receiving ad assignments",
    text: "Once activated, eligible campaigns and recorded earnings appear in your portal.",
  },
];

const requirements = [
  "Valid driving licence",
  "Vehicle registration certificate (RC)",
  "Vehicle insurance and PUC certificate",
  "An eligible vehicle in good condition",
  "Bank account for payouts",
  "Signed partner agreement",
];

const questions = [
  {
    question: "How can I become a driver partner?",
    answer:
      "Create a driver-partner account and verify your email. Vehicle details and secure document submission will be available as the onboarding programme opens. Applications are reviewed, and registration alone does not mean approval.",
  },
  {
    question: "Are there installation or maintenance charges for drivers?",
    answer:
      "Installation arrangements, maintenance responsibilities and any associated charges are confirmed in your partner agreement before the placement is activated.",
  },
  {
    question: "How are earnings calculated and when are payouts made?",
    answer:
      "Earnings depend on eligible, verified campaign activity, your vehicle, assigned routes, screen availability and agreed rates. Payout timing and terms are provided in your agreement. No fixed monthly earning amount is guaranteed.",
  },
  {
    question: "What should I do if the screen has a problem?",
    answer:
      "Report the problem through the available partner support channel. Do not attempt to repair the screen yourself. The support team will explain the next steps and record any maintenance action.",
  },
  {
    question: "Can I pause or leave the program later?",
    answer:
      "Pauses, withdrawal, hardware return and final settlement are governed by the partner agreement. Review those terms before joining.",
  },
];

const trust = [
  {
    icon: ShieldCheck,
    title: "Reviewed before activation",
    text: "Partner and vehicle details are checked before an eligible placement is activated.",
  },
  {
    icon: BarChart3,
    title: "Transparent earnings records",
    text: "See recorded activity and payouts in your partner portal when these features are enabled.",
  },
  {
    icon: Headphones,
    title: "Support when maintenance is needed",
    text: "Raise a support issue and receive guidance until the case is resolved.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy for your documents",
    text: "Personal and vehicle information is handled securely for approved programme purposes.",
  },
];

export default function ForDriversPage() {
  return (
    <div className="bma-drivers">
      <section className="bma-driver-hero" aria-labelledby="driver-title">
        <div className="bma-driver-hero-art">
          <Image
            src="/images/blinkmyad/ad-formats/auto-rear.webp"
            alt="Illustration of a BlinkMyAd-enabled auto-rickshaw carrying a rear digital advertising screen"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 62vw"
          />
        </div>
        <div className="bma-driver-shell bma-driver-hero-inner">
          <div className="bma-driver-hero-copy">
            <span className="bma-driver-eyebrow"><i aria-hidden="true" /> For driver partners</span>
            <h1 id="driver-title">Drive your routes.<br />Earn with <span>BlinkMyAd.</span></h1>
            <p>Apply to carry approved advertising screens on your vehicle during regular Prayagraj routes. Installation and earning eligibility depend on verification, approved hardware and the partner agreement.</p>
            <div className="bma-driver-hero-actions">
              <Link href="/signup?role=driver" className="bma-driver-button bma-driver-button-primary">
                Apply as a driver partner <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link href="#driver-requirements" className="bma-driver-button bma-driver-button-outline">
                See what you need
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bma-driver-section bma-driver-benefits" aria-labelledby="driver-benefits-title">
        <div className="bma-driver-shell">
          <h2 id="driver-benefits-title">What partnering with BlinkMyAd means</h2>
          <div className="bma-driver-benefit-grid">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article className="bma-driver-benefit-card" key={title}>
                <div className="bma-driver-icon-box"><Icon aria-hidden="true" /></div>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bma-driver-vehicle-section" aria-labelledby="driver-vehicles-title">
        <div className="bma-driver-shell">
          <div className="bma-driver-heading">
            <h2 id="driver-vehicles-title">Vehicles we work with</h2>
            <p>Choose your vehicle to see where the screen goes and how it works.</p>
          </div>
          <DriverVehicleTabs />
        </div>
      </section>

      <section className="bma-driver-section bma-driver-process" aria-labelledby="driver-process-title">
        <div className="bma-driver-shell">
          <div className="bma-driver-heading">
            <h2 id="driver-process-title">From application to your first assignment</h2>
            <p>A simple, guided process to get you on the go.</p>
          </div>
          <ol className="bma-driver-process-grid">
            {applicationSteps.map(({ icon: Icon, title, text }, index) => (
              <li className="bma-driver-process-card" key={title}>
                <span className="bma-driver-step-number">{index + 1}</span>
                <Icon className="bma-driver-step-icon" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bma-driver-section bma-driver-practical" id="driver-requirements" aria-label="Driver requirements and common questions">
        <div className="bma-driver-shell bma-driver-practical-grid">
          <div className="bma-driver-requirements">
            <h2 id="driver-requirements-title">What you need to apply</h2>
            <ul>
              {requirements.map(item => (
                <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
            <p className="bma-driver-requirements-note"><Info aria-hidden="true" /> Requirements may change with the final partner agreement and local regulations.</p>
          </div>
          <div className="bma-driver-questions">
            <div className="bma-driver-faq-heading">
              <h2 id="driver-questions-title">Questions drivers ask</h2>
              <Link href="/help-center">See all questions <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <div className="bma-driver-faq-list">
              {questions.map(({ question, answer }, index) => (
                <details key={question} open={index === 0}>
                  <summary><span>{question}</span><ChevronDown aria-hidden="true" /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bma-driver-section bma-driver-trust" aria-labelledby="driver-trust-title">
        <div className="bma-driver-shell">
          <h2 id="driver-trust-title">Why drivers feel safe with BlinkMyAd</h2>
          <div className="bma-driver-trust-grid">
            {trust.map(({ icon: Icon, title, text }) => (
              <article className="bma-driver-trust-card" key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bma-driver-closing" aria-labelledby="driver-closing-title">
        <div className="bma-driver-closing-copy">
          <h2 id="driver-closing-title">Apply in a few minutes</h2>
          <p>Create your driver-partner account to get started. Verification and vehicle onboarding follow as the programme becomes available in Prayagraj.</p>
        </div>
        <Link href="/signup?role=driver" className="bma-driver-closing-button">
          Apply as a driver partner <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
