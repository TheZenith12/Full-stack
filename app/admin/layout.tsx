import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <div className="min-h-screen bg-forest-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg mb-4">Нэвтрэх шаардлагатай</p>
            <a
              href="/auth/login"
              className="px-6 py-3 bg-forest-600 text-white rounded-xl"
            >
              Нэвтрэх
            </a>
          </div>
        </div>
      );
    }

    const { data: profile } = (await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()) as any;

    if (
      !profile ||
      !["super_admin", "manager"].includes((profile as any)?.role ?? "")
    ) {
      return (
        <div className="min-h-screen bg-forest-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg mb-2">❌ Эрх байхгүй байна</p>
            <p className="text-forest-400 text-sm mb-4">
              Role: {profile?.role ?? "байхгүй"}
            </p>
            <a
              href="/"
              className="px-6 py-3 bg-forest-600 text-white rounded-xl"
            >
              Нүүр хуудас
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen bg-forest-950">
        <AdminSidebar profile={profile as any} />
        <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen bg-forest-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Серверийн алдаа</p>
          <a
            href="/auth/login"
            className="px-6 py-3 bg-forest-600 text-white rounded-xl"
          >
            Нэвтрэх
          </a>
        </div>
      </div>
    );
  }
}
