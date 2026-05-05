import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Stethoscope, Scissors, Home, Heart, CalendarDays, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";

const services = [
  { icon: Stethoscope, title: "Vet Clinics", desc: "Book appointments with 42+ certified veterinarians. Schedule, reschedule or cancel with SMS reminders.", tag: "42 Clinics", href: "/bookings?type=vet", colorClass: "bg-green-50 text-green-700" },
  { icon: Scissors, title: "Pet Grooming", desc: "Professional groomers at your doorstep or at partner centers. Home service available.", tag: "Home Service", href: "/bookings?type=grooming", colorClass: "bg-amber-50 text-amber-700" },
  { icon: Home, title: "Pet Daycare", desc: "Trusted daycare centers with live updates. Book timeslots and pay securely via Stripe.", tag: "Secure Payments", href: "/bookings?type=daycare", colorClass: "bg-sky-50 text-sky-700" },
  { icon: Heart, title: "Pet Adoption", desc: "Find pets needing a forever home, or post your pet for temporary or permanent adoption.", tag: "Find a Friend", href: "/adoption", colorClass: "bg-red-50 text-red-700" },
  { icon: CalendarDays, title: "Community Events", desc: "Pet meetups, vaccination camps, and training workshops near you. Create or join events.", tag: "Near You", href: "/events", colorClass: "bg-purple-50 text-purple-700" },
  { icon: AlertCircle, title: "Rescue Service", desc: "Report injured or stray animals. Our rescue network responds 24/7 across major cities.", tag: "24/7 Available", href: "/rescue", colorClass: "bg-orange-50 text-orange-700" },
];

const stats = [
  { value: "12K+", label: "Registered Pet Owners" },
  { value: "340+", label: "Service Providers" },
  { value: "2.1K", label: "Successful Adoptions" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-black/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-[#2D5016]">
            <div className="w-9 h-9 bg-[#2D5016] rounded-xl flex items-center justify-center text-white text-lg">🐾</div>
            CareCompass
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[["Services", "/services"], ["Adoption", "/adoption"], ["Events", "/events"], ["Shop", "/shop"], ["Rescue", "/rescue"]].map(([label, href]) => (
              <Link key={label} href={href}
                className="px-4 py-2 rounded-full text-sm text-[#4A5240] hover:bg-[#2D5016] hover:text-white transition-all">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in" className="px-4 py-2 rounded-full text-sm border border-black/10 text-[#4A5240] hover:border-[#2D5016] transition-all">Sign In</Link>
              <Link href="/sign-up" className="px-4 py-2 rounded-full text-sm bg-[#2D5016] text-white hover:bg-[#4A7C28] transition-all">Get Started</Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="px-4 py-2 rounded-full text-sm bg-[#2D5016] text-white hover:bg-[#4A7C28] transition-all">Dashboard</Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C8DFB0] text-[#2D5016] text-xs font-medium uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
              🐾 Bangladesh&apos;s Pet Platform
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-5">
              Care for your pets,{" "}
              <span className="text-[#4A7C28] italic">smarter</span>{" "}
              than ever before
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Pet CareCompass connects pet owners with vets, daycares, shops, and rescue organizations — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <SignedOut>
                <Link href="/sign-up" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#2D5016] text-white rounded-full font-medium hover:bg-[#4A7C28] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#2D5016] text-white rounded-full font-medium hover:bg-[#4A7C28] transition-all hover:-translate-y-0.5">
                  Open Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>
              <Link href="/adoption" className="px-7 py-3.5 border-2 border-[#2D5016] text-[#2D5016] rounded-full font-medium hover:bg-[#C8DFB0] transition-all">
                Adopt a Pet
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="absolute -top-4 right-6 bg-white border border-black/[0.08] rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm z-10">
              <span className="w-2 h-2 rounded-full bg-[#4A7C28] animate-pulse" />
              <span className="text-gray-600">3 vets available now</span>
            </div>
            <div className="bg-white rounded-3xl border border-black/[0.08] p-7 shadow-xl">
              <div className="flex gap-3 mb-5">
                {[["🐕", "bg-[#C8DFB0]"], ["🐈", "bg-[#FDF0D5]"], ["🐇", "bg-[#F9EDE8]"]].map(([emoji, bg]) => (
                  <div key={emoji} className={`w-14 h-14 rounded-full ${bg} border-2 border-white shadow-md flex items-center justify-center text-2xl`}>
                    {emoji}
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-black/15 flex items-center justify-center text-gray-400 text-xl cursor-pointer hover:bg-gray-50 transition-colors">+</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["42", "Vets Online"], ["128", "Daycares"], ["89", "Pets Saved"]].map(([num, label]) => (
                  <div key={label} className="bg-[#FAF7F2] rounded-2xl p-4 text-center">
                    <div className="font-display text-3xl font-bold text-[#2D5016]">{num}</div>
                    <div className="text-xs text-gray-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 left-6 bg-white border border-black/[0.08] rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-[#E8A030]" />
              <span className="text-gray-600">Appointment confirmed ✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#2D5016] py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/15">
          {stats.map((s, i) => (
            <div key={i} className="text-center py-4 px-6">
              <div className="font-display text-4xl font-bold text-[#C8DFB0]">{s.value}</div>
              <div className="text-sm text-white/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-[#4A7C28] mb-3">Everything in one place</p>
          <h2 className="font-display text-4xl font-bold">All the services your <span className="text-[#4A7C28] italic">pet deserves</span></h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <Link key={s.title} href={s.href}
              className="group bg-white rounded-2xl border border-black/[0.06] p-7 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 hover:border-[#C8DFB0] transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2D5016] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${s.colorClass}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{s.desc}</p>
              <span className="inline-block text-xs font-medium bg-[#C8DFB0] text-[#2D5016] px-3 py-1 rounded-full">{s.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop CTA banner */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-[#2D5016] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#C8DFB0] text-sm font-medium mb-2">🛒 Pet Shop</p>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Food, toys & accessories</h2>
            <p className="text-white/60 text-sm">500+ products delivered to your door. Pay securely with Stripe.</p>
          </div>
          <Link href="/shop" className="flex-shrink-0 inline-flex items-center gap-2 bg-[#C8DFB0] text-[#2D5016] px-8 py-4 rounded-full font-semibold hover:bg-white transition-all">
            <ShoppingBag className="w-5 h-5" /> Shop Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-xl text-white mb-3">🐾 CareCompass</div>
            <p className="text-sm text-white/40 leading-relaxed">Bangladesh&apos;s most comprehensive pet care platform.</p>
          </div>
          {[
            { title: "Services", links: ["Vet Clinics", "Pet Grooming", "Daycare", "Pet Shop"] },
            { title: "Community", links: ["Events", "Adoption", "Rescue", "Blog"] },
            { title: "Support", links: ["Help Center", "Contact Us", "Privacy Policy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium uppercase tracking-widest text-white/50 mb-4">{col.title}</h4>
              {col.links.map((l) => (
                <a key={l} href="#" className="block text-sm text-white/30 hover:text-[#C8DFB0] transition-colors mb-2">{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex justify-between items-center">
          <p className="text-xs text-white/25">© 2025 Pet CareCompass. Built for pet lovers in Bangladesh.</p>
          <p className="text-white/25">🐕 🐈 🐇 🦜 🐠</p>
        </div>
      </footer>
    </div>
  );
}
