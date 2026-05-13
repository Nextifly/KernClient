'use client'

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation'
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link'

export default function CoreDatabasePage() {
  const router = useRouter()
  
  // Состояние для хранения списка кернов
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Функция запроса данных
  const fetchKerns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4200/kern/get-kern-all', {
        headers: {
          // Если ваш сервер требует авторизацию, добавляем токен
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Предполагаем, что сервер возвращает массив объектов
      // Если структура полей в БД отличается от имен в таблице, 
      // здесь можно сделать маппинг (переименование полей)
      setTableData(response.data); 
    } catch (error) {
      console.error("Ошибка при загрузке кернов:", error);
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  // 2. Инициализация данных при загрузке страницы
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    } else {
      fetchKerns();
    }
  }, []);

  const handleClick = (id: string) => {
    router.push('/kern/' + id);
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Toaster />
      <main className="flex-1 p-8 overflow-x-hidden">
        
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Цифровой керн</h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed">
              База образцов керна, их минералогии, текстурных параметров, пористости и проницаемости.
            </p>
          </div>
          
          <Link href={"/kern/create-kern"} className="flex items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded shadow-md transition-all active:scale-95 whitespace-nowrap">
            <Plus size={20} />
            <span className="font-semibold text-sm uppercase tracking-wider">Добавить Керн</span>
          </Link>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D9EAF7] text-[#003366] text-[11px] font-bold uppercase tracking-wider border-b border-gray-300">
                  <th className="p-4 border-r border-gray-300/50">ID керна</th>
                  <th className="p-4 border-r border-gray-300/50">Месторождение</th>
                  <th className="p-4 border-r border-gray-300/50">Скважина</th>
                  <th className="p-4 border-r border-gray-300/50">Глубина, м</th>
                  <th className="p-4 border-r border-gray-300/50">Пласт</th>
                  <th className="p-4 border-r border-gray-300/50">Тип породы</th>
                  <th className="p-4 border-r border-gray-300/50">U, мг/кг</th>
                  <th className="p-4 border-r border-gray-300/50">Глины, %</th>
                  <th className="p-4 border-r border-gray-300/50">Карбонаты, %</th>
                  <th className="p-4 border-r border-gray-300/50">Пористость, %</th>
                  <th className="p-4">Проницаемость, mD</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="p-10 text-center text-gray-400">Загрузка данных...</td>
                  </tr>
                ) : tableData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-10 text-center text-gray-400">Данные не найдены</td>
                  </tr>
                ) : (
                  tableData.map((row) => (
                    <tr 
                      key={row.coreId} 
                      className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer" 
                      onClick={() => handleClick(row.coreId)}
                    >
                      <td className="p-4 font-medium border-r border-gray-100 text-[#003366]">{row.coreId}</td>
                      <td className="p-4 border-r border-gray-100">{row.field}</td>
                      <td className="p-4 border-r border-gray-100">{row.well}</td>
                      <td className="p-4 border-r border-gray-100 font-mono">{row.depth}</td>
                      <td className="p-4 border-r border-gray-100">{row.formation}</td>
                      <td className="p-4 border-r border-gray-100">{row.rockType}</td>
                      <td className="p-4 border-r border-gray-100">{row.uranium}</td>
                      <td className="p-4 border-r border-gray-100">{row.clay}</td>
                      <td className="p-4 border-r border-gray-100">{row.carbonates}</td>
                      <td className="p-4 border-r border-gray-100">{row.porosityLab || '-'}</td>
                      <td className="p-4">{row.permeabilityLab || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}