import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Try it out, no card required",
    features: [
      "3 leads per day",
      "1 ICP profile",
      "Daily email digest",
      "Lead scoring",
      "Basic deduplication",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 49,
    description: "For solo founders & small teams",
    features: [
      "10 leads per day",
      "1 ICP profile",
      "Daily email digest",
      "Lead scoring & deduplication",
      "Feedback loop to improve results",
      "Lead history & export",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: 99,
    description: "For growing sales teams",
    features: [
      "25 leads per day",
      "3 ICP profiles",
      "Daily email digest",
      "Lead scoring & deduplication",
      "Feedback loop to improve results",
      "Lead history & export",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
];

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Leadsdaily</span>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Sign in
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 dark:border-zinc-700">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="h-4 w-px bg-zinc-600" />
          <span className="font-medium tracking-wide text-zinc-100">Powered by Exa</span>
        </div>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          Wake up to qualified leads
          <br />
          <span className="text-zinc-400">every morning</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
          Describe your ideal customer. Our AI searches the web daily using Exa to find companies that match — then delivers the top leads straight to your inbox.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Start for free
          </Link>
          <a href="#how-it-works" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400">
            See how it works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-100 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">How it works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Describe your ideal customer", desc: "Tell us who you sell to — industry, size, location, signals. Plain English, no forms." },
              { step: "2", title: "AI searches the web daily", desc: "We use Exa semantic search + Claude AI to find and score companies matching your profile." },
              { step: "3", title: "Leads hit your inbox", desc: "Every morning, your top leads arrive in your email. Mark them good or bad to improve results." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-50 dark:text-zinc-900">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Video explainer */}
          <div className="mt-16 flex flex-col items-center">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-lg dark:border-zinc-700">
              <div className="relative aspect-video w-full">
                {/* Replace the placeholder below with your video embed */}
                {/* <iframe src="YOUR_VIDEO_URL" className="h-full w-full" allow="autoplay; fullscreen" allowFullScreen /> */}
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-400">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">See Leadsdaily in action</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-400">60-second explainer — how your leads get found, scored, and delivered</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">Simple pricing</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-zinc-500 dark:text-zinc-400">
            Start free, upgrade when you need more leads. No contracts, cancel anytime.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-zinc-900 bg-white shadow-lg dark:border-zinc-50 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">
                    Most popular
                  </span>
                )}
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{plan.name}</p>
                <p className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-lg font-normal text-zinc-400">/mo</span>}
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.description}</p>

                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signin"
                  className={`mt-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 dark:border-zinc-800">
        <p className="text-center text-sm text-zinc-400">Leadsdaily — AI-powered lead discovery</p>
      </footer>
    </div>
  );
}
