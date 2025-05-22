import { Farm, WaterUsage, WeatherData, SustainabilityMetrics, MetricsAccumulator } from "./types";

export const getPositionForElement = (selector: string, placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom') => {
  const element = document.querySelector(selector);
  if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const rect = element.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;
  const margin = isMobile ? 16 : 24;

  if (isMobile) {
    return {
      top: `${rect.bottom + margin}px`,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  const positions: Record<'top' | 'bottom' | 'left' | 'right', { top: string; left: string; transform: string }> = {
    top: { 
      top: `${rect.top - margin}px`, 
      left: `${rect.left + rect.width / 2}px`, 
      transform: 'translate(-50%, -100%)' 
    },
    bottom: { 
      top: `${rect.bottom + margin}px`, 
      left: `${rect.left + rect.width / 2}px`, 
      transform: 'translate(-50%, 0)' 
    },
    left: { 
      top: `${rect.top + rect.height / 2}px`, 
      left: `${rect.left - margin}px`, 
      transform: 'translate(-100%, -50%)' 
    },
    right: { 
      top: `${rect.top + rect.height / 2}px`, 
      left: `${rect.right + margin}px`, 
      transform: 'translate(0, -50%)' 
    },
  };

  const position = positions[placement];
  const maxWidth = window.innerWidth - 32;
  const left = Math.min(Math.max(16, parseFloat(position.left)), maxWidth);
  
  return {
    ...position,
    left: `${left}px`,
  };
};

export const walkthroughStyles = `
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  .animate-bounce-gentle {
    animation: bounce-gentle 2s infinite;
  }
  .hovering-help-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #007bff; /* Example blue color */
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensure it's on top */
    cursor: pointer;
  }
  .hovering-help-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
  }
`;

export const calculateWaterEfficiency = (
  waterHistory: WaterUsage[],
  weatherData: WeatherData[],
): number => {
  if (!waterHistory || waterHistory.length === 0) return 0;
  
  const waterUsage = waterHistory[waterHistory.length - 1];
  const waterDate = new Date(waterUsage.date).setHours(0, 0, 0, 0);
  
  const dayWeather = weatherData.find(w => 
    new Date(w.date).setHours(0, 0, 0, 0) === waterDate
  );
  const previousDayWeather = weatherData.find(w => 
    new Date(w.date).setHours(0, 0, 0, 0) === waterDate - 86400000 // 24 * 60 * 60 * 1000
  );

  let efficiencyScore = 100;

  if (dayWeather?.weather.toLowerCase().includes('rain')) {
    efficiencyScore *= 0.5;
  }

  if (previousDayWeather?.weather.toLowerCase().includes('rain')) {
    efficiencyScore *= 0.7;
  }

  if (dayWeather?.temp) {
    if (dayWeather.temp > 30) { 
      efficiencyScore *= 0.9;
    } else if (dayWeather.temp < 10) { 
      efficiencyScore *= 0.95;
    }
  }

  return efficiencyScore;
};

export const calculateSoilQualityScore = (farm: Farm): number => {
  let score = 70;

  if (farm.organicMatter) {
    score += farm.organicMatter * 5;
  }

  if (farm.soilPH) {
    const idealPH = 6.5;
    const phDifference = Math.abs(farm.soilPH - idealPH);
    score -= phDifference * 5;
  }

  if (farm.rotationHistory && farm.rotationHistory.length) {
    score += Math.min(15, farm.rotationHistory.length * 5);
  }

  return Math.max(0, Math.min(100, score));
};

export const calculateOrganicScore = (farm: Farm): number => {
  let score = 70;
  
  const totalFertilizerAmount = farm.fertilizerHistory.reduce((sum, f) => sum + f.amount, 0);
  const organicFertilizers = farm.fertilizerHistory.filter(f => 
    f.type?.toLowerCase().includes('organic') || 
    f.type?.toLowerCase().includes('manure') ||
    f.type?.toLowerCase().includes('compost')
  );
  
  const organicFertilizerAmount = organicFertilizers.reduce((sum, f) => sum + f.amount, 0);
  
  if (totalFertilizerAmount > 0) {
    const organicPercentage = organicFertilizerAmount / totalFertilizerAmount;
    score += (organicPercentage * 20);
    
    const chemicalFertilizerAmount = totalFertilizerAmount - organicFertilizerAmount;
    if (chemicalFertilizerAmount > 0) {
      const chemicalPenalty = Math.min(30, (chemicalFertilizerAmount / 1000) * 10);
      score -= chemicalPenalty;
    }
  }
  
  if (farm.rotationHistory && farm.rotationHistory.length) {
    score += Math.min(10, farm.rotationHistory.length * 2);
  }

  const consecutiveOrganicFertilizers = organicFertilizers.length;
  if (consecutiveOrganicFertilizers >= 3) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
};

export const calculateHarvestEfficiency = (farm: Farm, weatherData: WeatherData[]): number => {
  if (!farm.harvestHistory.length) return 0;

  let score = 100;
  
  const yields = farm.harvestHistory.map(h => h.amount);
  if (yields.length > 0) {
    const avgYield = yields.reduce((a, b) => a + b, 0) / yields.length;
    if (avgYield > 0) { // Avoid division by zero if avgYield is 0
        const yieldVariation = Math.sqrt(
            yields.reduce((acc, y) => acc + Math.pow(y - avgYield, 2), 0) / yields.length
        ) / avgYield;
        score -= yieldVariation * 20;
    }
  }

  farm.harvestHistory.forEach(harvest => {
    const harvestDate = new Date(harvest.date);
    const weatherOnDay = weatherData.find(w => 
      new Date(w.date).toDateString() === harvestDate.toDateString()
    );
    
    if (weatherOnDay?.weather.toLowerCase().includes('rain')) {
      score -= 5;
    }
  });

  return Math.min(100, Math.max(0, score));
};

export const calculateRotationScore = (farm: Farm): number => {
  if (!farm.rotationHistory?.length) return 0;
  
  let score = Math.min(100, farm.rotationHistory.length * 20);
  
  const uniqueCrops = new Set(farm.rotationHistory.map(r => r.crop)).size;
  score += Math.min(20, uniqueCrops * 5);
  
  return Math.min(100, score);
};

export const calculateSustainabilityMetrics = (
  farms: Farm[],
  weatherData: WeatherData[]
): SustainabilityMetrics | null => {
  if (farms.length === 0 || weatherData.length === 0) return null;

  const farmMetrics = farms.map(farm => ({
    waterEfficiency: calculateWaterEfficiency(farm.waterHistory, weatherData),
    organicScore: calculateOrganicScore(farm),
    harvestEfficiency: calculateHarvestEfficiency(farm, weatherData),
    soilQualityScore: calculateSoilQualityScore(farm),
    rotationScore: calculateRotationScore(farm),
  }));

  const avgMetrics: MetricsAccumulator = {
    waterEfficiency: 0,
    organicScore: 0,
    harvestEfficiency: 0,
    soilQualityScore: 0,
    rotationScore: 0
  };
  
  const metricCounts: MetricsAccumulator = {
    waterEfficiency: 0,
    organicScore: 0,
    harvestEfficiency: 0,
    soilQualityScore: 0,
    rotationScore: 0
  };

  farmMetrics.forEach(metrics => {
    Object.keys(metrics).forEach(key => {
      const typedKey = key as keyof typeof metrics;
      const value = metrics[typedKey];
      if (value > 0) { // Ensure only positive scores contribute
        avgMetrics[key] = (avgMetrics[key] || 0) + value;
        metricCounts[key]++;
      }
    });
  });

  const weights: MetricsAccumulator = {
    waterEfficiency: 0.25,
    organicScore: 0.20,
    harvestEfficiency: 0.20,
    soilQualityScore: 0.20,
    rotationScore: 0.15,
  };

  let totalWeight = 0;
  let overallScore = 0;

  Object.keys(avgMetrics).forEach(key => {
    const typedKey = key as keyof MetricsAccumulator;
    if (metricCounts[typedKey] > 0) {
      avgMetrics[typedKey] /= metricCounts[typedKey];
      overallScore += avgMetrics[typedKey] * weights[typedKey];
      totalWeight += weights[typedKey];
    } else {
      avgMetrics[typedKey] = 0; // Set to 0 if no data, or handle as per desired logic
    }
  });

  if (totalWeight > 0 && totalWeight < 1) {
    overallScore = overallScore / totalWeight; // Normalize if not all metrics contributed
  } else if (totalWeight === 0) {
    overallScore = 0; // Or handle as per desired logic if no metrics have data
  }

  return {
    overallScore: Math.round(overallScore),
    waterEfficiency: Math.round(avgMetrics.waterEfficiency),
    organicScore: Math.round(avgMetrics.organicScore),
    harvestEfficiency: Math.round(avgMetrics.harvestEfficiency),
    soilQualityScore: Math.round(avgMetrics.soilQualityScore),
    rotationScore: Math.round(avgMetrics.rotationScore),
  };
};

// Enhanced metrics calculator that includes tracker data
export const calculateSustainabilityMetricsWithTrackers = (
  farms: Farm[],
  weatherData: WeatherData[],
  _soilRecords: any[] = [],
  _emissionSources: any[] = [],
  _sequestrationActivities: any[] = [],
  _energyRecords: any[] = [],
  _fuelRecords: any[] = []
): SustainabilityMetrics => {
  // Get base metrics first
  const baseMetrics = calculateSustainabilityMetrics(farms, weatherData) || {
    overallScore: 0,
    waterEfficiency: 0,
    organicScore: 0,
    harvestEfficiency: 0,
    soilQualityScore: 0,
    rotationScore: 0
  };
  
  // Add tracker-based metrics with default values
  // In a real implementation, these would be calculated using the tracker data parameters
  return {
    ...baseMetrics,
    carbonFootprint: 50, 
    energyEfficiency: 50,
    fuelEfficiency: 50,
    renewablePercentage: 10,
    carbonIntensityPerAcre: 5
  };
}

export const getWeatherInfo = (code: number) => {
  switch (true) {
    case code <= 3: return { desc: 'Clear', icon: '☀️' };
    case code <= 48: return { desc: 'Cloudy', icon: '☁️' };
    case code <= 67: return { desc: 'Rain', icon: '🌧️' };
    case code <= 77: return { desc: 'Snow', icon: '❄️' };
    default: return { desc: 'Unknown', icon: '❓' };
  }
};
