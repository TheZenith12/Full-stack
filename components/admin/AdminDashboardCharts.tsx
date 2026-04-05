'use client';

import { useEffect, useRef } from 'react';

interface ChartData {
  bookingsByStatus: { label: string; value: number; color: string }[];
  revenueByMonth: { month: string; amount: number }[];
  placeTypes: { label: string; value: number; color: string }[];
}

interface AdminDashboardChartsProps {
  data: ChartData;
}

export default function AdminDashboardCharts({ data }: AdminDashboardChartsProps) {
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const typeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chartInstances: any[] = [];

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => {
      const Chart = (window as any).Chart;

      // Donut — Booking status
      if (donutRef.current) {
        const c1 = new Chart(donutRef.current, {
          type: 'doughnut',
          data: {
            labels: data.bookingsByStatus.map((d) => d.label),
            datasets: [{
              data: data.bookingsByStatus.map((d) => d.value),
              backgroundColor: data.bookingsByStatus.map((d) => d.color),
              borderWidth: 2,
              borderColor: '#fff',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: { legend: { display: false } },
          },
        });
        chartInstances.push(c1);
      }

      // Bar — Monthly revenue
      if (barRef.current) {
        const c2 = new Chart(barRef.current, {
          type: 'bar',
          data: {
            labels: data.revenueByMonth.map((d) => d.month),
            datasets: [{
              label: 'Орлого',
              data: data.revenueByMonth.map((d) => d.amount),
              backgroundColor: '#195538',
              borderRadius: 6,
              borderSkipped: false,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              y: {
                grid: { color: '#f0f7f2' },
                ticks: {
                  font: { size: 11 },
                  callback: (v: number) => '₮' + (v >= 1000000 ? Math.round(v / 1000000) + 'M' : v >= 1000 ? Math.round(v / 1000) + 'K' : v),
                },
              },
            },
          },
        });
        chartInstances.push(c2);
      }

      // Bar — Place types
      if (typeRef.current) {
        const c3 = new Chart(typeRef.current, {
          type: 'bar',
          data: {
            labels: data.placeTypes.map((d) => d.label),
            datasets: [{
              data: data.placeTypes.map((d) => d.value),
              backgroundColor: data.placeTypes.map((d) => d.color),
              borderRadius: 8,
              borderSkipped: false,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y' as const,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: '#f0f7f2' }, ticks: { font: { size: 11 } } },
              y: { grid: { display: false }, ticks: { font: { size: 12 } } },
            },
          },
        });
        chartInstances.push(c3);
      }
    };
    document.head.appendChild(script);

    return () => {
      chartInstances.forEach((c) => c.destroy());
    };
  }, [data]);

  const totalBookings = data.bookingsByStatus.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
      {/* Donut - booking status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-forest-900 text-sm mb-4">Захиалгын төлөв</h3>
        <div className="relative h-44">
          <canvas ref={donutRef} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-2xl font-semibold text-forest-900">{totalBookings}</span>
            <span className="text-xs text-forest-400">нийт</span>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {data.bookingsByStatus.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                <span className="text-forest-600">{d.label}</span>
              </div>
              <span className="font-medium text-forest-800">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar - monthly revenue */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
        <h3 className="font-semibold text-forest-900 text-sm mb-4">Сарын орлого</h3>
        <div className="h-52">
          <canvas ref={barRef} />
        </div>
      </div>

      {/* Horizontal bar - place types */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-3">
        <h3 className="font-semibold text-forest-900 text-sm mb-4">Газрын төрлөөр</h3>
        <div style={{ height: `${Math.max(80, data.placeTypes.length * 44 + 40)}px` }}>
          <canvas ref={typeRef} />
        </div>
      </div>
    </div>
  );
}
