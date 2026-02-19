import OrderStatistics from "@/features/seller/ui/dashboard/OrderStatistics"
import SalesChart from "@/features/seller/ui/dashboard/SalesChart"
import TopProducts from "@/features/seller/ui/dashboard/TopProducts"

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Верхний ряд: Статистика */}
      <OrderStatistics />

      {/* Нижний ряд: График и Топ товаров */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* График занимает 2 колонки на больших экранах */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        
        {/* Топ товаров занимает 1 колонку */}
        <div className="lg:col-span-1">
          <TopProducts />
        </div>
      </div>
    </div>
  )
}

export default Dashboard