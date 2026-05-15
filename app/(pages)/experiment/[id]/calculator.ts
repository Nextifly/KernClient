export interface CalculationResult {
  uSolutionMgL: number;          // U в растворе, мг/л
  uDissolvedMg: number;          // U перешло в раствор, мг
  recoveryPct: number;           // Извлечение U, %
  uRemainsInCoreMg: number;      // Остаток U в керне, мг
  acidLossCarbonatesG: number;   // Потери H2SO4 на карбонаты, г
  activeAcidG: number;           // Активная H2SO4, г
  effectiveAcidGL: number;       // Эффективная концентрация H2SO4, г/л
  acidConsumptionKgKgU: number;  // Удельный расход H2SO4, кг/кг
  cloggingRisk: string;          // Риск кольматации
  confidence: string;            // Уверенность прогноза
}

export const calculateExperiment = (data: any): CalculationResult => {
  // --- Входные данные ---
  const {
    sampleMassG = 0,
    acidConcentrationGL = 0,
    solutionVolumeML = 0,
    uranaium = 0, // Содержание U в керне, мг/кг
    carbonates = 0,
    carbonateType = 'CaCO3', // По умолчанию
    clay = 0,
    fineFraction = 0,
    otherSulfates = 0,
    permeabilityAccepted = 0,
    pavUsed = false,
    pavPctOfSolution = 0
  } = data;

  // 1. Ж:Т
  const lsRatio = solutionVolumeML / sampleMassG;

  // 2. Внесенная кислота (г)
  const acidInputG = acidConcentrationGL * (solutionVolumeML / 1000);

  // 3. Эффект ПАВ (Логика из ТЗ)
  let pavFactor = 1.0;
  let pavCarbonateProtection = 0;
  if (pavUsed) {
    const c = pavPctOfSolution;
    // Оптимум 2.5-3.5% (дает +26%)
    if (c > 0 && c <= 3.5) {
      pavFactor = 1 + (0.26 * (c / 3.5));
    } else if (c > 3.5) {
      pavFactor = 1.26 * Math.exp(-0.5 * (c - 3.5)); // Резкое падение
    }
    pavCarbonateProtection = 0.15; // ПАВ защищает от растворения карбонатов на 15%
  }

  // 4. Потери на карбонаты
  const carbKoef = carbonateType === 'CO2' ? 2.23 : 0.98;
  const acidNeededForCarb = (sampleMassG * (carbonates / 100)) * carbKoef;
  const acidLossCarbonatesG = Math.min(acidInputG, acidNeededForCarb) * (1 - pavCarbonateProtection);

  // 5. Активная кислота и Эффективная концентрация
  const activeAcidG = Math.max(acidInputG - acidLossCarbonatesG, 0);
  const effectiveAcidGL = activeAcidG / (solutionVolumeML / 1000);

  // 6. Кислотный фактор
  const acidFactor = (1 - Math.exp(-effectiveAcidGL / 7)) / (1 - Math.exp(-20 / 7));

  // 7. Фактор Ж:Т
  const lsFactor = (1 - Math.exp(-0.85 * lsRatio)) / (1 - Math.exp(-0.85 * 3.0));

  // 8. Итоговое извлечение (%)
  // Базовый макс 55% * факторы
  let recoveryPct = 55 * Math.max(0, Math.min(acidFactor, 1.2)) * Math.max(0, Math.min(lsFactor, 1.1)) * pavFactor;
  
  // Ограничение здравым смыслом
  recoveryPct = Math.min(recoveryPct, 95);

  // 9. Баланс урана (мг)
  const uInitialTotalMg = (uranaium * sampleMassG) / 1000;
  const uDissolvedMg = uInitialTotalMg * (recoveryPct / 100);
  const uRemainsInCoreMg = uInitialTotalMg - uDissolvedMg;
  const uSolutionMgL = uDissolvedMg / (solutionVolumeML / 1000);

  // 10. Удельный расход кислоты (кг/кг U)
  const acidConsumptionKgKgU = uDissolvedMg > 0 ? (acidInputG / uDissolvedMg) * 1000 : 0;

  // 11. Риск кольматации
  let riskScore = 0;
  if (clay > 10) riskScore += 3;
  if (fineFraction > 15) riskScore += 3;
  if (carbonates > 5) riskScore += 2;
  if (pavUsed) riskScore -= 2;
  
  const cloggingRisk = riskScore > 5 ? "ВЫСОКИЙ" : riskScore > 2 ? "СРЕДНИЙ" : "НИЗКИЙ";
	
  // 12. Уверенность
  let confScore = 100;
  if (!permeabilityAccepted) confScore -= 15;
  if (effectiveAcidGL < 2) confScore -= 10;

  const conf = confScore > 50 ? "ВЫСОКИЙ" : confScore >= 35 ? "СРЕДНИЙ" : "НИЗКИЙ";

  return {
    uSolutionMgL: Number(uSolutionMgL.toFixed(2)),
    uDissolvedMg: Number(uDissolvedMg.toFixed(2)),
    recoveryPct: Number(recoveryPct.toFixed(2)),
    uRemainsInCoreMg: Number(uRemainsInCoreMg.toFixed(2)),
    acidLossCarbonatesG: Number(acidLossCarbonatesG.toFixed(3)),
    activeAcidG: Number(activeAcidG.toFixed(3)),
    effectiveAcidGL: Number(effectiveAcidGL.toFixed(2)),
    acidConsumptionKgKgU: Number(acidConsumptionKgKgU.toFixed(1)),
    cloggingRisk: `${cloggingRisk} ${riskScore}%`,
    confidence: `${conf} ${confScore}%`
  };
};