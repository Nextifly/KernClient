'use client'

import axios from 'axios'
import {
	ArrowLeft,
	Beaker,
	Box,
	Database,
	Layers,
	Save,
	Settings2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function CreateFullCorePage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	// Состояние полностью синхронизировано с вашей схемой Prisma
	const [formData, setFormData] = useState({
		// Блок 4: Общие данные
		coreId: '',
		field: '',
		well: '',
		depth: 0,
		depthFrom: 0,
		depthTo: 0,
		formation: '',
		rockType: 'Песчаник',
		samplingDate: new Date().toISOString().split('T')[0],

		// Блок 5: Геометрия и масса
		length: 0,
		diameter: 0,
		dryMass: 0,
		volume: 0,
		grainDensity: 2.65,
		bulkDensity: 0,

		// Блок 6: Минералогия
		quartz: 0,
		feldspar: 0,
		clay: 0,
		carbonates: 0,
		gypsum: 0,
		otherSulfates: 0,
		organicMatter: 0,
		coalyMatter: 0,
		uranium: 0,
		others: 0,
		carbonateType: 'CO2',

		// Блок 7: Текстурные параметры
		grainSizeD50: 0,
		fineFraction: 0,
		sorting: 'Средняя',
		cementation: 'Умеренная',
		cementType: 'Карбонатный',
		fracturing: '0 — нет трещин',

		// Блоки 8-9: Пористость и Проницаемость
		porosityLab: 0,
		porosityCalc: 0,
		porosityAi: 0,
		porosityAccepted: 0,
		permeabilityLab: 0,
		permeabilityCalc: 0,
		permeabilityAi: 0,
		permeabilityAccepted: 0,
	})

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target
		setFormData(prev => ({
			...prev,
			[name]: type === 'number' ? parseFloat(value) || 0 : value,
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const token = localStorage.getItem('token')
			await axios.post('http://72.56.233.251:4200/kern/create-kern', formData, {
				headers: { Authorization: `Bearer ${token}` },
			})

			toast.success('Данные успешно сохранены в БД')
			setTimeout(() => router.push('/kern'), 1500)
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Ошибка при сохранении')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-gray-50 p-8 font-sans pb-20 text-slate-800'>
			<Toaster />
			<div className='max-w-6xl mx-auto'>
				<button
					onClick={() => router.back()}
					className='flex items-center gap-2 text-gray-500 hover:text-[#003366] mb-6 transition-colors font-semibold'
				>
					<ArrowLeft size={20} />
					<span>Вернуться в базу</span>
				</button>

				<form onSubmit={handleSubmit} className='space-y-8'>
					<div className='flex justify-between items-center'>
						<h1 className='text-3xl font-black text-slate-900 uppercase tracking-tight'>
							Новая карточка керна
						</h1>
						<button
							type='submit'
							disabled={loading}
							className='flex items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-10 py-4 rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50'
						>
							<Save size={20} />
							<span className='font-bold uppercase tracking-widest'>
								{loading ? 'Сохранение...' : 'Сохранить'}
							</span>
						</button>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						{/* БЛОК 4: ОБЩИЕ ДАННЫЕ */}
						<Section icon={<Database size={18} />} title='Общие данные'>
							<div className='grid grid-cols-2 gap-4'>
								<Input
									label='ID Керна (unique)'
									name='coreId'
									value={formData.coreId}
									onChange={handleChange}
									required
								/>
								<Input
									label='Месторождение'
									name='field'
									value={formData.field}
									onChange={handleChange}
									required
								/>
								<Input
									label='Скважина'
									name='well'
									value={formData.well}
									onChange={handleChange}
									required
								/>
								<Input
									label='Средняя глубина'
									name='depth'
									type='number'
									value={formData.depth}
									onChange={handleChange}
								/>
								<Input
									label='Интервал От'
									name='depthFrom'
									type='number'
									value={formData.depthFrom}
									onChange={handleChange}
								/>
								<Input
									label='Интервал До'
									name='depthTo'
									type='number'
									value={formData.depthTo}
									onChange={handleChange}
								/>
								<Input
									label='Пласт / Горизонт'
									name='formation'
									value={formData.formation}
									onChange={handleChange}
								/>
								<Select
									label='Тип породы'
									name='rockType'
									value={formData.rockType}
									onChange={handleChange}
									options={[
										'Песчаник',
										'Алевролит',
										'Глина',
										'Известняк',
										'Аргиллит',
									]}
								/>
								<Input
									label='Дата отбора'
									name='samplingDate'
									type='date'
									value={formData.samplingDate}
									onChange={handleChange}
								/>
							</div>
						</Section>

						{/* БЛОК 5: ГЕОМЕТРИЯ И МАССА */}
						<Section icon={<Box size={18} />} title='Геометрия и масса'>
							<div className='grid grid-cols-2 gap-4'>
								<Input
									label='Длина (мм)'
									name='length'
									type='number'
									value={formData.length}
									onChange={handleChange}
								/>
								<Input
									label='Диаметр (мм)'
									name='diameter'
									type='number'
									value={formData.diameter}
									onChange={handleChange}
								/>
								<Input
									label='Сухая масса (г)'
									name='dryMass'
									type='number'
									value={formData.dryMass}
									onChange={handleChange}
								/>
								<Input
									label='Объём (см³)'
									name='volume'
									type='number'
									value={formData.volume}
									onChange={handleChange}
								/>
								<Input
									label='Плотность зерен (г/см³)'
									name='grainDensity'
									type='number'
									value={formData.grainDensity}
									onChange={handleChange}
								/>
								<Input
									label='Объёмная плотн. (г/см³)'
									name='bulkDensity'
									type='number'
									value={formData.bulkDensity}
									onChange={handleChange}
								/>
							</div>
						</Section>

						{/* БЛОК 6: МИНЕРАЛОГИЯ */}
						<Section icon={<Beaker size={18} />} title='Минералогия (%)'>
							<div className='grid grid-cols-2 gap-x-4 gap-y-2'>
								<Input
									label='Кварц'
									name='quartz'
									type='number'
									value={formData.quartz}
									onChange={handleChange}
								/>
								<Input
									label='Полевые шпаты'
									name='feldspar'
									type='number'
									value={formData.feldspar}
									onChange={handleChange}
								/>
								<Input
									label='Глины'
									name='clay'
									type='number'
									value={formData.clay}
									onChange={handleChange}
								/>

								{/* НОВОЕ ПОЛЕ: Тип карбонатности */}
								<Select
									label='Тип карбонатности'
									name='carbonateType'
									value={formData.carbonateType}
									onChange={handleChange}
									options={['CaCO3', 'CO2']}
								/>

								<Input
									label='Карбонаты'
									name='carbonates'
									type='number'
									value={formData.carbonates}
									onChange={handleChange}
								/>

								<Input
									label='Гипс'
									name='gypsum'
									type='number'
									value={formData.gypsum}
									onChange={handleChange}
								/>
								<Input
									label='Сульфаты прочие'
									name='otherSulfates'
									type='number'
									value={formData.otherSulfates}
									onChange={handleChange}
								/>
								<Input
									label='Орг. вещество'
									name='organicMatter'
									type='number'
									value={formData.organicMatter}
									onChange={handleChange}
								/>
								<Input
									label='Углистое вещ-во'
									name='coalyMatter'
									type='number'
									value={formData.coalyMatter}
									onChange={handleChange}
								/>
								<Input
									label='Уран (мг/кг)'
									name='uranium'
									type='number'
									value={formData.uranium}
									onChange={handleChange}
								/>
								<Input
									label='Прочее'
									name='others'
									type='number'
									value={formData.others}
									onChange={handleChange}
								/>
							</div>
						</Section>

						{/* БЛОК 7: ТЕКСТУРНЫЕ ПАРАМЕТРЫ */}
						<Section
							icon={<Layers size={18} />}
							title='Текстурные параметры'
						>
							<div className='grid grid-cols-1 gap-3'>
								<Input
									label='Размер зерна d50 (мм)'
									name='grainSizeD50'
									type='number'
									value={formData.grainSizeD50}
									onChange={handleChange}
								/>
								<Input
									label='Мелкая фракция (%)'
									name='fineFraction'
									type='number'
									value={formData.fineFraction}
									onChange={handleChange}
								/>
								<Select
									label='Сортировка'
									name='sorting'
									value={formData.sorting}
									onChange={handleChange}
									options={['Очень хорошая', 'Хорошая', 'Средняя', 'Плохая']}
								/>
								<Select
									label='Цементация'
									name='cementation'
									value={formData.cementation}
									onChange={handleChange}
									options={['Слабая', 'Умеренная', 'Сильная']}
								/>
								<Input
									label='Тип цемента'
									name='cementType'
									value={formData.cementType}
									onChange={handleChange}
								/>
								<Input
									label='Трещиноватость'
									name='fracturing'
									value={formData.fracturing}
									onChange={handleChange}
								/>
							</div>
						</Section>

						{/* БЛОКИ 8-9: ПОРИСТОСТЬ И ПРОНИЦАЕМОСТЬ */}
						<Section
							icon={<Settings2 size={18} />}
							title='Пористость и Проницаемость'
						>
							<div className='space-y-4'>
								<div className='grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100'>
									<Input
										label='Проницаемость Лаб (mD)'
										name='porosityCalc'
										type='number'
										value={formData.porosityCalc}
										onChange={handleChange}
									/>
									<Input
										label='Пористость (Kp), %'
										name='permeabilityCalc'
										type='number'
										value={formData.permeabilityCalc}
										onChange={handleChange}
									/>
								</div>
							</div>
						</Section>
					</div>
				</form>
			</div>
		</div>
	)
}

// Компонент секции с требуемым цветом заголовка #003366
function Section({ icon, title, children }: any) {
	return (
		<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full'>
			<header className='bg-[#003366] px-6 py-4 flex items-center gap-3'>
				<div className='text-white/90'>{icon}</div>
				<h2 className='font-bold uppercase text-[11px] tracking-widest text-white'>
					{title}
				</h2>
			</header>
			<div className='p-6 flex-1'>{children}</div>
		</div>
	)
}

function Input({ label, ...props }: any) {
	return (
		<div className='flex flex-col gap-1'>
			<label className='text-[9px] font-black text-gray-400 uppercase tracking-tighter'>
				{label}
			</label>
			<input
				{...props}
				className='border-b border-gray-200 py-1.5 focus:border-[#003366] outline-none bg-transparent transition-all text-sm placeholder:text-gray-300'
			/>
		</div>
	)
}

function Select({ label, options, ...props }: any) {
	return (
		<div className='flex flex-col gap-1'>
			<label className='text-[9px] font-black text-gray-400 uppercase tracking-tighter'>
				{label}
			</label>
			<select
				{...props}
				className='border-b border-gray-200 py-1.5 focus:border-[#003366] outline-none bg-transparent text-sm'
			>
				{options.map((opt: string) => (
					<option key={opt} value={opt}>
						{opt}
					</option>
				))}
			</select>
		</div>
	)
}
