import Link from 'next/link';
import { MdMail, MdMessage, MdChevronLeft, MdFavorite } from 'react-icons/md';
import { FiTwitter, FiGithub} from 'react-icons/fi';

const socialLinks = [
    { name: "Twitter", href: "https://x.com/justpankajk", icon: FiTwitter },
    { name: "GitHub", href: "https://github.com/bytescom", icon: FiGithub },
];


export default function ContactPage() {
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
                <nav className="mx-auto flex h-17.5 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Contact navigation">
                    <Link href="/" className="flex items-center gap-1" aria-label="Desento home">
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
                            <MdMessage className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact support</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-text-dark sm:text-5xl lg:text-6xl">
                            Talk to us about your workflow, a bug, or a feature idea.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-text/70 sm:text-lg">
                            We read every message and use it to improve the product, support users, and resolve issues quickly.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">

                        <aside className="rounded-xl border border-border bg-white/85 p-7 shadow-[0_24px_60px_-30px_rgba(79,70,229,0.12)] backdrop-blur-sm sm:p-8">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black tracking-tight text-text-dark">Direct contact</h2>
                                <p className="text-sm leading-7 text-text/70">
                                    If you prefer email, send us a note and we&apos;ll reply as soon as we can.
                                </p>
                            </div>
                            <div className="mt-6 space-y-4">
                                <a
                                    href="mailto:hello@pankajk.site"
                                    className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <div className="rounded-lg border border-primary/10 bg-white p-3 shadow-sm">
                                        <MdMail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/45">Support email</p>
                                        <p className="text-sm font-bold text-text-dark">hello@pankajk.site</p>
                                    </div>
                                </a>
                                <a
                                    href="https://x.com/justpankajk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <div className="rounded-lg border border-primary/10 bg-white p-3 shadow-sm">
                                        <FiTwitter className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/45">Follow on X</p>
                                        <p className="text-sm font-bold text-text-dark">@justpankajk</p>
                                    </div>
                                </a>
                            </div>
                        </aside>

                        <section className="rounded-xl border border-border bg-white/88 p-7 shadow-[0_24px_60px_-30px_rgba(79,70,229,0.12)] backdrop-blur-sm sm:p-8">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black tracking-tight text-text-dark">Send a message</h2>
                                <p className="text-sm leading-7 text-text/70">
                                    Use the form below for support requests, product feedback, or partnership ideas.
                                </p>
                            </div>

                            {/* {status === "sent" ? (
                                <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
                                    <span className="text-4xl">✓</span>
                                    <p className="font-bold text-text-dark">Message received</p>
                                    <p className="text-sm leading-7 text-text/70">We&apos;ll get back to you at your email shortly.</p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="cursor-pointer text-xs font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-4 transition-colors hover:text-primary-dark"
                                    >
                                        Send another
                                    </button>
                                </div>
                            ) : ( */}
                                <form className="mt-6 flex flex-col gap-4">
                                    <label className="space-y-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/45">Email</span>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="your@email.com"
                                            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-dark outline-none transition-all placeholder:text-text/35 focus:border-primary/30 focus:bg-white"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/45">Subject</span>
                                        <input
                                            name="subject"
                                            type="text"
                                            placeholder="Subject (optional)"
                                            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-dark outline-none transition-all placeholder:text-text/35 focus:border-primary/30 focus:bg-white"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/45">Message</span>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            placeholder="How can we help you?"
                                            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-dark outline-none transition-all placeholder:text-text/35 focus:border-primary/30 focus:bg-white"
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(79,70,229,0.4)] transition-all duration-200 hover:opacity-95 active:scale-[0.98] cursor-pointer"
                                    >
                                        Send Message
                                    </button>
                                </form>
                        </section>
                    </div>

                    <div className="flex justify-center">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                            <MdFavorite className="h-3.5 w-3.5 fill-secondary text-secondary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/65">Built for the modern worker</span>
                        </div>
                    </div>
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
