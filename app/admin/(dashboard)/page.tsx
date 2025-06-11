import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Briefcase, Users, Layers, MapPin, CheckCircle, XCircle, Clock } from "lucide-react"
import { getDashboardStats } from "./actions" // Import the new action

export const dynamic = "force-dynamic" // Ensure fresh data on each load

export default async function AdminDashboardPage() {
  const { data: statsData, error } = await getDashboardStats()

  if (error || !statsData) {
    return <div className="text-red-500 p-4">خطأ في تحميل إحصائيات لوحة التحكم: {error || "البيانات غير متوفرة."}</div>
  }

  const stats = [
    {
      title: "طلبات مزودي الخدمة المعلقة",
      value: statsData.pendingCount.toString(),
      icon: Clock,
      color: "text-yellow-500",
      href: "/admin/service-providers?status=pending",
    },
    {
      title: "طلبات مزودي الخدمة المقبولة",
      value: statsData.approvedCount.toString(),
      icon: CheckCircle,
      color: "text-green-500",
      href: "/admin/service-providers?status=approved",
    },
    {
      title: "طلبات مزودي الخدمة المرفوضة",
      value: statsData.rejectedCount.toString(),
      icon: XCircle,
      color: "text-red-500",
      href: "/admin/service-providers?status=rejected",
    },
    {
      title: "إجمالي مزودي الخدمة",
      value: statsData.totalServiceProvidersCount.toString(),
      icon: Briefcase,
      color: "text-blue-500",
      href: "/admin/service-providers",
    },
    {
      title: "إجمالي المستخدمين",
      value: statsData.totalUsersCount.toString(),
      icon: Users,
      color: "text-indigo-500",
      href: "/admin/users",
    },
    {
      title: "فئات الخدمات النشطة",
      value: statsData.totalCategoriesCount.toString(),
      icon: Layers,
      color: "text-pink-500",
      href: "/admin/service-categories",
    },
    {
      title: "المحافظات النشطة",
      value: statsData.totalGovernoratesCount.toString(),
      icon: MapPin,
      color: "text-purple-500",
      href: "/admin/governorates",
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">لوحة التحكم الرئيسية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <a href={stat.href} key={stat.title} className="block hover:shadow-lg transition-shadow rounded-lg">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
      {/* Add more dashboard widgets here */}
    </div>
  )
}
