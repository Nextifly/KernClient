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
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { calculateExperiment, CalculationResult } from './calculator'
import Link from 'next/link'


export default function CoreDetailPage() {
	const pathname = usePathname()
	const coreIdFromUrl = pathname.split('/')[2]

	const [coreData, setCoreData] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	const fetchCoreDetails = async () => {
		try {
			setLoading(true)
			const response = await axios.get(
				`http://72.56.233.251:4200/experiment/get-experiment/${coreIdFromUrl}`,
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

	const [results, setResults] = useState<CalculationResult | null>(null);

// Обновите функцию handleCalculate
const handleCalculate = () => {
  setLoading1(true);
  
  // Имитация задержки AI-расчета
  setTimeout(() => {
    try {
      const res = calculateExperiment(coreData);
      setResults(res);
      toast.success('Моделирование завершено успешно');
    } catch (e) {
      toast.error('Ошибка в расчетах');
    } finally {
      setLoading1(false);
    }
  }, 60000);
};

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
              Эксперимент
            </div>
            <h1 className='text-4xl font-black text-slate-900'>
              {coreData.experimentId}
            </h1>
          </div>
          
          {/* КНОПКА РЕДАКТИРОВАНИЯ */}
          <Link 
            href={`/experiment/${coreIdFromUrl}/update`}
            className='flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95 mt-4'
          >
            <Edit size={16} />
            РЕДАКТИРОВАТЬ
          </Link>
        </div>
				</div>

			<div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* 1.  «ОБЩИЕ ДАННЫЕ» */}
				<section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-3 flex items-center gap-2'>
						<Database size={18} />
						<h2 className='font-bold uppercase tracking-wider text-sm'>
							«ОБЩИЕ ДАННЫЕ ЭКСПЕРИМЕНТА»
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
								<TableRow
									label='ID эксперимента'
									value={coreData.experimentId || 0}
								/>
								<TableRow
									label='Дата эксперимента'
									value={coreData.experimentDate || 0}
								/>
								<TableRow
									label='Название эксперимента'
									value={coreData.experimentName || 0}
								/>
								<TableRow
									label='Комментарий'
									value={coreData.experimentComment}
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
							Смоделировать с помощью AI
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
						{loading1 ? 'ВЫПОЛНЯЕТСЯ РАСЧЕТ...' : 'СМОДЕЛИРОВАТЬ ДАННЫЕ'}
					</button>
				</section>

				{/*  «ХАРАКТЕРИСТИКИ КЕРНА» ( 6-7) */}
				<section className='md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-3 flex items-center gap-2'>
						<Box size={18} />
						<h2 className='font-bold uppercase tracking-wider text-sm'>
							«ХАРАКТЕРИСТИКИ КЕРНА»
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
								<TableRow label='ID керна' value={coreData.coreId || 0} />
								<TableRow label='Месторождение' value={coreData.field || 0} />
								<TableRow label='Скважина' value={coreData.well || 0} />
								<TableRow label='Глубина' value={coreData.depth || 0} />
								<TableRow
									label='Интервал глубины от'
									value={coreData.depthFrom || 0}
								/>
								<TableRow
									label='Интервал глубины до'
									value={coreData.depthTo || 0}
								/>
								<TableRow
									label='Пласт / горизонт'
									value={coreData.formation || 0}
								/>
								<TableRow label='Тип породы' value={coreData.rockType || 0} />
								<TableRow label='Уран в керне' value={coreData.uranaium || 0} />
								<TableRow label='Карбонаты' value={coreData.carbonates || 0} />
								<TableRow
									label='Тип карбонатности'
									value={coreData.carbonateType || 0}
								/>
								<TableRow label='Глины' value={coreData.clay || 0} />
								<TableRow label='Гипс' value={coreData.gypsum || 0} />
								<TableRow
									label='Сульфаты прочие'
									value={coreData.otherSulfates || 0}
								/>
								<TableRow
									label='Мелкая фракция'
									value={coreData.fineFraction || 0}
								/>
							</tbody>
						</table>

						{/* Дополнительная плашка-инфо (опционально, для стиля) */}
						<div className='bg-slate-50 p-3 rounded border border-slate-100 flex items-start gap-2'>
							<Info size={14} className='text-slate-400 mt-0.5' />
							<p className='text-[10px] text-slate-500 italic'>
								Характеристики подтянуты автоматически из Модуля 1 «Цифровой
								Керн» на основании выбранного ID.
							</p>
						</div>
					</div>
				</section>

				{/* 3.  «ПАРАМЕТРЫ ВЫЩЕЛАЧИВАЮЩЕГО РАСТВОРА» */}
				<section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-3 flex items-center gap-2'>
						<Beaker size={18} />
						<h2 className='font-bold uppercase tracking-wider text-sm'>
							«ПАРАМЕТРЫ ВЫЩЕЛАЧИВАЮЩЕГО РАСТВОРА»
						</h2>
					</header>
					<div className='p-6'>
						<table className='w-full text-sm mb-4'>
							<thead className='bg-[#D9EAF7] text-[#003366]'>
								<tr>
									<th className='px-4 py-2 border border-slate-300 text-left'>
										Показатель
									</th>
									<th className='px-4 py-2 border border-slate-300 text-center w-24'>
										Значение
									</th>
								</tr>
							</thead>
							<tbody>
								<TableRow
									label='Масса керна / навески'
									value={coreData.sampleMassG}
								/>
								<TableRow label='Тип кислоты' value={coreData.acidType} />
								<TableRow
									label='Концентрация H2SO4'
									value={coreData.acidConcentrationGL}
								/>
								<TableRow
									label='Объём раствора'
									value={coreData.solutionVolumeML}
								/>
								<TableRow
									label='Ж:Т / L:S'
									value={coreData.liquidSolidRatioLKg}
								/>
								<TableRow label='Температура' value={coreData.temperatureC} />
								<TableRow
									label='Время реакции'
									value={coreData.reactionTimeMin}
								/>
							</tbody>
						</table>
					</div>
				</section>

				{/* ПАВ / РЕАГЕНТНАЯ ОБРАБОТКА */}
				<section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-3 flex justify-between items-center'>
						<div className='flex items-center gap-2'>
							<Layers size={18} />
							<h2 className='font-bold uppercase tracking-wider text-sm'>
								«ПАВ / РЕАГЕНТНАЯ ОБРАБОТКА»
							</h2>
						</div>
					</header>
					<div className='p-6 grid grid-rows-2 gap-y-8'>
						<table className='w-full text-sm'>
							<tbody>
								<TableRow
									label='Использовать ПАВ'
									value={coreData.pavUsed || 'Да'}
								/>
								<TableRow
									label='ПАВ / рецепт состава'
									value={coreData.pavRecipe || 0}
								/>
								<TableRow
									label='Содержание ПАВ в растворе'
									value={coreData.pavPctOfSolution || 0}
								/>
							</tbody>
						</table>
					</div>
				</section>

				{coreData?.experimentType === "laboratory" ? (
  /* 6. Фактические лабораторные результаты */
  <section className='md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
    <header className='bg-[#003366] text-white px-6 py-4 flex items-center gap-2'>
      <Beaker size={20} />
      <h2 className='font-bold uppercase tracking-wider text-sm'>
        «Фактические лабораторные результаты»
      </h2>
    </header>

    <div className='p-6'>
      <div className='overflow-hidden border border-slate-200 rounded-lg'>
        <table className='w-full text-sm border-collapse'>
          <thead>
            <tr className='bg-slate-50 text-[#003366] text-[11px] font-black uppercase tracking-widest border-b border-slate-200'>
              <th className='px-6 py-4 text-left border-r border-slate-200 w-1/2'>
                Показатель
              </th>
              <th className='px-6 py-4 text-left'>
                Значение
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200'>
            <TableRow label='Дата лабораторной проверки' value={coreData.actualLabCheckDate || "-"} />
            <TableRow label='Исполнитель / лаборатория' value={coreData.actualLabExecutor || "-"} />
            <TableRow label='U в растворе, факт' value={coreData.actualOutputUMgL} highlight />
            <TableRow label='U перешло в раствор, факт' value={coreData.actualOutputUMg} highlight />
            <TableRow label='Извлечение U, факт' value={coreData.actualRecoveryPct} highlight />
            <TableRow label='Остаток U в керне, факт' value={coreData.actualResidueUMg} />
            <TableRow label='pH раствора, факт' value={coreData.actualOutputPh} />
            <TableRow label='Eh / ОВП, факт' value={`${coreData.actualOutputEhMv || 0} мВ`} />
            <TableRow label='Остаточная H2SO4, факт' value={`${coreData.actualResidualH2so4GL || 0} г/л`} />
            <TableRow label='Fe2+, факт' value={`${coreData.actualFe2MgL || 0} мг/л`} />
            <TableRow label='Fe3+, факт' value={`${coreData.actualFe3MgL || 0} мг/л`} />
            <TableRow label='SO4 2-, факт' value={`${coreData.actualSulfateMgL || 0} мг/л`} />
            <TableRow label='Ca2+, факт' value={`${coreData.actualCalciumMgL || 0} мг/л`} />
            <TableRow label='Mg2+, факт' value={`${coreData.actualMagnesiumMgL || 0} мг/л`} />
            <TableRow label='Al3+, факт' value={`${coreData.actualAluminumMgL || 0} мг/л`} />
            <TableRow label='Механические примеси, факт' value={`${coreData.actualMechanicalImpuritiesMgL || 0} мг/л`} />
            <TableRow label='Сухой остаток, факт' value={`${coreData.actualDryResidueMgL || 0} мг/л`} />
          </tbody>
        </table>
      </div>
    </div>
  </section>
) : null}

				{/* 5.  Прогнозные результаты */}
				<section className='md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
					<header className='bg-[#003366] text-white px-6 py-4 flex justify-between items-center'>
						<div className='flex items-center gap-2'>
							<Settings2 size={20} />
							<h2 className='font-bold uppercase tracking-wider text-sm'>
								«Прогнозные результаты»
							</h2>
						</div>
					</header>

					<div className='p-6'>
						<div className='overflow-hidden border border-slate-200 rounded-lg'>
							<table className='w-full text-sm border-collapse'>
								<thead>
									<tr className='bg-slate-50 text-[#003366] text-[11px] font-black uppercase tracking-widest border-b border-slate-200'>
										<th className='px-6 py-4 text-left border-r border-slate-200'>
											Показатель
										</th>
										<th className='px-6 py-4 text-left border-r border-slate-200'>
											Значение
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-200'>
									<tr className='hover:bg-slate-50/50 transition-colors'>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											U в растворе, мг/л
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.uSolutionMgL || "-"}
											</div>
										</td>
									</tr>
									<tr className='hover:bg-slate-50/50 transition-colors'>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											U перешло в раствор, мг
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.uDissolvedMg || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Извлечение U, %
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.recoveryPct || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Остаток U в керне, мг
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.uRemainsInCoreMg || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Потери H2SO4 на карбонаты, г
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.acidLossCarbonatesG || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Активная H2SO4, г
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.activeAcidG || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Эффективная концентрация H2SO4, г/л
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.effectiveAcidGL || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Удельный расход H2SO4, кг
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.acidConsumptionKgKgU || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Риск кольматации
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.cloggingRisk || "-"}
											</div>
										</td>
									</tr>
									<tr>
										<td className='px-6 py-5 font-bold text-slate-700 border-r border-slate-200'>
											Уверенность прогноза
										</td>

										<td className='px-4 py-5 text-center bg-green-50/20'>
											<div className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs border border-green-200'>
												{results?.confidence || "-"}
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
