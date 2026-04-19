export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 bg-forest-500 rounded-xl flex items-center justify-center text-xl">🐾</div>
            <span className="font-display font-bold text-2xl text-forest-500">CareCompass</span>
          </div>
          <p className="text-sm text-forest-400/60">Bangladesh&apos;s complete pet care platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
