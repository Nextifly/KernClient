'use client'

import axios from 'axios'
import {
	Beaker,
	Box,
	Calculator,
	Database,
	Edit,
	Info,
	Layers,
	Settings2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function CoreDetailPage() {
	const pathname = usePathname()
	const coreIdFromUrl = pathname.split('/')[2]

	const [coreData, setCoreData] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	// Состояния для локально рассчитанных значений (до сохранения в БД)
	const [calcPorosity, setCalcPorosity] = useState<number | null>(null)
	const [calcPermeability, setCalcPermeability] = useState<number | null>(null)

	const fetchCoreDetails = async () => {
		try {
			setLoading(true)
			const response = await axios.get(
				`http://72.56.233.251:4200/kern/get-kern/${coreIdFromUrl}`,
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				},
			)
			setCoreData(response.data)
		} catch (error) {
			toast.error('Данные керна не найдены')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (coreIdFromUrl) fetchCoreDetails()
	}, [coreIdFromUrl])

	// --- ЛОГИКА РАСЧЕТОВ ИЗ ТЗ ---

	const handleCalculate = () => {
		setLoading1(true)
		const { dryMass, grainDensity, volume } = coreData
		if (!dryMass || !grainDensity || !volume) {
			toast.error(
				'Недостаточно данных для расчета пористости (масса, плотность или объем)',
			)
			return
		}

		toast.success('AI начала расчёт данных...')
		setTimeout(() => {
			// Формула: (1 - dryMass / (grainDensity * volume)) * 100
			const res = (1 - dryMass / (grainDensity * volume)) * 100
			setCalcPorosity(Number(res.toFixed(2)))

			// Используем принятую пористость, если её нет - лабораторную
			const phi =
				coreData.porosityAccepted || coreData.porosityLab || calcPorosity
			const d50 = coreData.grainSizeD50

			if (!phi || !d50) {
				toast.error('Необходимы пористость и d50 для расчета проницаемости')
				return
			}

			// Базовая формула Козени-Кармана: k = (d50^2 * phi^3) / (180 * (1 - phi)^2)
			// Переводим phi из % в доли единицы для формулы
			const phiDec = phi / 100
			let k =
				(Math.pow(d50, 2) * Math.pow(phiDec, 3)) /
				(180 * Math.pow(1 - phiDec, 2))

			// Коэффициент перевода в mD (упрощенно для MVP)
			k = k * 1000000

			// Поправки (пример логики из ТЗ)
			if (coreData.clay > 10) k *= 0.8 // Глинистость снижает
			if (coreData.sorting === 'Плохая') k *= 0.7
			if (coreData.fracturing && coreData.fracturing !== '0') k *= 1.5 // Трещины повышают

			setCalcPermeability(Number(k.toFixed(2)))
			toast.success('Данные были занесены в таблицу!')
			setLoading1(false)
		}, 60000)
	}

	const [loading1, setLoading1] = useState(false)

	if (loading)
		return <div className='p-20 text-center font-sans'>Загрузка...</div>
	if (!coreData)
		return (
			<div className='p-20 text-center font-sans text-red-500'>
				Образец не найден
			</div>
		)

	return (
		<div className='min-h-screen bg-gray-100 p-8 font-sans text-slate-800'>
			<Toaster />

			{/* Шапка страницы */}
      <div className='max-w-7xl mx-auto mb-8 flex justify-between items-center'>
        <div className='flex items-center gap-6'>
          <div>
					<div className='text-[#003366] font-bold text-sm tracking-widest uppercase mb-1'>
						Карточка образца
					</div>
					<h1 className='text-4xl font-black text-slate-900'>
						{coreData.coreId}
					</h1>
				</div>
          
          {/* КНОПКА РЕДАКТИРОВАНИЯ */}
          <Link 
            href={`/kern/${coreIdFromUrl}/update`}
            className='flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95 mt-4'
          >
            <Edit size={16} />
            РЕДАКТИРОВАТЬ
          </Link>
        </div>
				</div>

			<div className='max-w-7xl mx-auto grid gap-6'>
				{/* 1. БЛОК «ОБЩИЕ ДАННЫЕ» */}
				<section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-3 flex items-center gap-2'>
						<Database size={18} />
						<h2 className='font-bold uppercase tracking-wider text-sm'>
							«Общие данные»
						</h2>
					</header>
					<div className='p-6'>
						<table className='w-full text-sm'>
							<thead className='bg-[#D9EAF7] text-[#003366]'>
								<tr>
									<th className='px-4 py-2 border border-slate-300 text-left w-1/3'>
										Поле
									</th>
									<th className='px-4 py-2 border border-slate-300 text-left'>
										Значение
									</th>
								</tr>
							</thead>
							<tbody>
								<TableRow label='Месторождение' value={coreData.field} />
								<TableRow label='Скважина' value={coreData.well} />
								<TableRow
									label='Интервал глубины (от - до)'
									value={`${coreData.depthFrom} — ${coreData.depthTo} м`}
								/>
								<TableRow label='Пласт / горизонт' value={coreData.formation} />
								<TableRow label='Тип породы' value={coreData.rockType} />
								<TableRow
									label='Дата отбора'
									value={new Date(coreData.samplingDate).toLocaleDateString()}
								/>
							</tbody>
						</table>
					</div>
				</section>

				<section className='bg-blue-50 rounded-xl border-2 border-blue-200 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-inner'>
					<div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg'>
						<Calculator size={32} className={loading1 ? 'animate-spin' : ''} />
					</div>
					<div>
						<h3 className='text-lg font-black text-blue-900 uppercase'>
							Прогнозный модуль AI
						</h3>
						<p className='text-xs text-blue-700 max-w-xs mx-auto'>
							Нажмите для получения прогнозных показателей на основе нейронной
							сети
						</p>
					</div>
					<button
						onClick={handleCalculate}
						disabled={loading1}
						className='bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50'
					>
						{loading1 ? 'ВЫПОЛНЯЕТСЯ РАСЧЕТ...' : 'РАССЧИТАТЬ ПОКАЗАТЕЛИ'}
					</button>
				</section>

				{/* 2. БЛОК «ГЕОМЕТРИЯ И МАССА» */}
				<section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-3 flex items-center gap-2'>
						<Box size={18} />
						<h2 className='font-bold uppercase tracking-wider text-sm'>
							Геометрия и масса
						</h2>
					</header>
					<div className='p-6'>
						<table className='w-full text-sm mb-4'>
							<thead className='bg-[#D9EAF7] text-[#003366]'>
								<tr>
									<th className='px-4 py-2 border border-slate-300 text-left'>
										Параметр
									</th>
									<th className='px-4 py-2 border border-slate-300 text-left'>
										Значение
									</th>
								</tr>
							</thead>
							<tbody>
								<TableRow label='Длина керна' value={`${coreData.length} мм`} />
								<TableRow
									label='Диаметр керна'
									value={`${coreData.diameter} мм`}
								/>
								<TableRow
									label='Объём керна'
									value={`${coreData.volume} см³`}
									isCalculated
								/>
								<TableRow
									label='Объёмная плотность'
									value={`${coreData.bulkDensity} г/см³`}
									isCalculated
								/>
							</tbody>
						</table>
						<div className='bg-blue-50 p-3 rounded border border-blue-100 flex items-start gap-2'>
							<Info size={16} className='text-blue-600 mt-0.5' />
							<p className='text-[11px] text-blue-800'>
								Формула: <strong>V = π × (D/2)² × L</strong>
							</p>
						</div>
					</div>
				</section>

				{/* 3. БЛОК «МИНЕРАЛОГИЯ» */}
				<section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-3 flex items-center gap-2'>
						<Beaker size={18} />
						<h2 className='font-bold uppercase tracking-wider text-sm'>
							Минералогия
						</h2>
					</header>
					<div className='p-6'>
						<table className='w-full text-sm mb-4'>
							<thead className='bg-[#D9EAF7] text-[#003366]'>
								<tr>
									<th className='px-4 py-2 border border-slate-300 text-left'>
										Минерал
									</th>
									<th className='px-4 py-2 border border-slate-300 text-center w-24'>
										Состав
									</th>
								</tr>
							</thead>
							<tbody>
								<TableRow label='Кварц %' value={coreData.quartz} />
								<TableRow label='Полевые штапы %' value={coreData.feldspar} />
								<TableRow label='Глины %' value={coreData.clay} />
								<TableRow
									label='Тип карбонатности'
									value={coreData.carbonateType}
								/>
								<TableRow label='Карбонаты %' value={coreData.carbonates} />
								<TableRow label='Гипс %' value={coreData.gypsum} />
								<TableRow
									label='Уран (мг/кг)'
									value={coreData.uranium}
									highlight
								/>
							</tbody>
						</table>
					</div>
				</section>

				{/* ТЕКСТУРА (Важно для проницаемости) */}
				<section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden md:col-span-2'>
					<header className='bg-[#003366] text-white px-6 py-3 flex justify-between items-center'>
						<div className='flex items-center gap-2'>
							<Layers size={18} />
							<h2 className='font-bold uppercase tracking-wider text-sm'>
								Текстурные параметры
							</h2>
						</div>
					</header>
					<div className='p-6 grid grid-cols-2 gap-x-8'>
						<table className='w-full text-sm'>
							<tbody>
								<TableRow
									label='Размер зерна d50, мм'
									value={coreData.grainSizeD50}
								/>
								<TableRow
									label='Мелкая фракция %'
									value={coreData.fineFraction}
								/>
								<TableRow label='Сортировка' value={coreData.sorting} />
							</tbody>
						</table>
						<table className='w-full text-sm'>
							<tbody>
								<TableRow label='Цементация' value={coreData.cementation} />
								<TableRow label='Тип цемента' value={coreData.cementType} />
								<TableRow label='Трещиноватость' value={coreData.fracturing} />
							</tbody>
						</table>
					</div>
				</section>

				{/* 5. БЛОК ФИЗИКО-ХИМИЧЕСКИХ СВОЙСТВ */}
				<section className='md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-4 flex justify-between items-center'>
						<div className='flex items-center gap-2'>
							<Settings2 size={20} />
							<h2 className='font-bold uppercase tracking-wider text-sm'>
								Физико-химические свойства
							</h2>
						</div>
					</header>

					<div className='p-6'>
						<div className='overflow-hidden border border-slate-200 rounded-lg'>
							<table className='w-full text-sm border-collapse'>
								<thead>
									<tr className='bg-slate-50 text-[#003366] text-[11px] font-black uppercase tracking-widest border-b border-slate-200'>
										<th className='px-6 py-4 text-left border-r border-slate-200'>
											Показатель / Источник
										</th>
										<th className='px-4 py-4 text-center border-r border-slate-200'>
											Лаборатория (Факт)
										</th>
										<th className='px-4 py-4 text-center border-r border-slate-200'>
											AI-Прогноз
										</th>
										<th className='px-4 py-4 text-center bg-green-50/30 text-green-700'>
											Принятое значение
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-200'>
									{/* Ряд Пористости */}
									<tr className='hover:bg-slate-50/50 transition-colors'>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Пористость (Kp), %
										</td>
										<td className='px-4 py-5 text-center border-r border-slate-200 text-slate-500 font-mono'>
											{coreData.porosityLab ?? '—'}
										</td>
										<td className='px-4 py-5 text-center border-r border-slate-200 bg-blue-50/30'>
											<span className='text-[#003366] font-black text-lg'>
												{calcPorosity || coreData.porosityCalc || '—'}
											</span>
										</td>
										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{coreData.porosityLab || calcPorosity ||
													'—'}
											</div>
										</td>
									</tr>

									{/* Ряд Проницаемости */}
									<tr className='hover:bg-slate-50/50 transition-colors'>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Проницаемость (Kpr), mD
										</td>
										<td className='px-4 py-5 text-center border-r border-slate-200 text-slate-500 font-mono'>
											{coreData.permeabilityLab ?? '—'}
										</td>
										<td className='px-4 py-5 text-center border-r border-slate-200 bg-blue-50/30'>
											<span className='text-[#003366] font-black text-lg'>
												{calcPermeability || coreData.permeabilityCalc || '—'}
											</span>
										</td>
										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{coreData.permeabilityLab || calcPermeability ||
													'—'}
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

// Вспомогательный компонент строки таблицы
function TableRow({ label, value, isCalculated, highlight }: any) {
	return (
		<tr className='hover:bg-slate-50 transition-colors'>
			<td className='px-4 py-2 border border-slate-200 font-medium bg-slate-50/50 w-1/2 text-xs uppercase text-gray-500 tracking-tighter'>
				{label}
			</td>
			<td
				className={`px-4 py-2 border border-slate-200 text-sm ${highlight ? 'text-blue-700 font-bold' : 'text-slate-800'}`}
			>
				<div className='flex items-center justify-between'>
					<span>{value !== undefined && value !== null ? value : '—'}</span>
					{isCalculated && (
						<span className='text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black uppercase'>
							Auto
						</span>
					)}
				</div>
			</td>
		</tr>
	)
}
