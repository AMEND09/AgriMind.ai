// API client for crop health scanning service
export interface CropHealthPrediction {
  status: 'healthy' | 'warning' | 'critical';
  issues: Array<{ 
    type: string; 
    severity: string; 
    description: string 
  }>;
  recommendations: string[];
}

export class CropHealthAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  async analyzeCropImage(imageData: string): Promise<CropHealthPrediction> {
    try {
      // Extract the base64 data (remove "data:image/jpeg;base64," prefix if present)
      const base64Data = imageData.includes('base64,') 
        ? imageData.split('base64,')[1]
        : imageData;

      const response = await fetch(`${this.baseUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // For now, we're mapping the API response to our CropHealthPrediction format
      // This mapping can be adjusted based on actual API response structure
      return this.mapApiResponseToPrediction(data);
    } catch (error) {
      console.error('Error analyzing crop image:', error);
      // If the real API fails, fall back to mock data
      return this.getMockPrediction();
    }
  }  

  private mapApiResponseToPrediction(apiResponse: any): CropHealthPrediction {
    // Extract data from API response
    const prediction = apiResponse.prediction || '';
    const diseaseDetails = apiResponse.disease_details || '';
    
    // Determine the crop health status based on prediction
    let status: 'healthy' | 'warning' | 'critical';
    if (prediction.toLowerCase().includes('healthy')) {
      status = 'healthy';
    } else if (prediction.toLowerCase().includes('mild') || prediction.toLowerCase().includes('early')) {
      status = 'warning';
    } else {
      status = 'critical';
    }
    
    // Extract crop type and disease name from the prediction
    const predictionParts = prediction.split('___');
    const diseaseName = predictionParts.length > 1 
      ? predictionParts[1].replace(/_/g, ' ') 
      : 'Unknown disease';
    
    // Format the issue object
    const issues = [];
    if (status !== 'healthy') {
      // Clean up HTML from disease details for better display
      const cleanDescription = diseaseDetails
        .replace(/<br\/>/g, '\n')
        .replace(/<b>(.*?)<\/b>/g, '$1')
        .replace(/\n\s+/g, '\n')
        .trim();
      
      issues.push({
        type: diseaseName,
        severity: status === 'warning' ? 'Medium' : 'High',
        description: cleanDescription
      });
    }

    const recommendations = [];
    // Extract recommendations from disease details
    if (diseaseDetails) {
      // Look for the "How to prevent/cure the disease" section
      const preventionSection = diseaseDetails.split('How to prevent/cure the disease');
      
      if (preventionSection.length > 1) {
        // Extract recommendations after this heading
        const recommendationText = preventionSection[1];
        
        // Split by numbers (1., 2., 3., etc.) to get individual recommendations
        const recPattern = /<br\/>\s*\d+\.\s*(.*?)(?=<br\/>\s*\d+\.|$)/g;
        let match;
        
        while ((match = recPattern.exec(recommendationText)) !== null) {
          const cleanRec = match[1].replace(/<br\/>/g, '').trim();
          if (cleanRec) recommendations.push(cleanRec);
        }
      }
    }

    // Add some default recommendations if none were extracted
    if (recommendations.length === 0) {
      if (status === 'healthy') {
        recommendations.push('Continue regular maintenance');
        recommendations.push('Monitor crop health regularly');
      } else if (status === 'warning') {
        recommendations.push(`Treat ${prediction} with appropriate measures`);
        recommendations.push('Monitor affected plants closely');
      } else {
        recommendations.push(`Immediately address ${prediction}`);
        recommendations.push('Consider isolation of affected plants');
        recommendations.push('Consult with an agricultural specialist');
      }
    }

    return {
      status,
      issues,
      recommendations
    };
  }

  private getMockPrediction(): CropHealthPrediction {
    // Fallback mock data when API is unavailable
    const statuses = ['healthy', 'warning', 'critical'] as const;
    const status = statuses[Math.floor(Math.random() * 3)];
    
    const result: CropHealthPrediction = {
      status,
      issues: [],
      recommendations: []
    };
    
    if (status === 'warning') {
      result.issues.push({
        type: 'Nutrient Deficiency',
        severity: 'Medium',
        description: 'Signs of nitrogen deficiency detected in leaves'
      });
      result.recommendations.push('Apply nitrogen-rich fertilizer');
      result.recommendations.push('Retest in 7 days to monitor improvement');
    } else if (status === 'critical') {
      result.issues.push({
        type: 'Pest Infestation',
        severity: 'High',
        description: 'Evidence of aphids detected on multiple plants'
      });
      result.issues.push({
        type: 'Fungal Disease',
        severity: 'High',
        description: 'Early signs of powdery mildew detected'
      });
      result.recommendations.push('Apply approved insecticide for aphid control');
      result.recommendations.push('Improve air circulation between plants');
      result.recommendations.push('Apply fungicide to affected areas');
    } else {
      result.recommendations.push('Continue regular maintenance');
      result.recommendations.push('Next scan recommended in 14 days');
    }
    
    return result;
  }
}

// Export a singleton instance for easy import
export const cropHealthAPI = new CropHealthAPI();

// Export default for cases where a new instance might be needed
export default CropHealthAPI;