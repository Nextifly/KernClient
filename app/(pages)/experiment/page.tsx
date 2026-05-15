'use client'

import axios from 'axios'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function ExperimentsDatabasePage() {
	const router = useRouter()
	const [tableData, setTableData] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const fetchExperiments = async () => {
		try {
			setLoading(true)
			const response = await axios.get(
				'http://72.56.233.251:4200/experiment/get-experiment-all',
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				},
			)
			setTableData(response.data)
		} catch (error) {
			toast.error('Не удалось загрузить список экспериментов')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchExperiments()
	}, [])

	return (
		<div className='flex min-h-screen bg-gray-100 font-sans'>
			<Toaster />
			<main className='flex-1 p-8 overflow-x-hidden'>
				{/* Заголовок в стиле Цифрового Керна */}
				<div className='flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4'>
					<div>
						<h1 className='text-3xl font-bold text-gray-800 mb-2 uppercase tracking-tight'>
							Цифровые эксперименты
						</h1>
						<p className='text-gray-500 max-w-2xl leading-relaxed text-sm'>
							Моделирование процессов выщелачивания, виртуальные сценарии и
							верификация лабораторных данных.
						</p>
					</div>

					<Link
						href={'/experiment/create'}
						className='flex items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded shadow-md transition-all active:scale-95 whitespace-nowrap'
					>
						<Plus size={20} />
						<span className='font-semibold text-sm uppercase tracking-wider'>
							Новый эксперимент
						</span>
					</Link>
				</div>

				{/* Таблица */}
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full text-left border-collapse'>
							<thead>
								<tr className='bg-[#D9EAF7] text-[#003366] text-[11px] font-bold uppercase tracking-wider border-b border-gray-300'>
									<th className='p-4 border-r border-gray-300/50'>ID</th>
									<th className='p-4 border-r border-gray-300/50'>Дата</th>
									<th className='p-4 border-r border-gray-300/50'>
										Тип сценария
									</th>
									<th className='p-4 border-r border-gray-300/50'>ID Керна</th>
									<th className='p-4 border-r border-gray-300/50'>
										Кислота, г/л
									</th>
									<th className='p-4 border-r border-gray-300/50'>ПАВ</th>
									<th className='p-4'>Статус</th>
								</tr>
							</thead>
							<tbody className='text-sm text-gray-700'>
								{loading ? (
									<tr>
										<td colSpan={8} className='p-10 text-center text-gray-400'>
											Загрузка...
										</td>
									</tr>
								) : (
									tableData.map(row => (
										<tr
											key={row.id}
											className='border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer'
											onClick={() =>
												router.push('/experiment/' + row.experimentId)
											}
										>
											<td className='p-4 font-bold text-[#003366] border-r border-gray-100'>
												{row.experimentId}
											</td>
											<td className='p-4 border-r border-gray-100 font-mono text-xs'>
												{new Date(row.experimentDate).toLocaleDateString()}
											</td>
											<td className='p-4 border-r border-gray-100'>
												<span
													className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
														row.experimentType === 'virtual'
															? 'bg-purple-100 text-purple-700'
															: 'bg-amber-100 text-amber-700'
													}`}
												>
													{row.experimentType === 'virtual'
														? 'Виртуальный'
														: 'Лабораторный'}
												</span>
											</td>
											<td className='p-4 border-r border-gray-100 font-medium'>
												{row.coreId}
											</td>
											<td className='p-4 border-r border-gray-100 text-center'>
												{row.acidConcentrationGL}
											</td>
											<td className='p-4 border-r border-gray-100 text-center'>
												{row.hasSurfactant ? 'Да' : 'Нет'}
											</td>
											<td className='p-4'>
												<span className='text-[10px] font-bold uppercase text-green-600'>
													Валидирован
												</span>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	)
}
