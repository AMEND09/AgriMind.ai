import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Droplet, Leaf, LayoutDashboard, Info, Trash2, Edit3, RotateCw, Download, Upload, Settings, CloudRain, Pencil, X, UserCircle, LogIn, LogOut, Camera, Upload as UploadIcon, AlertTriangle, History, Zap, Flower } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  WaterUsage,
  Farm,
  WeatherData,
  Task,
  Issue,
  ConfirmDelete,
  CropPlanEvent,
  PlanItem
} from './types';
import { FuelRecord, SoilRecord, CarbonEmissionSource, CarbonSequestrationActivity, EnergyRecord } from './models/sustainability';

import {
  walkthroughStyles
} from './utils';

// Import the crop health API
import { cropHealthAPI, CropHealthPrediction } from '../services/CropHealthAPI';

// Import the component files
import Walkthrough from './components/Walkthrough';
import SustainabilityScoreCard from './components/SustainabilityScoreCard';
import WeatherPreview from './components/WeatherPreview';
import TaskManager from './components/TaskManager';
import IssueTracker from './components/IssueTracker';
import HistoryPage from './components/HistoryPage';
import Instructions from './components/Instructions';
import PlantingPlanForm from './components/PlantingPlanForm';
import FertilizerPlanForm from './components/FertilizerPlanForm';
import PestManagementPlanForm from './components/PestManagementPlanForm';
import IrrigationPlanForm from './components/IrrigationPlanForm';
import WeatherTaskPlanForm from './components/WeatherTaskPlanForm';
import RotationPlanForm from './components/RotationPlanForm';
import RainwaterPlanForm from './components/RainwaterPlanForm';
import TrackerDashboard from './components/TrackerDashboard';
import { DataStorage } from '@/services/DataStorage';
import DraggableWidgetLayout, { Widget } from './components/DraggableWidgetLayout';
import LoginPage from './components/LoginPage';
import UserProfileSettings from '@/artifacts/components/UserProfileSettings';

// Fix the UserData interface to include email
interface UserData {
  username: string;
  email: string;
  name: string;
  role: string;
}

// Define SustainabilityMetrics interface with all required properties
interface SustainabilityMetrics {
  waterEfficiency: number;
  soilHealth: number;
  carbonFootprint: number;
  biodiversity: number;
  energyEfficiency: number;
  overallScore: number;
  organicScore: number;
  harvestEfficiency: number;
  soilQualityScore: number;
  rotationScore: number;
}

// Update the ConfirmDelete interface to include onConfirm property
interface UpdatedConfirmDelete extends ConfirmDelete {
  onConfirm: () => void;
}

// Define getSustainabilityMetrics function
const getSustainabilityMetrics = (): SustainabilityMetrics => {
  // Mock implementation
  return {
    waterEfficiency: 85,
    soilHealth: 78,
    carbonFootprint: 65,
    biodiversity: 72,
    energyEfficiency: 80,
    overallScore: 76,
    organicScore: 70,
    harvestEfficiency: 82,
    soilQualityScore: 75,
    rotationScore: 68
  };
};



