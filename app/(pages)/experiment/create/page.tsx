'use client'

import React, { useState, useEffect } from 'react'
import { Beaker, Box, Layers, Database, Save, PlusCircle, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

export default function CreateExperimentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // БЛОК 5: ОБЩИЕ ДАННЫЕ [cite: 304]
    experimentId: '',
    experimentDate: new Date().toISOString().split('T')[0],
    experimentName: '',
    experimentComment: '',
    experimentType: 'virtual', // [cite: 334]

    // БЛОК 7: ХАРАКТЕРИСТИКИ КЕРНА [cite: 322]
    coreId: '',
    field: '',
    well: '',
    depth: '',
    depthFrom: '',
    depthTo: '',
    formation: '',
    rockType: '',
    uranium: '',
    carbonates: '',
    carbonateBasis: 'CO2', // [cite: 326]
    clay: '',
    gypsum: '',
    otherSulfates: '',
    fineFraction: '',
    porosityAccepted: '', // Добавлено [cite: 322]
    permeabilityAccepted: '', // Добавлено [cite: 322]

    // БЛОК 9: ПАРАМЕТРЫ РАСТВОРА [cite: 355]
    sampleMassG: '',
    acidType: 'h2so4', 
    acidConcentrationGL: '',
    solutionVolumeML: '',
    liquidSolidRatioLKg: '', // Read-only [cite: 357]
    temperatureC: '35',
    reactionTimeMin: '',

    // БЛОК 10: ПАВ [cite: 366]
    pavUsed: false,
    pavRecipe: 'none',
    pavPctOfSolution: '0'
  })

  // Автоматический расчет Ж:Т [cite: 358]
  useEffect(() => {
    const mass = parseFloat(formData.sampleMassG)
    const volume = parseFloat(formData.solutionVolumeML)
    if (mass > 0 && volume > 0) {
      const ratio = (volume / 1000) / (mass / 1000)
      setFormData(prev => ({ ...prev, liquidSolidRatioLKg: ratio.toFixed(2) }))
    }
  }, [formData.sampleMassG, formData.solutionVolumeML])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:4200/experiment/create-experiment', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      toast.success('Эксперимент успешно создан!')
      router.push('/experiments')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] p-8 font-sans text-slate-800'>
      <Toaster />
      <form onSubmit={handleSubmit} className='max-w-7xl mx-auto'>
        
        {/* Шапка и кнопка сохранения [cite: 502] */}
        <div className='flex justify-between items-end mb-8'>
          <div>
            <h1 className='text-4xl font-black text-slate-900 flex items-center gap-3 italic'>
              <PlusCircle size={36} className='text-blue-600' /> СОЗДАТЬ ЗАПИСЬ
            </h1>
          </div>
          <button type='submit' disabled={loading} className='bg-[#059669] text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg transition-all'>
            <Save size={20} /> {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ДАННЫЕ'}
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          
          {/* ОБЩИЕ ДАННЫЕ [cite: 304] */}
          <FormSection title="«ОБЩИЕ ДАННЫЕ ЭКСПЕРИМЕНТА»" icon={<Database size={18} />}>
            <InputRow label="ID эксперимента" name="experimentId" value={formData.experimentId} onChange={handleChange} placeholder="EXP-001" required />
            <InputRow label="Дата" name="experimentDate" type="date" value={formData.experimentDate} onChange={handleChange} />
            <InputRow label="Название" name="experimentName" value={formData.experimentName} onChange={handleChange} />
            <SelectRow label="Тип эксперимента" name="experimentType" value={formData.experimentType} onChange={handleChange} 
              options={[{v:'virtual', l:'Виртуальный'}, {v:'laboratory', l:'Лабораторный'}, {v:'field', l:'Промысловый'}]} />
            <div className='p-4 border-t border-slate-100'>
              <label className='block text-[10px] uppercase font-bold text-slate-400 mb-1'>Комментарий</label>
              <textarea name="experimentComment" className='w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none' rows={2} value={formData.experimentComment} onChange={handleChange} />
            </div>
          </FormSection>

          {/* ПАРАМЕТРЫ РАСТВОРА [cite: 355] */}
          <FormSection title="«ПАРАМЕТРЫ ВЫЩЕЛАЧИВАЮЩЕГО РАСТВОРА»" icon={<Beaker size={18} />}>
            <InputRow label="Масса керна (г)" name="sampleMassG" value={formData.sampleMassG} onChange={handleChange} type="number" />
            <SelectRow label="Тип кислоты" name="acidType" value={formData.acidType} onChange={handleChange} options={[{v:'h2so4', l:'H2SO4'}]} />
            <InputRow label="Концентрация H2SO4 (г/л)" name="acidConcentrationGL" value={formData.acidConcentrationGL} onChange={handleChange} type="number" />
            <InputRow label="Объём раствора (мл)" name="solutionVolumeML" value={formData.solutionVolumeML} onChange={handleChange} type="number" />
            <InputRow label="Ж:Т / L:S (л/кг)" name="liquidSolidRatioLKg" value={formData.liquidSolidRatioLKg} readOnly className="bg-gray-100 text-gray-500" />
            <InputRow label="Температура (°C)" name="temperatureC" value={formData.temperatureC} onChange={handleChange} type="number" />
            <InputRow label="Время реакции (мин)" name="reactionTimeMin" value={formData.reactionTimeMin} onChange={handleChange} type="number" />
          </FormSection>

          {/* ХАРАКТЕРИСТИКИ КЕРНА (сверено с ТЗ и фото)  */}
          <div className='md:col-span-2'>
            <FormSection title="«ХАРАКТЕРИСТИКИ КЕРНА»" icon={<Box size={18} />}>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-slate-100'>
                <InputRow label="ID Керна" name="coreId" value={formData.coreId} onChange={handleChange} required />
                <InputRow label="Месторождение" name="field" value={formData.field} onChange={handleChange} />
                <InputRow label="Скважина" name="well" value={formData.well} onChange={handleChange} />
                <InputRow label="Глубина (м)" name="depth" value={formData.depth} onChange={handleChange} />
                <InputRow label="Интервал ОТ (м)" name="depthFrom" value={formData.depthFrom} onChange={handleChange} />
                <InputRow label="Интервал ДО (м)" name="depthTo" value={formData.depthTo} onChange={handleChange} />
                <InputRow label="Пласт / горизонт" name="formation" value={formData.formation} onChange={handleChange} />
                <InputRow label="Тип породы" name="rockType" value={formData.rockType} onChange={handleChange} />
                <InputRow label="Уран в керне (мг/кг)" name="uranium" value={formData.uranium} onChange={handleChange} />
                <InputRow label="Карбонаты (%)" name="carbonates" value={formData.carbonates} onChange={handleChange} />
                <SelectRow label="Тип карбонатности" name="carbonateBasis" value={formData.carbonateBasis} onChange={handleChange} options={[{v:'CO2', l:'CO2'}, {v:'CaCO3', l:'CaCO3'}]} />
                <InputRow label="Глины (%)" name="clay" value={formData.clay} onChange={handleChange} />
                <InputRow label="Гипс (%)" name="gypsum" value={formData.gypsum} onChange={handleChange} />
                <InputRow label="Сульфаты прочие (%)" name="otherSulfates" value={formData.otherSulfates} onChange={handleChange} />
                <InputRow label="Мелкая фракция (%)" name="fineFraction" value={formData.fineFraction} onChange={handleChange} />
                <InputRow label="Пористость (%)" name="porosityAccepted" value={formData.porosityAccepted} onChange={handleChange} />
                <InputRow label="Проницаемость (mD)" name="permeabilityAccepted" value={formData.permeabilityAccepted} onChange={handleChange} />
              </div>
            </FormSection>
          </div>

          {/* ПАВ / РЕАГЕНТНАЯ ОБРАБОТКА [cite: 366] */}
          <FormSection title="«ПАВ / РЕАГЕНТНАЯ ОБРАБОТКА»" icon={<Layers size={18} />}>
            <div className='flex items-center border-b border-slate-100 p-4'>
                <input type="checkbox" name="pavUsed" checked={formData.pavUsed} onChange={handleChange} className='w-4 h-4 mr-3' />
                <label className='text-[10px] uppercase font-bold text-slate-500'>Использовать ПАВ</label>
            </div>
            <SelectRow label="Рецепт состава" name="pavRecipe" value={formData.pavRecipe} onChange={handleChange} disabled={!formData.pavUsed}
              options={[{v:'none', l:'Без ПАВ'}, {v:'pav_recipe_1', l:'ПАВ, состав 1'}, {v:'pav_recipe_2', l:'ПАВ, состав 2'}, {v:'pav_recipe_3', l:'ПАВ, состав 3'}]} />
            <InputRow label="Содержание ПАВ (%)" name="pavPctOfSolution" value={formData.pavPctOfSolution} onChange={handleChange} type="number" disabled={!formData.pavUsed} />
          </FormSection>
          
        </div>
      </form>
    </div>
  )
}

