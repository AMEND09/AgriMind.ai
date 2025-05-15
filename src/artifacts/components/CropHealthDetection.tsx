import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DataStorage } from '@/services/DataStorage';
import { 
  Camera, 
  Upload as UploadIcon, 
  Leaf, 
  AlertTriangle, 
  History, 
  Zap, 
  RotateCw 
} from 'lucide-react';

interface CropHealthScan {
  id: number;
  farmId: number;
  imageUrl: string;
  date: string;
  status: 'healthy' | 'warning' | 'critical';
  issues: Array<{ type: string; severity: string; description: string }>;
  recommendations: string[];
}

interface CropHealthDetectionProps {
  farms: Array<{ id: number; name: string; crop: string }>;
}

const CropHealthDetection: React.FC<CropHealthDetectionProps> = ({ farms }) => {
  const [cropHealthScans, setCropHealthScans] = useState<CropHealthScan[]>(() => {
    return DataStorage.getData<CropHealthScan[]>('cropHealthScans', []);
  });

  const [selectedFarmForScan, setSelectedFarmForScan] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanningCrop, setIsScanningCrop] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<{
    status: 'healthy' | 'warning' | 'critical';
    issues: Array<{ type: string; severity: string; description: string }>;
    recommendations: string[];
  } | null>(null);

  // Save crop health scans
  useEffect(() => {
    DataStorage.setData('cropHealthScans', cropHealthScans);
  }, [cropHealthScans]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScanCrop = () => {
    if (!selectedFarmForScan || !uploadedImage) return;
    
    setIsScanningCrop(true);
    
    // Simulate scan processing - this would be replaced with actual API call
    setTimeout(() => {
      const mockResult = {
        status: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)] as 'healthy' | 'warning' | 'critical',
        issues: [] as Array<{ type: string; severity: string; description: string }>,
        recommendations: [] as string[]
      };
      
      // Generate mock issues based on status
      if (mockResult.status === 'warning') {
        mockResult.issues.push({
          type: 'Nutrient Deficiency',
          severity: 'Medium',
          description: 'Signs of nitrogen deficiency detected in leaves'
        });
        mockResult.recommendations.push('Apply nitrogen-rich fertilizer');
        mockResult.recommendations.push('Retest in 7 days to monitor improvement');
      } else if (mockResult.status === 'critical') {
        mockResult.issues.push({
          type: 'Pest Infestation',
          severity: 'High',
          description: 'Evidence of aphids detected on multiple plants'
        });
        mockResult.issues.push({
          type: 'Fungal Disease',
          severity: 'High',
          description: 'Early signs of powdery mildew detected'
        });
        mockResult.recommendations.push('Apply approved insecticide for aphid control');
        mockResult.recommendations.push('Improve air circulation between plants');
        mockResult.recommendations.push('Apply fungicide to affected areas');
      } else {
        mockResult.recommendations.push('Continue regular maintenance');
        mockResult.recommendations.push('Next scan recommended in 14 days');
      }
      
      setScanResults(mockResult);
      
      // Add to history
      const newScan = {
        id: Date.now(),
        farmId: parseInt(selectedFarmForScan),
        imageUrl: uploadedImage,
        date: new Date().toISOString(),
        status: mockResult.status,
        issues: mockResult.issues,
        recommendations: mockResult.recommendations
      };
      
      setCropHealthScans(prev => [...prev, newScan]);
      setIsScanningCrop(false);
    }, 2500); // Simulate 2.5 second processing time
  };

  const resetScanForm = () => {
    setSelectedFarmForScan('');
    setUploadedImage(null);
    setScanResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Crop Health Detection</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setScanResults(null)}
            disabled={!scanResults}
          >
            New Scan
          </Button>
        </div>
      </div>
      
      {!scanResults ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                <span>Upload Crop Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmSelect">Select Farm</Label>
                <select 
                  id="farmSelect"
                  className="w-full p-2 border rounded"
                  value={selectedFarmForScan}
                  onChange={(e) => setSelectedFarmForScan(e.target.value)}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name} ({farm.crop})</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition ${
                    uploadedImage ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  onClick={() => document.getElementById('cropImageInput')?.click()}
                >
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage} 
                        alt="Crop preview" 
                        className="max-h-48 mx-auto rounded"
                      />
                      <p className="text-sm text-green-600">Image uploaded successfully</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadIcon className="h-10 w-10 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-500">Click to upload crop image</p>
                      <p className="text-xs text-gray-400">JPG, PNG, or WebP</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="cropImageInput"
                    accept="image/*"
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={handleScanCrop}
                disabled={!selectedFarmForScan || !uploadedImage || isScanningCrop}
              >
                {isScanningCrop ? (
                  <>
                    <span className="animate-spin mr-2">
                      <RotateCw className="h-4 w-4" />
                    </span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze Crop Health
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <span>Recent Scans</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cropHealthScans.length > 0 ? (
                  cropHealthScans.slice(-5).reverse().map(scan => (
                    <div 
                      key={scan.id} 
                      className="flex items-center gap-4 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => setScanResults({
                        status: scan.status,
                        issues: scan.issues,
                        recommendations: scan.recommendations
                      })}
                    >
                      <div className="h-12 w-12 rounded overflow-hidden">
                        <img 
                          src={scan.imageUrl} 
                          alt="Crop scan" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">
                          {farms.find(f => f.id === scan.farmId)?.name || 'Unknown Farm'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(scan.date).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          scan.status === 'healthy' ? 'bg-green-100 text-green-800' :
                          scan.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {scan.status === 'healthy' ? 'Healthy' :
                           scan.status === 'warning' ? 'Warning' :
                           'Critical'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <AlertTriangle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p>No scan history available</p>
                    <p className="text-sm">Upload an image to analyze crop health</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Scan Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded crop" 
                      className="w-full rounded"
                    />
                  )}
                  <div className="mt-4">
                    <p className="text-sm font-medium">Farm</p>
                    <p className="text-sm text-gray-500">
                      {farms.find(f => f.id === parseInt(selectedFarmForScan))?.name}
                    </p>
                    
                    <p className="text-sm font-medium mt-2">Date</p>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleString()}
                    </p>
                    
                    <p className="text-sm font-medium mt-2">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      scanResults.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      scanResults.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {scanResults.status === 'healthy' ? 'Healthy' :
                       scanResults.status === 'warning' ? 'Warning' :
                       'Critical'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {scanResults.issues.length > 0 ? (
                    <div className="space-y-4">
                      <p className="font-medium">Detected Issues</p>
                      <div className="space-y-2">
                        {scanResults.issues.map((issue, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between">
                              <p className="font-medium">{issue.type}</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                issue.severity === 'Low' ? 'bg-blue-100 text-blue-800' :
                                issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {issue.severity} Severity
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                      <p className="font-medium">No issues detected</p>
                      <p className="text-sm mt-1">Your crops appear to be healthy.</p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <p className="font-medium">Recommendations</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {scanResults.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      className="w-full"
                      onClick={resetScanForm}
                    >
                      Start New Scan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropHealthDetection;