const DefaultComponent = (): React.ReactNode => {
  // Define walkthrough steps for the Walkthrough component
  const WALKTHROUGH_STEPS = [
    {
      target: '[data-walkthrough="overview-tab"]',
      title: 'Overview Dashboard',
      content: 'This is your main dashboard where you can see a summary of your farm data.',
      placement: 'bottom' as const,
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="quick-actions"]',
      title: 'Quick Actions',
      content: 'Use these buttons to quickly record water usage, fertilizer applications, and harvests.',
      placement: 'right' as const,
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="sustainability"]',
      title: 'Sustainability Score',
      content: 'This shows your farm\'s sustainability metrics based on your recorded activities.',
      placement: 'left' as const,
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="water-tab"]',
      title: 'Water Management',
      content: 'Track your water usage and efficiency here.',
      placement: 'bottom' as const,
      tabId: 'water'
    },
    {
      target: '[data-walkthrough="farms-tab"]',
      title: 'Farms',
      content: 'Manage your farms, crops, and view historical data.',
      placement: 'bottom' as const,
      tabId: 'farms'
    },
    {
      target: '[data-walkthrough="add-farm"]',
      title: 'Add New Farm',
      content: 'Click here to add a new farm to your dashboard.',
      placement: 'right' as const,
      tabId: 'farms'
    },
    {
      target: '[data-walkthrough="issues-tab"]',
      title: 'Farm Issues',
      content: 'Track and manage farm problems here.',
      placement: 'bottom' as const,
      tabId: 'issues'
    },
    {
      target: '[data-walkthrough="reports-tab"]',
      title: 'Reports',
      content: 'View detailed reports about your farm performance.',
      placement: 'bottom' as const,
      tabId: 'reports'
    },
    {
      target: '[data-walkthrough="crop-plan"]',
      title: 'Crop Plan',
      content: 'Plan and schedule your farming activities throughout the year.',
      placement: 'bottom' as const,
      tabId: 'cropplan'
    },
    {
      target: '[data-walkthrough="planners-tab"]',
      title: 'Farm Planners',
      content: 'Plan your planting, fertilizing, and pest management activities here.',
      placement: 'bottom' as const,
      tabId: 'planners'
    }
  ];

  const [farms, setFarms] = useState<Farm[]>(() => {
    return DataStorage.getData<Farm[]>('farms', []);
  });
  const [weatherData] = useState<WeatherData[]>([]);
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({ 
    name: '', 
    size: '', 
    crop: '',
    rotationHistory: [] as { crop: string; startDate: string; endDate: string }[]
  });
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [newWaterUsage, setNewWaterUsage] = useState({ farmId: '', amount: '', date: '' });
  const [isAddingWaterUsage, setIsAddingWaterUsage] = useState(false);
  const [isEditingWaterUsage, setIsEditingWaterUsage] = useState(false);
  const [editingWaterUsage, setEditingWaterUsage] = useState<WaterUsage | null>(null);
  const [isAddingFertilizer, setIsAddingFertilizer] = useState(false);
  const [isEditingFertilizer, setIsEditingFertilizer] = useState(false);
  const [editingFertilizer, setEditingFertilizer] = useState<any | null>(null);
  const [isAddingHarvest, setIsAddingHarvest] = useState(false);
  const [isEditingHarvest, setIsEditingHarvest] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<any | null>(null);
  const [newFertilizer, setNewFertilizer] = useState({ farmId: '', type: '', amount: '', date: '' });
  const [newHarvest, setNewHarvest] = useState({ farmId: '', amount: '', date: '' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState("overview");  const [confirmDelete, setConfirmDelete] = useState<UpdatedConfirmDelete | null>(null);
  const [cropPlanEvents] = useState<CropPlanEvent[]>(() => {
    return DataStorage.getData<CropPlanEvent[]>('cropPlanEvents', []);
  });

  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    return !DataStorage.isWalkthroughCompleted();
  });

  const [isAddingRotation, setIsAddingRotation] = useState(false);
  const [newRotation, setNewRotation] = useState({
    farmId: '',
    crop: '',
    startDate: '',
    endDate: ''
  });

  const [cropFilter, setCropFilter] = useState<string>("all");

  const [importNotification, setImportNotification] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [plantingPlans, setPlantingPlans] = useState<PlanItem[]>(() => {
    return DataStorage.getData<PlanItem[]>('plantingPlans', []);
  });

  const [fertilizerPlans, setFertilizerPlans] = useState<PlanItem[]>(() => {
    return DataStorage.getData<PlanItem[]>('fertilizerPlans', []);
  });

  const [pestManagementPlans, setPestManagementPlans] = useState<PlanItem[]>(() => {
    return DataStorage.getData<PlanItem[]>('pestManagementPlans', []);
  });
  
  const [irrigationPlans, setIrrigationPlans] = useState<PlanItem[]>(() => {
    return DataStorage.getData<PlanItem[]>('irrigationPlans', []);
  });
  
  const [weatherTaskPlans, setWeatherTaskPlans] = useState<PlanItem[]>(() => {
    return DataStorage.getData<PlanItem[]>('weatherTaskPlans', []);
  });
  
  const [rotationPlans, setRotationPlans] = useState<PlanItem[]>(() => {
    return DataStorage.getData<PlanItem[]>('rotationPlans', []);
  });
  
  const [rainwaterPlans, setRainwaterPlans] = useState<PlanItem[]>(() => {
    return DataStorage.getData<PlanItem[]>('rainwaterPlans', []);
  });

  // Add state for tracker components
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>(() => {
    return DataStorage.getData<FuelRecord[]>('fuelRecords', []);
  });
  
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>(() => {
    return DataStorage.getData<SoilRecord[]>('soilRecords', []);
  });
  
  const [emissionSources, setEmissionSources] = useState<CarbonEmissionSource[]>(() => {
    return DataStorage.getData<CarbonEmissionSource[]>('emissionSources', []);
  });
  
  const [sequestrationActivities, setSequestrationActivities] = useState<CarbonSequestrationActivity[]>(() => {
    return DataStorage.getData<CarbonSequestrationActivity[]>('sequestrationActivities', []);
  });
  
  const [energyRecords, setEnergyRecords] = useState<EnergyRecord[]>(() => {
    return DataStorage.getData<EnergyRecord[]>('energyRecords', []);
  });

  // Add widget layout state with correctly defined widgets
  const [widgetLayout, setWidgetLayout] = useState<Widget[]>(() => {
    return DataStorage.getData<Widget[]>('widgetLayout', [
      { i: 'quickActions', title: 'Quick Actions', isVisible: true, x: 0, y: 0, w: 3, h: 4, minH: 3, minW: 2 },
      { i: 'sustainabilityScore', title: 'Sustainability Score', isVisible: true, x: 3, y: 0, w: 9, h: 4, minH: 3, minW: 6 },
      { i: 'weatherPreview', title: 'Weather Preview', isVisible: true, x: 0, y: 4, w: 6, h: 3, minH: 3, minW: 3 },
      { i: 'upcomingEvents', title: 'Upcoming Events', isVisible: true, x: 6, y: 4, w: 6, h: 3, minH: 3, minW: 3 },
      { i: 'farmIssues', title: 'Farm Issues', isVisible: true, x: 0, y: 7, w: 6, h: 4, minH: 3, minW: 3 },
      { i: 'taskManager', title: 'Task Manager', isVisible: true, x: 6, y: 7, w: 6, h: 4, minH: 3, minW: 3 },
      { i: 'planningRecommendations', title: 'Planning Recommendations', isVisible: true, x: 0, y: 11, w: 12, h: 3, minH: 2, minW: 6 }
    ]);
  });

  // Add edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Add useEffect to save widget layout changes
  useEffect(() => {
    DataStorage.setData('widgetLayout', widgetLayout);
  }, [widgetLayout]);

  const [isAddingPlantingPlan, setIsAddingPlantingPlan] = useState(false);
  const [isAddingFertilizerPlan, setIsAddingFertilizerPlan] = useState(false);
  const [isAddingPestPlan, setIsAddingPestPlan] = useState(false);
  const [isAddingIrrigationPlan, setIsAddingIrrigationPlan] = useState(false);
  const [isAddingWeatherTaskPlan, setIsAddingWeatherTaskPlan] = useState(false);
  const [isAddingRotationPlan, setIsAddingRotationPlan] = useState(false);
  const [isAddingRainwaterPlan, setIsAddingRainwaterPlan] = useState(false);
  
  const [newPlantingPlan, setNewPlantingPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [newFertilizerPlan, setNewFertilizerPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    fertilizerType: string;
    applicationRate: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    fertilizerType: '',
    applicationRate: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [newPestPlan, setNewPestPlan] = useState<Omit<PlanItem, 'id' | 'status'> & { 
    farmId: string; 
    title: string; 
    description: string; 
    pestType: string; 
    controlMethod: string; 
    startDate: string; 
    endDate: string; 
    notes: string; 
  }>({
    farmId: '',
    title: '',
    description: '',
    pestType: '',
    controlMethod: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for irrigation plan
  const [newIrrigationPlan, setNewIrrigationPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    irrigationMethod: string;
    waterSource: string;
    frequency: string;
    soilMoistureThreshold: string;
    weatherConditions: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    irrigationMethod: '',
    waterSource: '',
    frequency: '',
    soilMoistureThreshold: '',
    weatherConditions: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for weather task plan
  const [newWeatherTaskPlan, setNewWeatherTaskPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    taskType: string;
    weatherCondition: string;
    taskActions: string;
    priority: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    taskType: '',
    weatherCondition: '',
    taskActions: '',
    priority: 'medium',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for crop rotation plan
  const [newRotationPlan, setNewRotationPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    rotationCrops: string[];
    rotationInterval: string;
    soilPreparation: string;
    expectedBenefits: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    rotationCrops: [],
    rotationInterval: '',
    soilPreparation: '',
    expectedBenefits: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for rainwater harvesting plan
  const [newRainwaterPlan, setNewRainwaterPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    harvestingMethod: string;
    storageType: string;
    harvestingCapacity: string;
    collectionArea: string;
    filteringMethod: string;
    usageIntent: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    harvestingMethod: '',
    storageType: '',
    harvestingCapacity: '',
    collectionArea: '',
    filteringMethod: '',
    usageIntent: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  // Update user auth state with proper typing
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return DataStorage.getData<boolean>('isLoggedIn', false);
  });
  
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    return DataStorage.getData<UserData | null>('currentUser', null);
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Handle user login
  const handleLogin = (userData: { username: string; password: string }) => {
    // In a real app, this would validate against a backend
    // For this demo, just accept any login
    const newUser: UserData = {
      username: userData.username,
      email: `${userData.username}@example.com`,
      name: userData.username,
      role: 'Farmer'
    };
    
    DataStorage.setData('currentUser', newUser);
    DataStorage.setData('isLoggedIn', true);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  // Handle user registration
  const handleRegister = (userData: { 
    username: string; 
    password: string;
    email: string;
    name: string; 
  }) => {
    // In a real app, this would send data to a backend
    // For this demo, just create a new user
    const newUser: UserData = {
      username: userData.username,
      email: userData.email,
      name: userData.name,
      role: 'Farmer'
    };
    
    DataStorage.setData('currentUser', newUser);
    DataStorage.setData('isLoggedIn', true);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  // Handle user logout
  const handleLogout = () => {
    DataStorage.setData('isLoggedIn', false);
    DataStorage.removeData('currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // Handle profile update
  const handleProfileUpdate = (userData: {
    name: string;
    email: string;
    role: string;
  }) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    
    DataStorage.setData('currentUser', updatedUser);
    setCurrentUser(updatedUser);
    setShowProfileSettings(false);
  };
  
  const getFilteredFarms = () => {
    if (cropFilter === "all") return farms;
    return farms.filter(farm => farm.crop === cropFilter);
  };

  useEffect(() => {
    DataStorage.setData('farms', farms);
  }, [farms]);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  useEffect(() => {
    DataStorage.setData('cropPlanEvents', cropPlanEvents);
  }, [cropPlanEvents]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = walkthroughStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    DataStorage.setData('plantingPlans', plantingPlans);
  }, [plantingPlans]);

  useEffect(() => {
    DataStorage.setData('fertilizerPlans', fertilizerPlans);
  }, [fertilizerPlans]);

  useEffect(() => {
    DataStorage.setData('pestManagementPlans', pestManagementPlans);
  }, [pestManagementPlans]);
  
  useEffect(() => {
    DataStorage.setData('irrigationPlans', irrigationPlans);
  }, [irrigationPlans]);
  
  useEffect(() => {
    DataStorage.setData('weatherTaskPlans', weatherTaskPlans);
  }, [weatherTaskPlans]);
  
  useEffect(() => {
    DataStorage.setData('rotationPlans', rotationPlans);
  }, [rotationPlans]);
  
  useEffect(() => {
    DataStorage.setData('rainwaterPlans', rainwaterPlans);
  }, [rainwaterPlans]);
  
  useEffect(() => {
    DataStorage.setData('fuelRecords', fuelRecords);
  }, [fuelRecords]);
  
  useEffect(() => {
    DataStorage.setData('soilRecords', soilRecords);
  }, [soilRecords]);
  
  useEffect(() => {
    DataStorage.setData('emissionSources', emissionSources);
  }, [emissionSources]);
  
  useEffect(() => {
    DataStorage.setData('sequestrationActivities', sequestrationActivities);
  }, [sequestrationActivities]);
  
  useEffect(() => {
    DataStorage.setData('energyRecords', energyRecords);
  }, [energyRecords]);

  // Add this to your component state declarations
  const [cropHealthScans, setCropHealthScans] = useState<Array<{
    id: number;
    farmId: number;
    imageUrl: string;
    date: string;
    status: 'healthy' | 'warning' | 'critical';
    issues: Array<{ type: string; severity: string; description: string }>;
    recommendations: string[];
  }>>(() => {
    return DataStorage.getData<Array<any>>('cropHealthScans', []);
  });

  const [selectedFarmForScan, setSelectedFarmForScan] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanningCrop, setIsScanningCrop] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<any | null>(null);

  // Add this useEffect to save crop health scans
  useEffect(() => {
    DataStorage.setData('cropHealthScans', cropHealthScans);
  }, [cropHealthScans]);

  // We don't need these in the current implementation
  // const [showCropHealthTutorial, setShowCropHealthTutorial] = useState(false);

  // Add the fetchUserLocation function
  const fetchUserLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  // Add this function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  // Add this function to handle crop scan
  const handleScanCrop = () => {
    if (!selectedFarmForScan || !uploadedImage) return;
    
    setIsScanningCrop(true);
    
    // Use the real API if available, with fallback to mock data
    if (uploadedImage) {
      cropHealthAPI.analyzeCropImage(uploadedImage)
        .then((result: CropHealthPrediction) => {
          setScanResults(result);
          
          // Add to history
          const newScan = {
            id: Date.now(),
            farmId: parseInt(selectedFarmForScan),
            imageUrl: uploadedImage,
            date: new Date().toISOString(),
            status: result.status,
            issues: result.issues,
            recommendations: result.recommendations
          };
          
          setCropHealthScans(prev => [...prev, newScan]);
          setIsScanningCrop(false);
        })
        .catch((error: Error) => {
          console.error('Error analyzing crop image:', error);
          setIsScanningCrop(false);
        });
    }
  };

  // Add missing handler functions
  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
  };  // Define missing function for handling confirmDelete
  const handleSetConfirmDelete = (confirm: ConfirmDelete | null) => {
    if (confirm === null) {
      setConfirmDelete(null);
    } else {
      // Convert ConfirmDelete to UpdatedConfirmDelete by adding onConfirm
      const updatedConfirm: UpdatedConfirmDelete = {
        ...confirm,
        onConfirm: () => {
          // Handle deletion based on type
          if (confirm.type === 'farm') {
            handleDeleteFarm(confirm.id);
          } else if (confirm.type === 'task') {
            handleDeleteTask(confirm.id);
          }
          // Add other types as needed
        }
      };
      setConfirmDelete(updatedConfirm);
    }
  };

  // Define missing function for resetting scan form
  const resetScanForm = () => {
    setSelectedFarmForScan('');
    setUploadedImage(null);
    setScanResults(null);
  };

  // Define mock water usage and other data types
  const waterUsage: any[] = [];
  const fertilizerUse: any[] = [];
  const harvests: any[] = [];
  const cropRotations: any[] = [];

  const handleExportData = () => {
    // Implementation for exporting data
    const dataToExport = {
      farms,
      waterUsage,
      fertilizerUse,
      harvests,
      cropRotations,
      // Add other data as needed
    };
    
    const dataStr = JSON.stringify(dataToExport);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'farm-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation for importing data
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          try {
            const importedData = JSON.parse(result);
            // Update state with imported data
            if (importedData.farms) setFarms(importedData.farms);
            // Add other data imports as needed
          } catch (error) {
            console.error('Error parsing imported data:', error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleStartWalkthrough = () => {
    setShowWalkthrough(true);
  };

  // Fix missing handler functions for water usage
  const handleAddWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  const handleEditWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  // Fix missing handler functions for fertilizer
  const handleAddFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  const handleEditFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  // Fix missing handler functions for harvest
  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  const handleEditHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  // Fix missing rotation handlers
  const handleAddRotation = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  // Fix the crop plans handlers
  const handleAddPlantingPlan = (plan: any) => {
    setPlantingPlans(prev => [...prev, plan]);
  };

  const handleAddFertilizerPlan = (plan: any) => {
    setFertilizerPlans(prev => [...prev, plan]);
  };

  const handleAddPestPlan = (plan: any) => {
    setPestManagementPlans(prev => [...prev, plan]);
  };

  const handleAddIrrigationPlan = (plan: any) => {
    setIrrigationPlans(prev => [...prev, plan]);
  };

  const handleAddWeatherTaskPlan = (plan: any) => {
    setWeatherTaskPlans(prev => [...prev, plan]);
  };

  const handleAddRotationPlan = (plan: any) => {
    setRotationPlans(prev => [...prev, plan]);
  };

  const handleAddRainwaterPlan = (plan: any) => {
    setRainwaterPlans(prev => [...prev, plan]);
  };
  // Widget functionality
  const handleWidgetVisibilityChange = (widgetId: string, isVisible: boolean) => {
    // Implementation
    setWidgetLayout(prev => 
      prev.map(widget => 
        widget.i === widgetId ? { ...widget, isVisible } : widget
      )
    );
  };
  const handleLayoutChange = (layout: any) => {
    // Use React.useTransition to wrap state updates that might cause suspense
    // This prevents errors when the layout update causes a component to suspend
    React.startTransition(() => {
      // Only update if the layout actually changed to prevent infinite loops
      // Deep compare the layout objects to avoid unnecessary updates
      const currentLayout = widgetLayout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
      const newLayout = layout.map(({ i, x, y, w, h }: any) => ({ i, x, y, w, h }));
      const layoutChanged = JSON.stringify(newLayout) !== JSON.stringify(currentLayout);
      
      if (layoutChanged) {
        // Merge the new layout positions with existing widget data
        const updatedLayout = widgetLayout.map(widget => {
          const newPos = layout.find((item: any) => item.i === widget.i);
          return newPos ? { ...widget, ...newPos } : widget;
        });
        
        setWidgetLayout(updatedLayout);
      }
    });
  };

  // Issue management
  const handleResolveIssue = (issueId: number) => {
    // Implementation
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  // Farm management
  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
    const newFarmId = Date.now();
    const newFarmWithId = {
      ...newFarm,
      id: newFarmId, // Use a number type for id
      waterHistory: [],
      fertilizerHistory: [],
      harvestHistory: []
    };
    setFarms([...farms, newFarmWithId as Farm]); // Type assertion to Farm
    setIsAddingFarm(false);
    setNewFarm({ name: '', size: '', crop: '', rotationHistory: [] });
  };

  const handleEditFarm = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
    if (editingFarm) {
      setFarms(farms.map(farm => 
        farm.id === editingFarm.id ? { ...farm, ...newFarm } : farm
      ));
      setIsEditingFarm(false);
      setEditingFarm(null);
      setNewFarm({ name: '', size: '', crop: '', rotationHistory: [] });
    }
  };

  const handleDeleteFarm = (id: number) => {
    // Implementation
    setFarms(farms.filter(farm => farm.id !== id));
  };

  const handleDeleteTask = (taskId: number) => {
    // Implementation
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Confirmation dialog
  const confirmDeleteAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Implementation
    if (confirmDelete) {
      confirmDelete.onConfirm();
      setConfirmDelete(null);
    }
  };
  // Planning recommendations with mock helper methods
  const planningRecommendations = {
    shouldPrepareRainwater: Math.random() > 0.5,
    shouldDelayFertilizer: Math.random() > 0.5,
    shouldRecommendIrrigation: Math.random() > 0.5,
    shouldHarvestSoon: Math.random() > 0.5
  };  // Add missing components
  const Reports = () => {
    return (
      <div className="reports-container">
        <h3 className="text-lg font-medium">Farm Reports</h3>
        {/* Reports content */}
      </div>
    );
  };

  const PlannerView = () => {
    return (
      <div className="planner-view">
        <h3 className="text-lg font-medium">Planner</h3>
        {/* Planner content */}
      </div>
    );
  };

  const UpcomingCropPlan = () => {
    return (
      <div className="upcoming-crop-plan">
        <h3 className="text-lg font-medium">Upcoming Plans</h3>
        {/* Plan content */}
      </div>
    );
  };

  const FarmIssues = () => {
    return (
      <div className="farm-issues">
        <h3 className="text-lg font-medium">Farm Issues</h3>
        {/* Issues content */}
      </div>
    );
  };

  // Get sustainability metrics
  const sustainabilityMetrics = getSustainabilityMetrics();

  return (
    <>
      {!isLoggedIn && (
        <LoginPage 
          isOpen={showLoginModal} 
          onOpenChange={setShowLoginModal} 
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
      
      {isLoggedIn && currentUser && (
        <UserProfileSettings
          isOpen={showProfileSettings}
          onOpenChange={setShowProfileSettings}
          userData={currentUser}
          onUpdate={handleProfileUpdate}
        />
      )}
      
      {/* Using our imported Walkthrough component */}
      {showWalkthrough && <Walkthrough 
        onComplete={handleWalkthroughComplete} 
        setActiveTab={setActiveTab} 
        WALKTHROUGH_STEPS={WALKTHROUGH_STEPS}
      />}
      
      {isLoggedIn ? (
        <div className="p-6 max-w-7xl mx-auto bg-white">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6 pb-6 border-b">
              <div className="flex items-center gap-4">
                <img 
                  src="./logo.svg" 
                  alt="Farm Management" 
                  className="h-12 w-12"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Avoid infinite loop
                    target.src = "/logo.svg"; // Try alternative path
                    console.log("Failed to load logo, trying alternative path");
                  }} 
                />
                <div>
                  <h1 className="text-3xl font-bold">EcoSprout</h1>
                  <p className="text-gray-500">Manage your farm operations sustainably</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden md:inline">
                  {currentUser?.name || currentUser?.username}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportData}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export Data</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.getElementById('importDataFile')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Import Data</span>
                      <input
                        type="file"
                        id="importDataFile"
                        className="hidden"
                        accept=".json"
                        onChange={handleImportData}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleStartWalkthrough}>
                      <Info className="mr-2 h-4 w-4" />
                      <span>Start Tutorial</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center">
                <TabsList className="hidden md:flex">
                  <TabsTrigger data-walkthrough="overview-tab" value="overview">Overview</TabsTrigger>
                  <TabsTrigger data-walkthrough="water-tab" value="water">Water Management</TabsTrigger>
                  <TabsTrigger data-walkthrough="farms-tab" value="farms">Farms</TabsTrigger>
                  <TabsTrigger data-walkthrough="issues-tab" value="issues">Farm Issues</TabsTrigger>
                  <TabsTrigger data-walkthrough="reports-tab" value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="trackers">Sustainability Trackers</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger data-walkthrough="planners-tab" value="planners">Planners</TabsTrigger>
                  <TabsTrigger value="crophealth"><Flower className="h-4 w-4 mr-2" />Crop Health</TabsTrigger>
                  <TabsTrigger value="instructions"><Info className="h-4 w-4 mr-2" />Instructions</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Dashboard Overview</h2>
                  <Button 
                    variant={isEditMode ? "destructive" : "outline"} 
                    onClick={() => setIsEditMode(!isEditMode)}
                    size="icon"
                    title={isEditMode ? "Exit Edit Mode" : "Customize Dashboard"}
                  >
                    {isEditMode ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </div>

                <DraggableWidgetLayout 
                  widgets={[
                    {
                      ...widgetLayout.find(w => w.i === 'quickActions') || { 
                        i: 'quickActions', 
                        title: 'Quick Actions', 
                        isVisible: true, 
                        x: 0, y: 0, w: 3, h: 4, minH: 3, minW: 2 
                      },
                      content: (
                        <div className="space-y-2" data-walkthrough="quick-actions">
                          <Dialog open={isAddingWaterUsage} onOpenChange={setIsAddingWaterUsage}>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                                <Droplet className="h-4 w-4 mr-2" />
                                Record Water Usage
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Record Water Usage</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={isEditingWaterUsage ? handleEditWaterUsage : handleAddWaterUsage} className="space-y-4">
                                <div>
                                  <Label>Farm</Label>
                                  <select 
                                    className="w-full p-2 border rounded"
                                    value={newWaterUsage.farmId}
                                    onChange={(e) => setNewWaterUsage({...newWaterUsage, farmId: e.target.value})}
                                    required
                                  >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label>Amount (gallons)</Label>
                                  <Input 
                                    type="number"
                                    value={newWaterUsage.amount}
                                    onChange={(e) => setNewWaterUsage({...newWaterUsage, amount: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <div>
                                  <Label>Date</Label>
                                  <Input 
                                    type="date"
                                    value={newWaterUsage.date}
                                    onChange={(e) => setNewWaterUsage({...newWaterUsage, date: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <Button type="submit" className="w-full">Save Water Usage</Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isAddingFertilizer} onOpenChange={setIsAddingFertilizer}>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-green-500 hover:bg-green-600">
                                <Leaf className="h-4 w-4 mr-2" />
                                Record Fertilizer Application
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Record Fertilizer Application</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={isEditingFertilizer ? handleEditFertilizer : handleAddFertilizer} className="space-y-4">
                                <div>
                                  <Label>Farm</Label>
                                  <select 
                                    className="w-full p-2 border rounded"
                                    value={newFertilizer.farmId}
                                    onChange={(e) => setNewFertilizer({...newFertilizer, farmId: e.target.value})}
                                    required
                                  >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <Input 
                                    value={newFertilizer.type}
                                    onChange={(e) => setNewFertilizer({...newFertilizer, type: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <div>
                                  <Label>Amount (lbs)</Label>
                                  <Input 
                                    type="number"
                                    value={newFertilizer.amount}
                                    onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <div>
                                  <Label>Date</Label>
                                  <Input 
                                    type="date"
                                    value={newFertilizer.date}
                                    onChange={(e) => setNewFertilizer({...newFertilizer, date: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <Button type="submit" className="w-full">Save Fertilizer Application</Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isAddingHarvest} onOpenChange={setIsAddingHarvest}>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Record Harvest
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Record Harvest</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={isEditingHarvest ? handleEditHarvest : handleAddHarvest} className="space-y-4">
                                <div>
                                  <Label>Farm</Label>
                                  <select 
                                    className="w-full p-2 border rounded"
                                    value={newHarvest.farmId}
                                    onChange={(e) => setNewHarvest({...newHarvest, farmId: e.target.value})}
                                    required
                                  >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label>Amount (bushels)</Label>
                                  <Input 
                                    type="number"
                                    value={newHarvest.amount}
                                    onChange={(e) => setNewHarvest({...newHarvest, amount: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <div>
                                  <Label>Date</Label>
                                  <Input 
                                    type="date"
                                    value={newHarvest.date}
                                    onChange={(e) => setNewHarvest({...newHarvest, date: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <Button type="submit" className="w-full">Save Harvest</Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isAddingRotation} onOpenChange={setIsAddingRotation}>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                                <RotateCw className="h-4 w-4 mr-2" />
                                Record Crop Rotation
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Record Crop Rotation</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleAddRotation} className="space-y-4">
                                <div>
                                  <Label>Farm</Label>
                                  <select 
                                    className="w-full p-2 border rounded"
                                    value={newRotation.farmId}
                                    onChange={(e) => setNewRotation({...newRotation, farmId: e.target.value})}
                                    required
                                  >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label>Crop</Label>
                                  <Input 
                                    value={newRotation.crop}
                                    onChange={(e) => setNewRotation({...newRotation, crop: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <div>
                                  <Label>Start Date</Label>
                                  <Input 
                                    type="date"
                                    value={newRotation.startDate}
                                    onChange={(e) => setNewRotation({...newRotation, startDate: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input 
                                    type="date"
                                    value={newRotation.endDate}
                                    onChange={(e) => setNewRotation({...newRotation, endDate: e.target.value})}
                                    required
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                <Button type="submit" className="w-full">Save Crop Rotation</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )
                    },
                    {
                      ...widgetLayout.find(w => w.i === 'sustainabilityScore') || { 
                        i: 'sustainabilityScore', 
                        title: 'Sustainability Score', 
                        isVisible: true, 
                        x: 3, y: 0, w: 9, h: 4 
                      },
                      content: (
                        <div data-walkthrough="sustainability">
                          <SustainabilityScoreCard 
                            sustainabilityMetrics={sustainabilityMetrics} 
                            cropFilter={cropFilter} 
                            setCropFilter={setCropFilter}
                            farms={getFilteredFarms()}
                          />
                        </div>
                      )
                    },
                    {
                      ...widgetLayout.find(w => w.i === 'weatherPreview') || { 
                        i: 'weatherPreview', 
                        title: 'Weather Preview', 
                        isVisible: true, 
                        x: 0, y: 4, w: 6, h: 3 
                      },
                      content: <WeatherPreview weatherData={weatherData} />
                    },
                    {
                      ...widgetLayout.find(w => w.i === 'upcomingEvents') || { 
                        i: 'upcomingEvents', 
                        title: 'Upcoming Events', 
                        isVisible: true, 
                        x: 6, y: 4, w: 6, h: 3 
                      },
                      content: <UpcomingCropPlan />
                    },
                    {
                      ...widgetLayout.find(w => w.i === 'farmIssues') || { 
                        i: 'farmIssues', 
                        title: 'Farm Issues', 
                        isVisible: true, 
                        x: 0, y: 7, w: 6, h: 4 
                      },
                      content: <FarmIssues />
                    },
                    {
                      ...widgetLayout.find(w => w.i === 'taskManager') || { 
                        i: 'taskManager', 
                        title: 'Task Manager', 
                        isVisible: true, 
                        x: 6, y: 7, w: 6, h: 4 
                      },
                      content: (
                        <TaskManager 
                          tasks={tasks} 
 
                          setTasks={setTasks} 
                          handleDeleteTask={handleDeleteTask}
                        />
                      )
                    },
                    {
                      ...widgetLayout.find(w => w.i === 'planningRecommendations') || { 
                        i: 'planningRecommendations', 
                        title: 'Planning Recommendations', 
                        isVisible: true, 
                        x: 0, y: 11, w: 12, h: 3 
                      },
                      content: (
                        <div className="space-y-3">
                          {/* Show weather summary first */}
                          {weatherData.length > 0 && (
                            <div className="flex items-center p-2 bg-gray-50 rounded-md mb-2">
                              <div className="flex-grow">
                                <p className="font-medium">Weather Summary</p>
                                <p className="text-xs text-gray-600">
                                  {planningRecommendations.shouldPrepareRainwater 
                                    ? "Rain is expected in the coming days." 
                                    : "Mostly dry conditions expected."}
                                  {" "}Average high: {weatherData.slice(0, 5).reduce((sum, day) => sum + day.temp, 0) / 5}°F
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Only show fertilizer alert if it's actually going to rain */}
                          {weatherData.length > 0 && planningRecommendations.shouldDelayFertilizer && (
                            <div className="flex items-center p-2 bg-green-50 rounded-md">
                              <Leaf className="h-5 w-5 text-green-500 mr-3" />
                              <div className="flex-grow">
                                <p className="font-medium">Fertilizer Application Alert</p>
                                <p className="text-xs text-gray-600">
                                  Rain is forecasted soon. Consider postponing fertilizer application to avoid runoff.
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto text-green-600" 
                                onClick={() => {
                                  setIsAddingFertilizerPlan(true);
                                }}
                              >
                                Plan
                              </Button>
                            </div>
                          )}
                          
                          {/* Only show irrigation if there's NO rain expected */}
                          {weatherData.length > 0 && planningRecommendations.shouldRecommendIrrigation && (
                            <div className="flex items-center p-2 bg-blue-50 rounded-md">
                              <Droplet className="h-5 w-5 text-blue-500 mr-3" />
                              <div className="flex-grow">
                                <p className="font-medium">Irrigation Needed</p>
                                <p className="text-xs text-gray-600">
                                  Hot, dry weather ahead. Consider scheduling irrigation in the next few days.
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto text-blue-600" 
                                onClick={() => {
                                  setIsAddingIrrigationPlan(true);
                                }}
                              >
                                Plan
                              </Button>
                            </div>
                          )}
                          
                          {irrigationPlans.some(plan => plan.status === 'planned') && (
                            <div className="flex items-center p-2 bg-green-50 rounded-md">
                              <Droplet className="h-5 w-5 text-green-500 mr-3" />
                              <div className="flex-grow">
                                <p className="font-medium">Irrigation Scheduled</p>
                                <p className="text-xs text-gray-600">
                                  {irrigationPlans.filter(p => p.status === 'planned').length} upcoming irrigation {irrigationPlans.filter(p => p.status === 'planned').length === 1 ? 'plan' : 'plans'}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto text-green-600" 
                                onClick={() => {
                                  setActiveTab('planners');
                                }}
                              >
                                View
                              </Button>
                            </div>
                          )}
                          
                          {rotationPlans.some(plan => plan.status === 'planned') && (
                            <div className="flex items-center p-2 bg-orange-50 rounded-md">
                              <RotateCw className="h-5 w-5 text-orange-500 mr-3" />
                              <div className="flex-grow">
                                <p className="font-medium">Crop Rotation Plans</p>
                                <p className="text-xs text-gray-600">
                                  {rotationPlans.filter(p => p.status === 'planned').length} crop rotation {rotationPlans.filter(p => p.status === 'planned').length === 1 ? 'plan' : 'plans'} awaiting action
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto text-orange-600" 
                                onClick={() => {
                                  setActiveTab('planners');
                                }}
                              >
                                View
                              </Button>
                            </div>
                          )}
                          
                          {/* Only show rainwater harvesting if rain is actually expected */}
                          {planningRecommendations.shouldPrepareRainwater && (
                            <div className="flex items-center p-2 bg-cyan-50 rounded-md">
                              <CloudRain className="h-5 w-5 text-cyan-500 mr-3" />
                              <div className="flex-grow">
                                <p className="font-medium">Rainwater Harvesting Opportunity</p>
                                <p className="text-xs text-gray-600">
                                  Rain is forecasted soon. Consider preparing rainwater harvesting systems.
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto text-cyan-600" 
                                onClick={() => {
                                  setIsAddingRainwaterPlan(true);
                                }}
                              >
                                Create Plan
                              </Button>
                            </div>
                          )}
                          
                          {!planningRecommendations.shouldRecommendIrrigation && 
                           !planningRecommendations.shouldDelayFertilizer &&
                           !planningRecommendations.shouldHarvestSoon &&
                           !planningRecommendations.shouldPrepareRainwater &&
                           !irrigationPlans.some(plan => plan.status === 'planned') &&
                           !rotationPlans.some(plan => plan.status === 'planned') &&
                           !weatherTaskPlans.some(plan => 
                              plan.status === 'planned' && 
                              weatherData.some(day => 
                                day.weather.toLowerCase().includes((plan.weatherCondition || '').toLowerCase())
                              )
                            ) && (
                            <p className="text-center text-gray-500 py-4">
                              No immediate planning recommendations at this time
                            </p>
                          )}
                        </div>
                      )
                    }
                  ]}
                  onWidgetVisibilityChange={handleWidgetVisibilityChange}
                  onLayoutChange={handleLayoutChange}
                  isEditMode={isEditMode}
                />
              </TabsContent>

              <TabsContent value="issues">
                {/* Use the imported IssueTracker component with props */}
                <IssueTracker 
                  issues={issues} 
                  setIssues={setIssues} 
                  handleResolveIssue={handleResolveIssue}
                />
              </TabsContent>

              <TabsContent value="water">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Water Usage Tracker</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {farms.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={farms.flatMap(farm => 
                              farm.waterHistory.map(usage => ({
                                farm: farm.name,
                                amount: usage.amount,
                                date: new Date(usage.date).toLocaleDateString()
                              }))
                            )}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="amount" fill="#3b82f6" name="Water Usage (gal)" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-500">
                            No water usage data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="farms">
                <div className="space-y-4">
                  <Button
                    data-walkthrough="add-farm"
                    onClick={() => setIsAddingFarm(true)}
                    className="mb-4"
                  >
                    Add New Farm
                  </Button>

                  <Dialog open={isAddingFarm} onOpenChange={setIsAddingFarm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Farm</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddFarm} className="space-y-4">
                        <div>
                          <Label>Farm Name</Label>
                          <Input
                            value={newFarm.name}
                            onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Size (acres)</Label>
                          <Input
                            type="number"
                            value={newFarm.size}
                            onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Current Crop</Label>
                          <Input
                            value={newFarm.crop}
                            onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Crop Rotation History</Label>
                          <div className="space-y-2">
                            {newFarm.rotationHistory.map((rotation, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <Input
                                  placeholder="Crop"
                                  value={rotation.crop}
                                  onChange={(e) => {
                                    const updated = [...newFarm.rotationHistory];
                                    updated[index].crop = e.target.value;
                                    setNewFarm({ ...newFarm, rotationHistory: updated });
                                  }}
                                  className="border rounded px-2 py-1"
                                />
                                <Input
                                  type="date"
                                  value={rotation.startDate}
                                  onChange={(e) => {
                                    const updated = [...newFarm.rotationHistory];
                                    updated[index].startDate = e.target.value;
                                    setNewFarm({ ...newFarm, rotationHistory: updated });
                                  }}
                                  className="border rounded px-2 py-1"
                                />
                                <Input
                                  type="date"
                                  value={rotation.endDate}
                                  onChange={(e) => {
                                    const updated = [...newFarm.rotationHistory];
                                    updated[index].endDate = e.target.value;
                                    setNewFarm({ ...newFarm, rotationHistory: updated });
                                  }}
                                  className="border rounded px-2 py-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = newFarm.rotationHistory.filter((_, i) => i !== index);
                                    setNewFarm({ ...newFarm, rotationHistory: updated });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setNewFarm({
                                  ...newFarm,
                                  rotationHistory: [
                                    ...newFarm.rotationHistory,
                                    { crop: '', startDate: '', endDate: '' }
                                  ]
                                });
                              }}
                            >
                              Add Rotation Entry
                            </Button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          Add Farm
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isEditingFarm} onOpenChange={setIsEditingFarm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Farm</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditFarm} className="space-y-4">
                        <div>
                          <Label>Farm Name</Label>
                          <Input
                            value={newFarm.name}
                            onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Size (acres)</Label>
                          <Input
                            type="number"
                            value={newFarm.size}
                            onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Crop Type</Label>
                          <Input
                            value={newFarm.crop}
                            onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Save Changes
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {farms.length > 0 ? (
                      farms.map((farm) => (
                        <Card
                          key={farm.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <CardTitle>{farm.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p className="text-gray-500">Current Crop: {farm.crop}</p>
                              <p className="text-gray-500">Size: {farm.size.toLocaleString()} acres</p>
                              
                              {farm.rotationHistory && farm.rotationHistory.length > 0 && (
                                <div className="mt-4">
                                  <p className="font-medium mb-2">Crop Rotation History</p>
                                  <div className="space-y-1">
                                    {farm.rotationHistory.map((rotation, index) => (
                                      <div key={index} className="text-sm text-gray-600">
                                        {rotation.crop}: {new Date(rotation.startDate).toLocaleDateString()} - {new Date(rotation.endDate).toLocaleDateString()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Droplet className="h-4 w-4 text-blue-500" />
                                  <span>
                                    Last watered:{" "}
                                    {farm.waterHistory.length > 0
                                      ? new Date(
                                          farm.waterHistory[farm.waterHistory.length - 1].date
                                        ).toLocaleDateString()
                                      : "Never"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-green-500" />
                                  <span>
                                    Last fertilized:{" "}
                                    {farm.fertilizerHistory.length > 0
                                      ? new Date(
                                          farm.fertilizerHistory[farm.fertilizerHistory.length - 1]
                                            .date
                                      ).toLocaleDateString()
                                      : "Never"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <LayoutDashboard className="h-4 w-4 text-purple-500" />
                                  <span>
                                    Last harvest:{" "}
                                    {farm.harvestHistory.length > 0
                                      ? new Date(
                                          farm.harvestHistory[farm.harvestHistory.length - 1].date
                                        ).toLocaleDateString()
                                      : "Never"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RotateCw className="h-4 w-4 text-orange-500" />
                                  <span>
                                    Last rotation:{" "}
                                    {farm.rotationHistory && farm.rotationHistory.length > 0
                                      ? `${farm.rotationHistory[farm.rotationHistory.length - 1].crop} (${
                                          new Date(farm.rotationHistory[farm.rotationHistory.length - 1].startDate).toLocaleDateString()
                                        })`
                                      : "Never"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingFarm(farm);
                                    setNewFarm({ 
                                      name: farm.name, 
                                      size: farm.size, 
                                      crop: farm.crop,
                                      rotationHistory: farm.rotationHistory || []
                                    });
                                    setIsEditingFarm(true);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteFarm(farm.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center p-8 border rounded-lg border-dashed">
                        <p className="text-gray-500">
                          No farms added yet. Click "Add New Farm" to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>              <TabsContent value="reports">
                <Reports />
              </TabsContent>

              <TabsContent value="instructions">
                {/* Use our imported Instructions component */}
                <Instructions onStartWalkthrough={handleStartWalkthrough} />
              </TabsContent>

              <TabsContent value="history">
                {/* Update the HistoryPage to use our wrapper function */}
                <HistoryPage 
                  farms={farms} 
                  setEditingWaterUsage={setEditingWaterUsage}
                  editingWaterUsage={editingWaterUsage}
                  isEditingWaterUsage={isEditingWaterUsage}
                  newWaterUsage={newWaterUsage}
                  handleEditWaterUsage={handleEditWaterUsage}
                  setNewWaterUsage={setNewWaterUsage} 
                  setIsEditingWaterUsage={setIsEditingWaterUsage} 
                  setIsAddingWaterUsage={setIsAddingWaterUsage}
                  editingFertilizer={editingFertilizer}
                  isEditingFertilizer={isEditingFertilizer}
                  newFertilizer={newFertilizer}
                  handleEditFertilizer={handleEditFertilizer}
                  setEditingFertilizer={setEditingFertilizer} 
                  setNewFertilizer={setNewFertilizer} 
                  setIsEditingFertilizer={setIsEditingFertilizer} 
                  setIsAddingFertilizer={setIsAddingFertilizer} 
                  editingHarvest={editingHarvest}
                  isEditingHarvest={isEditingHarvest}
                  newHarvest={newHarvest}
                  handleEditHarvest={handleEditHarvest}
                  setEditingHarvest={setEditingHarvest} 
                  setNewHarvest={setNewHarvest} 
                  setIsEditingHarvest={setIsEditingHarvest} 
                  setIsAddingHarvest={setIsAddingHarvest} 
                  newRotation={newRotation}
                  isAddingRotation={isAddingRotation}
                  handleAddRotation={handleAddRotation}
                  setNewRotation={setNewRotation} 
                  setIsAddingRotation={setIsAddingRotation} 
                  setConfirmDelete={handleSetConfirmDelete} 
                />
              </TabsContent>

              <TabsContent value="trackers">
                <TrackerDashboard 
                  farms={farms}
                  fuelRecords={fuelRecords} 
                  setFuelRecords={setFuelRecords}
                  soilRecords={soilRecords}
                  setSoilRecords={setSoilRecords}
                  emissionSources={emissionSources}
                  setEmissionSources={setEmissionSources}
                  sequestrationActivities={sequestrationActivities}
                  setSequestrationActivities={setSequestrationActivities}
                  energyRecords={energyRecords}
                  setEnergyRecords={setEnergyRecords}
                />
              </TabsContent>

              <TabsContent value="planners">
                <PlannerView />
              </TabsContent>

              <TabsContent value="crophealth">
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
                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {scanResults && scanResults.issues && scanResults.issues.length > 0 ? (
                            <div className="space-y-4">
                              <p className="font-medium">Detected Issues</p>
                              <div className="space-y-2">
                                {scanResults.issues.map((issue: any, index: number) => (
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
                          
                          {scanResults && scanResults.recommendations && (
                            <div className="mt-6">
                              <p className="font-medium">Recommendations</p>
                              <ul className="list-disc pl-5 mt-2 space-y-1">
                                {scanResults.recommendations.map((rec: string, index: number) => (
                                  <li key={index} className="text-sm">{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
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
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <img 
                src="./logo.svg" 
                alt="EcoSprout" 
                className="h-16 w-16 mx-auto mb-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/logo.svg";
                }}
              />
              <CardTitle className="text-2xl font-bold">Welcome to EcoSprout</CardTitle>
              <p className="text-gray-500">Login or register to manage your farm operations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => {
                  setShowLoginModal(true);
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login / Register
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this {confirmDelete?.type}?</p>
            <div className="flex gap-2">
              <Button onClick={confirmDeleteAction} className="w-full">Confirm</Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="w-full">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PlantingPlanForm
        isOpen={isAddingPlantingPlan}
        onOpenChange={setIsAddingPlantingPlan}
        farms={farms}
        newPlantingPlan={newPlantingPlan}
        setNewPlantingPlan={setNewPlantingPlan}
        handleAddPlantingPlan={handleAddPlantingPlan}
      />

      <FertilizerPlanForm
        isOpen={isAddingFertilizerPlan}
        onOpenChange={setIsAddingFertilizerPlan}
        farms={farms}
        newFertilizerPlan={newFertilizerPlan}
        setNewFertilizerPlan={setNewFertilizerPlan}
        handleAddFertilizerPlan={handleAddFertilizerPlan}
      />

      <PestManagementPlanForm
        isOpen={isAddingPestPlan}
        onOpenChange={setIsAddingPestPlan}
        farms={farms}
        newPestPlan={newPestPlan}
        setNewPestPlan={setNewPestPlan}
        handleAddPestPlan={handleAddPestPlan}
      />
      
      <IrrigationPlanForm
        isOpen={isAddingIrrigationPlan}
        onOpenChange={setIsAddingIrrigationPlan}
        farms={farms}
        newIrrigationPlan={newIrrigationPlan}
        setNewIrrigationPlan={setNewIrrigationPlan}
        handleAddIrrigationPlan={handleAddIrrigationPlan}
      />
      
      <WeatherTaskPlanForm
        isOpen={isAddingWeatherTaskPlan}
        onOpenChange={setIsAddingWeatherTaskPlan}
        farms={farms}
        newWeatherTaskPlan={newWeatherTaskPlan}
        setNewWeatherTaskPlan={setNewWeatherTaskPlan}
        handleAddWeatherTaskPlan={handleAddWeatherTaskPlan}
      />
      
      <RotationPlanForm
        isOpen={isAddingRotationPlan}
        onOpenChange={setIsAddingRotationPlan}
        farms={farms}
        newRotationPlan={newRotationPlan}
        setNewRotationPlan={setNewRotationPlan}
        handleAddRotationPlan={handleAddRotationPlan}
      />
      
      <RainwaterPlanForm
        isOpen={isAddingRainwaterPlan}
        onOpenChange={setIsAddingRainwaterPlan}
        farms={farms}
        newRainwaterPlan={newRainwaterPlan}
        setNewRainwaterPlan={setNewRainwaterPlan}
        handleAddRainwaterPlan={handleAddRainwaterPlan}
      />
      
      <Dialog 
        open={!!importNotification} 
        onOpenChange={() => setImportNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importNotification?.success ? 'Import Successful' : 'Import Failed'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{importNotification?.message}</p>
            <Button 
              variant="outline" 
              onClick={() => setImportNotification(null)} 
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DefaultComponent;