// Вспомогательные компоненты для чистоты кода
function FormSection({ title, icon, children }: any) {
  return (
    <section className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full'>
      <header className='bg-[#003366] text-white px-6 py-3 flex items-center gap-2 italic'>
        {icon} <h2 className='font-bold uppercase tracking-wider text-xs'>{title}</h2>
      </header>
      <div className='flex flex-col'>{children}</div>
    </section>
  )
}

function InputRow({ label, name, value, onChange, type = "text", placeholder, required, readOnly, className }: any) {
  return (
    <div className={`flex items-center border-b border-slate-100 hover:bg-slate-50 transition-colors ${className}`}>
      <label className='px-4 py-3 bg-slate-50/50 w-1/2 text-[10px] uppercase font-bold text-slate-500 tracking-tighter border-r border-slate-100'>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} placeholder={placeholder}
        className='w-1/2 px-4 py-2 text-sm bg-transparent outline-none font-semibold text-slate-800' />
    </div>
  )
}

function SelectRow({ label, name, value, onChange, options, disabled }: any) {
  return (
    <div className={`flex items-center border-b border-slate-100 ${disabled ? 'opacity-50' : ''}`}>
      <label className='px-4 py-3 bg-slate-50/50 w-1/2 text-[10px] uppercase font-bold text-slate-500 tracking-tighter border-r border-slate-100'>{label}</label>
      <select name={name} value={value} onChange={onChange} disabled={disabled} className='w-1/2 px-4 py-2 text-sm bg-transparent outline-none font-semibold text-slate-800'>
        {options.map((opt: any) => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
      </select>
    </div>
  )
}