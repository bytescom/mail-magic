import Link from 'next/link';
import { MdChevronLeft, MdLock } from 'react-icons/md';
import { FiTwitter, FiGithub, } from "react-icons/fi";

const updatedAt = 'March 20, 2026';

const socialLinks = [
    { name: "Twitter", href: "https://x.com/justpankajk", icon: FiTwitter },
    { name: "GitHub", href: "https://github.com/bytescom", icon: FiGithub },
];

export default function PrivacyPage() {
    const currentYear = new Date().getFullYear();
    
    return (
        <section className="relative min-h-screen overflow-hidden bg-background text-text-dark animate-page-transition">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at top, rgba(79, 70, 229, 0.08), transparent 38%), linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
                }}
            />
            <div
                className="absolute inset-x-0 top-0 h-120 z-0 opacity-30"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(148, 163, 184, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 72%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 72%)',
                }}
            />

            <header className="relative z-10 border-b border-border/60 bg-white/75 backdrop-blur-md">
                <nav className="mx-auto flex h-17.5 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Privacy navigation">
                    <Link href="/" className="flex items-center gap-2" aria-label="Desento home">
                        <img src="/icon.svg" alt="Desento Logo" className="w-6 h-6" />
                        <span className="text-xl font-black tracking-tight text-text-dark hover:text-primary">
                            Desento<span className="text-secondary">.</span>
                        </span>
                    </Link>
                    <Link href="/" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text/60 transition-colors hover:text-primary">
                        <MdChevronLeft className="h-3 w-3" />
                        Back to Home
                    </Link>
                </nav>
            </header>

            <main className="relative z-10">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8 sm:py-16 lg:py-20">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
                            <MdLock className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Privacy policy</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-text-dark sm:text-5xl lg:text-6xl">
                            Your data, handled with the same care as the product.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-text/70 sm:text-lg">
                            This page explains what we collect, why we collect it, and how we protect it when you use Desento.
                        </p>
                        <p className="text-sm font-medium text-text/55">
                            Last updated: {updatedAt}
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <article className="rounded-xl border border-border bg-white/85 p-7 shadow-[0_24px_60px_-30px_rgba(79,70,229,0.12)] backdrop-blur-sm sm:p-8">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black tracking-tight text-text-dark">What we collect</h2>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-text/70">
                                Desento only collects the information required to create applications, send messages, and keep your workflow organized.
                            </p>
                            <ul className="mt-5 space-y-3">
                                {[
                                    'Account details such as your email address and authentication data.',
                                    'Content you provide for applications, outreach, and follow-ups.',
                                    'Email delivery metadata and usage logs needed to keep the app working.',
                                ].map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-6 text-text/70">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        <article className="rounded-xl border border-border bg-linear-to-br from-white via-surface to-surface p-7 shadow-[0_24px_60px_-30px_rgba(79,70,229,0.10)] sm:p-8">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black tracking-tight text-text-dark">How we use it</h2>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-text/70">
                                We use your data only to deliver the automation features you request, improve reliability, and respond to support requests.
                            </p>
                            <div className="mt-5 space-y-4 rounded-lg border border-border bg-white/80 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-text/45">Examples</p>
                                <ul className="space-y-3">
                                    {[
                                        'Generating and sending personalized job application emails.',
                                        'Tracking sent activity so you can review recent actions.',
                                        'Helping us debug failures and protect against abuse.',
                                    ].map((item) => (
                                        <li key={item} className="flex gap-3 text-sm leading-6 text-text/70">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/60" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    </div>

                    <article className="rounded-xl border border-border bg-white/85 p-7 shadow-[0_24px_60px_-30px_rgba(79,70,229,0.10)] backdrop-blur-sm sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
                                <MdLock className="h-4 w-4 text-primary-dark" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-text-dark">Security and retention</h2>
                        </div>
                        <div className="mt-4 grid gap-5 md:grid-cols-3">
                            {[
                                {
                                    title: 'Transport',
                                    text: 'Requests are transmitted over secure HTTPS connections.',
                                },
                                {
                                    title: 'Storage',
                                    text: 'We keep only the data needed to operate the service and support your account.',
                                },
                                {
                                    title: 'Control',
                                    text: 'You can contact us to request access, corrections, or deletion of your data.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="rounded-lg border border-border bg-surface/80 p-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-text/45">{item.title}</p>
                                    <p className="mt-3 text-sm leading-7 text-text/70">{item.text}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-sm leading-7 text-text/70">
                            Questions about privacy or security can be sent to{' '}
                            <Link href="mailto:hello@pankajk.site" className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-dark">
                                hello@pankajk.site
                            </Link>
                            .
                        </p>
                    </article>
                </div>
            </main>

            <footer className="w-full bg-surface text-text-dark relative overflow-hidden px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm border-t border-border py-10">
                    <p className="text-text/70 font-medium">
                        &copy; {currentYear} Desento by{" "}
                        <Link
                            href="https://x.com/justpankajk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors font-bold"
                        >
                            justpankajk
                        </Link>
                    </p>

                    <div className="flex flex-wrap items-center gap-6">
                        {socialLinks.map((social) => (
                            <Link
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-text-dark transition-all duration-300 hover:scale-110"
                                aria-label={social.name}
                            >
                                <social.icon className="w-4 h-4" />
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </section>
    );
}
