import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserProfile } from "@clerk/nextjs";

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      pets: { where: { isActive: true } },
      _count: { select: { bookings: true, orders: true, events: true } },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-forest-400/60 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-5">
              <img src={clerkUser.imageUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h2 className="font-display text-lg font-semibold">{clerkUser.fullName}</h2>
                <p className="text-xs text-forest-400/60">{clerkUser.emailAddresses[0]?.emailAddress}</p>
                <span className="text-[10px] bg-forest-100 text-forest-500 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                  {user?.role ?? "PET_OWNER"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["Pets", user?._count ? user.pets.length : 0],
                ["Bookings", user?._count?.bookings ?? 0],
                ["Orders", user?._count?.orders ?? 0],
              ].map(([label, val]) => (
                <div key={label} className="bg-cream-100 rounded-xl p-3">
                  <div className="font-display text-xl font-bold text-forest-500">{val}</div>
                  <div className="text-[10px] text-forest-400/60 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
            <h3 className="font-display text-base font-semibold mb-3">Location</h3>
            <p className="text-sm text-forest-400/70">{user?.city ?? "Not set"}</p>
            <p className="text-xs text-forest-400/50 mt-1">{user?.address ?? "No address saved"}</p>
          </div>
        </div>

        {/* Clerk profile manager */}
        <div className="lg:col-span-2">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border border-forest-500/10 rounded-2xl",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
