'use client'

import axios from 'axios'
import { Beaker, Box, Database, Layers, Edit3, Save, Loader2, FlaskConical, ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function UpdateExperimentPage() {
  const router = useRouter()
  const params = useParams()
  const experimentIdFromUrl = params.id // Получаем ID из URL

  const [loading, setLoading] = useState(false)
  const [fetchingInitialData, setFetchingInitialData] = useState(true)
  const [allCores, setAllCores] = useState<any[]>([])

  const [formData, setFormData] = useState({
    // --- БЛОК 1: ОБЩИЕ ДАННЫЕ ---
    experimentId: '',
    experimentDate: '',
    experimentName: '',
    experimentComment: '',
    experimentType: 'laboratory',

    // --- БЛОК 2: ХАРАКТЕРИСТИКИ КЕРНА ---
    coreId: '',
    field: '',
    well: '',
    depth: 0,
    depthFrom: 0,
    depthTo: 0,
    formation: '',
    rockType: '',
    uranaium: 0, 
    carbonates: 0,
    carbonateType: 'CO2',
    clay: 0,
    gypsum: 0,
    otherSulfates: 0,
    fineFraction: 0,
    grainSizeD50: 0,
    calcPorosity: 0,
    calcPermeability: 0,

    // --- БЛОК 3: ПАРАМЕТРЫ РАСТВОРА ---
    sampleMassG: 0,
    acidType: 'H2SO4',
    acidConcentrationGL: 0,
    solutionVolumeML: 0,
    liquidSolidRatioLKg: 0,
    temperatureC: 35,
    reactionTimeMin: 0,

    // --- БЛОК 4: ПАВ ---
    pavUsed: false,
    pavRecipe: 'none',
    pavPctOfSolution: 0,

    // --- БЛОК 6: ФАКТИЧЕСКИЕ ДАННЫЕ (Лаборатория) ---
    actualLabCheckDate: '',
    actualLabExecutor: '',
    actualOutputUMgL: 0,
    actualOutputUMg: 0,
    actualRecoveryPct: 0,
    actualResidueUMg: 0,
    actualOutputPh: 0,
    actualOutputEhMv: 0,
    actualFe2MgL: 0,
    actualFe3MgL: 0,
    actualSulfateMgL: 0,
    actualCalciumMgL: 0,
    actualMagnesiumMgL: 0,
    actualAluminumMgL: 0,
    actualMechanicalImpuritiesMgL: 0,
    actualDryResidueMgL: 0,
  })

  // 1. Загрузка списка кернов и данных самого эксперимента
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetchingInitialData(true)
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        // Загружаем все керны для выпадающего списка
        const coresRes = await axios.get('http://72.56.233.251:4200/experiment/get-experiment-all', { headers })
        setAllCores(coresRes.data)

        // Загружаем данные конкретного эксперимента
        const experimentRes = await axios.get(`http://72.56.233.251:4200/experiment/get-experiment/${experimentIdFromUrl}`, { headers })
        const data = experimentRes.data

        // Заполняем форму данными из БД
        setFormData({
          ...data,
          // Приводим дату к формату YYYY-MM-DD для input[type="date"]
          experimentDate: data.experimentDate ? new Date(data.experimentDate).toISOString().split('T')[0] : '',
          actualLabCheckDate: data.actualLabCheckDate ? new Date(data.actualLabCheckDate).toISOString().split('T')[0] : '',
          // Конвертируем "Да"/"Нет" обратно в boolean для чекбокса
          pavUsed: data.pavUsed === "Да"
        })

      } catch (error) {
        console.error("Fetch Error:", error)
        toast.error('Ошибка при загрузке данных эксперимента')
      } finally {
        setFetchingInitialData(false)
      }
    }
    if (experimentIdFromUrl) loadData()
  }, [experimentIdFromUrl])

  // 2. Расчет Ж:Т (L:S)
  useEffect(() => {
    const mass = Number(formData.sampleMassG)
    const volume = Number(formData.solutionVolumeML)
    if (mass > 0 && volume > 0) {
      const ratio = (volume / 1000) / (mass / 1000)
      setFormData(prev => ({ ...prev, liquidSolidRatioLKg: Number(ratio.toFixed(2)) }))
    }
  }, [formData.sampleMassG, formData.solutionVolumeML])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target
    let finalValue: any = type === 'checkbox' ? target.checked : value
    setFormData(prev => ({ ...prev, [name]: finalValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const dataToSubmit = {
        ...formData,
        // Приведение типов перед отправкой
        depth: Number(formData.depth),
        uranaium: Number(formData.uranaium),
        carbonates: Number(formData.carbonates),
        sampleMassG: Number(formData.sampleMassG),
        acidConcentrationGL: Number(formData.acidConcentrationGL),
        solutionVolumeML: Number(formData.solutionVolumeML),
        liquidSolidRatioLKg: Number(formData.liquidSolidRatioLKg),
        pavUsed: formData.pavUsed ? "Да" : "Нет",
        // Числовые поля лаборатории
        actualOutputPh: Number(formData.actualOutputPh),
        actualOutputEhMv: Number(formData.actualOutputEhMv),
        actualRecoveryPct: Number(formData.actualRecoveryPct),
        // ... остальные числовые поля аналогично Create
      }

      await axios.post(
        `http://72.56.233.251:4200/experiment/update-experiment/${experimentIdFromUrl}`,
        dataToSubmit,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      
      toast.success('Данные успешно обновлены!')
      router.push('/experiment/'+experimentIdFromUrl)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при обновлении')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingInitialData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">ЗАГРУЗКА ДАННЫХ ЭКСПЕРИМЕНТА...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] p-8 font-sans text-slate-800'>
      <Toaster />
      <form onSubmit={handleSubmit} className='max-w-7xl mx-auto'>
        
        {/* ХЕДЕР С КНОПКАМИ */}
        <div className='flex justify-between items-end mb-8'>
          <div>
            <button 
              type="button" 
              onClick={() => router.back()}
              className="text-blue-600 flex items-center gap-1 text-xs font-bold uppercase mb-2 hover:underline"
            >
              <ArrowLeft size={14}/> Назад к списку
            </button>
            <h1 className='text-4xl font-black text-slate-900 flex items-center gap-3 italic'>
              <Edit3 size={36} className='text-orange-500' /> РЕДАКТИРОВАТЬ: {experimentIdFromUrl}
            </h1>
          </div>
          <button
            type='submit'
            disabled={loading}
            className='bg-[#2563eb] text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all active:scale-95'
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'СОХРАНЕНИЕ...' : 'ОБНОВИТЬ ДАННЫЕ'}
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          
          {/* 1. ОБЩИЕ ДАННЫЕ */}
          <FormSection title='«ОБЩИЕ ДАННЫЕ ЭКСПЕРИМЕНТА»' icon={<Database size={18} />}>
            <InputRow label='ID эксперимента' name='experimentId' value={formData.experimentId} readOnly className='bg-gray-50' />
            <InputRow label='Дата' name='experimentDate' type='date' value={formData.experimentDate} onChange={handleChange} />
            <InputRow label='Название' name='experimentName' value={formData.experimentName} onChange={handleChange} />
            <SelectRow label='Тип эксперимента' name='experimentType' value={formData.experimentType} onChange={handleChange} options={[{ v: 'virtual', l: 'Виртуальный (AI)' }, { v: 'laboratory', l: 'Лабораторный (Факт)' }]} />
          </FormSection>

          {/* 2. ПАРАМЕТРЫ РАСТВОРА */}
          <FormSection title='«ПАРАМЕТРЫ ВЫЩЕЛАЧИВАЮЩЕГО РАСТВОРА»' icon={<Beaker size={18} />}>
            <InputRow label='Масса керна (г)' name='sampleMassG' value={formData.sampleMassG} onChange={handleChange} type='number' />
            <SelectRow label='Тип кислоты' name='acidType' value={formData.acidType} onChange={handleChange} options={[{ v: 'H2SO4', l: 'H2SO4' }]} />
            <InputRow label='Концентрация H2SO4 (г/л)' name='acidConcentrationGL' value={formData.acidConcentrationGL} onChange={handleChange} type='number' />
            <InputRow label='Объём раствора (мл)' name='solutionVolumeML' value={formData.solutionVolumeML} onChange={handleChange} type='number' />
            <InputRow label='Ж:Т / L:S (л/кг)' name='liquidSolidRatioLKg' value={formData.liquidSolidRatioLKg} readOnly className='bg-gray-100 text-gray-500 font-bold' />
            <InputRow label='Температура (°C)' name='temperatureC' value={formData.temperatureC} onChange={handleChange} type='number' />
            <InputRow label='Время реакции (мин)' name='reactionTimeMin' value={formData.reactionTimeMin} onChange={handleChange} type='number' />
          </FormSection>

          {/* 3. ХАРАКТЕРИСТИКИ КЕРНА */}
          <div className='md:col-span-2'>
            <FormSection title='«ХАРАКТЕРИСТИКИ КЕРНА»' icon={<Box size={18} />}>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                <InputRow label='ID Керна' name='coreId' value={formData.coreId} onChange={handleChange} required />
                <InputRow label='Месторождение' name='field' value={formData.field} onChange={handleChange} />
                <InputRow label='Скважина' name='well' value={formData.well} onChange={handleChange} />
                <InputRow label='Глубина (м)' name='depth' value={formData.depth} onChange={handleChange} type='number' />
                <InputRow label='Интервал ОТ (м)' name='depthFrom' value={formData.depthFrom} onChange={handleChange} type='number' />
                <InputRow label='Интервал ДО (м)' name='depthTo' value={formData.depthTo} onChange={handleChange} type='number' />
                <InputRow label='Пласт / горизонт' name='formation' value={formData.formation} onChange={handleChange} />
                <InputRow label='Тип породы' name='rockType' value={formData.rockType} onChange={handleChange} />
                <InputRow label='Уран в керне (мг/кг)' name='uranaium' value={formData.uranaium} onChange={handleChange} type='number' />
                <InputRow label='Карбонаты (%)' name='carbonates' value={formData.carbonates} onChange={handleChange} type='number' />
                <SelectRow label='Тип карбонатности' name='carbonateType' value={formData.carbonateType} onChange={handleChange} options={[{ v: 'CO2', l: 'CO2' }, { v: 'CaCO3', l: 'CaCO3' }]} />
                <InputRow label='Глины (%)' name='clay' value={formData.clay} onChange={handleChange} type='number' />
                <InputRow label='Гипс (%)' name='gypsum' value={formData.gypsum} onChange={handleChange} type='number' />
                <InputRow label='Сульфаты прочие (%)' name='otherSulfates' value={formData.otherSulfates} onChange={handleChange} type='number' />
                <InputRow label='Мелкая фракция (%)' name='fineFraction' value={formData.fineFraction} onChange={handleChange} type='number' />
                <InputRow label='Пористость (%)' name='calcPorosity' value={formData.calcPorosity} onChange={handleChange} type='number' />
                <InputRow label='Проницаемость (mD)' name='calcPermeability' value={formData.calcPermeability} onChange={handleChange} type='number' />
              </div>
            </FormSection>
          </div>

          {/* 4. ПАВ */}
          <FormSection title='«ПАВ / РЕАГЕНТНАЯ ОБРАБОТКА»' icon={<Layers size={18} />}>
            <div className='flex items-center border-b border-slate-100 p-4'>
              <input type='checkbox' name='pavUsed' checked={formData.pavUsed} onChange={handleChange} className='w-4 h-4 mr-3' />
              <label className='text-[10px] uppercase font-bold text-slate-500'>Использовать ПАВ</label>
            </div>
            <SelectRow label='Рецепт состава' name='pavRecipe' value={formData.pavRecipe} onChange={handleChange} disabled={!formData.pavUsed} options={[{ v: 'none', l: 'Без ПАВ' }, { v: 'pav_recipe_1', l: 'ПАВ, состав 1' }, { v: 'pav_recipe_2', l: 'ПАВ, состав 2' }, { v: 'pav_recipe_3', l: 'ПАВ, состав 3' }]} />
            <InputRow label='Содержание ПАВ (%)' name='pavPctOfSolution' value={formData.pavPctOfSolution} onChange={handleChange} type='number' disabled={!formData.pavUsed} />
          </FormSection>

          {/* 5. ЛАБОРАТОРНЫЕ РЕЗУЛЬТАТЫ */}
          {formData.experimentType === 'laboratory' && (
            <div className='md:col-span-2'>
              <FormSection title='ФАКТИЧЕСКИЕ ЛАБОРАТОРНЫЕ РЕЗУЛЬТАТЫ' icon={<FlaskConical size={18} />}>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                  <InputRow label='Дата лаб. проверки' name='actualLabCheckDate' type='date' value={formData.actualLabCheckDate} onChange={handleChange} />
                  <InputRow label='Исполнитель' name='actualLabExecutor' value={formData.actualLabExecutor} onChange={handleChange} />
                  <InputRow label='U в растворе (мг/л)' name='actualOutputUMgL' value={formData.actualOutputUMgL} onChange={handleChange} type='number' />
                  <InputRow label='U в растворе (мг)' name='actualOutputUMg' value={formData.actualOutputUMg} onChange={handleChange} type='number' />
                  <InputRow label='Извлечение (%)' name='actualRecoveryPct' value={formData.actualRecoveryPct} onChange={handleChange} type='number' />
                  <InputRow label='Остаток U (мг)' name='actualResidueUMg' value={formData.actualResidueUMg} onChange={handleChange} type='number' />
                  <InputRow label='pH раствора' name='actualOutputPh' value={formData.actualOutputPh} onChange={handleChange} type='number' />
                  <InputRow label='Eh / ОВП (мВ)' name='actualOutputEhMv' value={formData.actualOutputEhMv} onChange={handleChange} type='number' />
                  <InputRow label='Fe2+ (мг/л)' name='actualFe2MgL' value={formData.actualFe2MgL} onChange={handleChange} type='number' />
                  <InputRow label='Fe3+ (мг/л)' name='actualFe3MgL' value={formData.actualFe3MgL} onChange={handleChange} type='number' />
                  <InputRow label='SO4 2- (мг/л)' name='actualSulfateMgL' value={formData.actualSulfateMgL} onChange={handleChange} type='number' />
                  <InputRow label='Ca2+ (мг/л)' name='actualCalciumMgL' value={formData.actualCalciumMgL} onChange={handleChange} type='number' />
                  <InputRow label='Mg2+ (мг/л)' name='actualMagnesiumMgL' value={formData.actualMagnesiumMgL} onChange={handleChange} type='number' />
                  <InputRow label='Al3+ (мг/л)' name='actualAluminumMgL' value={formData.actualAluminumMgL} onChange={handleChange} type='number' />
                  <InputRow label='Мех. примеси (мг/л)' name='actualMechanicalImpuritiesMgL' value={formData.actualMechanicalImpuritiesMgL} onChange={handleChange} type='number' />
                  <InputRow label='Сухой остаток (мг/л)' name='actualDryResidueMgL' value={formData.actualDryResidueMgL} onChange={handleChange} type='number' />
                </div>
              </FormSection>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

// Вспомогательные компоненты (остаются такими же для сохранения стиля)
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

function InputRow({ label, name, value, onChange, type = 'text', placeholder, required, readOnly, className }: any) {
  return (
    <div className={`flex items-center border-b border-slate-100 hover:bg-slate-50 transition-colors ${className}`}>
      <label className='px-4 py-3 bg-slate-50/50 w-1/2 text-[10px] uppercase font-bold text-slate-500 tracking-tighter border-r border-slate-100'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <input 
        type={type} 
        name={name} 
        value={value ?? ""} 
        onChange={onChange} 
        required={required} 
        readOnly={readOnly} 
        placeholder={placeholder} 
        step="any"
        className='w-1/2 px-4 py-2 text-sm bg-transparent outline-none font-semibold text-slate-800' 
      />
    </div>
  )
}

function SelectRow({ label, name, value, onChange, options, disabled }: any) {
  return (
    <div className={`flex items-center border-b border-slate-100 ${disabled ? 'opacity-50' : ''}`}>
      <label className='px-4 py-3 bg-slate-50/50 w-1/2 text-[10px] uppercase font-bold text-slate-500 tracking-tighter border-r border-slate-100'>{label}</label>
      <select name={name} value={value} onChange={onChange} disabled={disabled} className='w-1/2 px-4 py-2 text-sm bg-transparent outline-none font-semibold text-slate-800'>
        {options.map((opt: any) => (<option key={opt.v} value={opt.v}>{opt.l}</option>))}
      </select>
    </div>
  )
}