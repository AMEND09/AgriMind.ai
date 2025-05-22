import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Droplet, Leaf, LayoutDashboard, Info, Trash2, Edit3, RotateCw, Download, Upload, Settings, CloudRain, Pencil, X, UserCircle, LogIn, LogOut, BarChart3, Sprout, BugPlay, Cloud, Zap, Fuel, ChevronDown, ChevronRight, Calendar as CalendarIcon, PawPrint, HelpCircle, Spade, FlaskConical, Waves, Replace, Presentation, Sheet, Footprints, MessageSquare } from 'lucide-react'; // Removed BadgeMinus, Added MessageSquare
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  WaterUsage,
  Farm,
  WeatherData,
  Task,
  Issue,
  ConfirmDelete,
  CropPlanEvent,
  SustainabilityMetrics as ISustainabilityMetrics,
  ExportData,
  PlanItem,
  Livestock as ILivestock // Renamed to avoid conflict if Livestock is also a component
  // LivestockType removed as it's not used directly in this file
} from './types'; // Assuming Livestock and LivestockType are in types.ts
import { 
  FuelRecord, 
  SoilRecord, 
  CarbonEmissionSource, 
  CarbonSequestrationActivity, 
  EnergyRecord 
} from './models/sustainability'; // Import tracker types

// Import LivestockPage, ensure Livestock type is consistently used.
// If LivestockPage exports its own Livestock type, ensure it's compatible or aliased.
import LivestockPage from './components/LivestockPage';


import {
  walkthroughStyles,
  calculateSustainabilityMetricsWithTrackers,
  getWeatherInfo
} from './utils';

// Import the component files
import Walkthrough from './components/Walkthrough';
import CropFilter from './components/CropFilter';
import SustainabilityScoreCard from './components/SustainabilityScoreCard';
import WeatherPreview from './components/WeatherPreview';
import TaskManager from './components/TaskManager';
import IssueTracker from './components/IssueTracker';
import HistoryPage from './components/HistoryPage';
import Instructions from './components/Instructions';
import PlannerDashboard from './components/PlannerDashboard';
import PlantingPlanForm from './components/PlantingPlanForm';
import FertilizerPlanForm from './components/FertilizerPlanForm';
import PestManagementPlanForm from './components/PestManagementPlanForm';
import IrrigationPlanForm from './components/IrrigationPlanForm';
import WeatherTaskPlanForm from './components/WeatherTaskPlanForm';
import RotationPlanForm from './components/RotationPlanForm';
import RainwaterPlanForm from './components/RainwaterPlanForm';
import TrackerDashboard from './components/TrackerDashboard';
import { DataStorage } from '@/services/DataStorage';
import DraggableWidgetLayout, { Widget } from './components/DraggableWidgetLayout'; // Correct Widget import
import LoginPage from './components/LoginPage';
import UserProfileSettings from '@/artifacts/components/UserProfileSettings';

interface UserData {
  username: string;
  email: string;
  name: string;
  role: string;
}

// Define navigation items for the sidebar
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  dataWalkthrough?: string;
  children?: NavItem[];
  isGroup?: boolean; // True if this item is just a non-clickable group label
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, dataWalkthrough: 'overview-tab' },
  { id: 'farms', label: 'Farms', icon: Leaf, dataWalkthrough: 'farms-tab' },
  { id: 'issues', label: 'Farm Issues', icon: Info, dataWalkthrough: 'issues-tab' },
  {
    id: 'group-reports', label: 'Reports & Water', icon: BarChart3, isGroup: true,
    children: [
      { id: 'reports', label: 'Performance Reports', icon: Presentation, dataWalkthrough: 'reports-tab' },
      { id: 'water', label: 'Water Management', icon: Droplet, dataWalkthrough: 'water-tab' },
    ]
  },
  {
    id: 'group-trackers', label: 'Sustainability Trackers', icon: Settings, isGroup: true,
    children: [
      { id: 'trackers/carbon', label: 'Carbon Footprint', icon: Footprints },
      { id: 'trackers/soil', label: 'Soil Health', icon: Sprout },
      { id: 'trackers/energy', label: 'Energy Usage', icon: Zap },
      { id: 'trackers/fuel', label: 'Fuel Usage', icon: Fuel },
    ]
  },
  { id: 'history', label: 'History', icon: RotateCw },
  {
    id: 'group-planners', label: 'Planners', icon: Sheet, isGroup: true, dataWalkthrough: 'planners-tab',
    children: [
      { id: 'planners/calendar', label: 'Calendar', icon: CalendarIcon, dataWalkthrough: 'planners-tab' },
      { id: 'planners/planting', label: 'Planting', icon: Spade }, // Changed to Spade
      { id: 'planners/fertilizer', label: 'Fertilizer', icon: FlaskConical },
      { id: 'planners/pest', label: 'Pest Mgmt', icon: BugPlay },
      { id: 'planners/irrigation', label: 'Irrigation', icon: Waves },
      { id: 'planners/weatherTask', label: 'Weather Tasks', icon: Cloud },
      { id: 'planners/rotation', label: 'Rotation', icon: Replace },
      { id: 'planners/rainwater', label: 'Rainwater', icon: CloudRain },
    ]
  },
  { id: 'livestock', label: 'Livestock', icon: PawPrint, dataWalkthrough: 'livestock-tab' },
  { id: 'instructions', label: 'Instructions', icon: HelpCircle },
];


const DefaultComponent = (): React.ReactNode => {
  // Define walkthrough steps for the Walkthrough component
  const WALKTHROUGH_STEPS = [
    {
      target: '[data-walkthrough="overview-tab"]',
      title: 'Overview Dashboard',
      content: 'This is your main dashboard where you can see a summary of your farm data.',
      placement: 'right' as const,
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="quick-actions"]',
      title: 'Quick Actions',
      content: 'Use these buttons to quickly record water usage, fertilizer applications, and harvests.',
      placement: 'right' as const,
      tabId: 'overview' // Stays on overview
    },
    {
      target: '[data-walkthrough="sustainability"]',
      title: 'Sustainability Score',
      content: 'This shows your farm\'s sustainability metrics based on your recorded activities.',
      placement: 'left' as const,
      tabId: 'overview' // Stays on overview
    },
    {
      target: '[data-walkthrough="water-tab"]',
      title: 'Water Management',
      content: 'Track your water usage and efficiency here.',
      placement: 'right' as const,
      tabId: 'water'
    },
    {
      target: '[data-walkthrough="farms-tab"]',
      title: 'Farms',
      content: 'Manage your farms, crops, and view historical data.',
      placement: 'right' as const,
      tabId: 'farms'
    },
    {
      target: '[data-walkthrough="add-farm"]',
      title: 'Add New Farm',
      content: 'Click here to add a new farm to your dashboard.',
      placement: 'right' as const,
      tabId: 'farms' // Stays on farms
    },
    {
      target: '[data-walkthrough="issues-tab"]',
      title: 'Farm Issues',
      content: 'Track and manage farm problems here.',
      placement: 'right' as const,
      tabId: 'issues'
    },
    {
      target: '[data-walkthrough="reports-tab"]',
      title: 'Reports',
      content: 'View detailed reports about your farm performance.',
      placement: 'right' as const,
      tabId: 'reports'
    },
    {
      target: '[data-walkthrough="crop-plan"]', // This target might need to change if it's specific to the old crop plan tab
      title: 'Crop Plan',
      content: 'Plan and schedule your farming activities throughout the year.',
      placement: 'right' as const,
      tabId: 'planners/calendar' // Default to calendar view in planners
    },
    {
      target: '[data-walkthrough="planners-tab"]', // This target should now be on the sidebar item
      title: 'Farm Planners',
      content: 'Plan your planting, fertilizing, and pest management activities here.',
      placement: 'right' as const,
      tabId: 'planners/calendar' // Default to calendar view in planners
    },
    {
      target: '[data-walkthrough="livestock-tab"]',
      title: 'Livestock Management',
      content: 'Track and manage your farm livestock here.',
      placement: 'right' as const,
      tabId: 'livestock'
    }
  ];

  const [farms, setFarms] = useState<Farm[]>(() => {
    return DataStorage.getData<Farm[]>('farms', []);
  });

  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
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
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);
  const [cropPlanEvents, setCropPlanEvents] = useState<CropPlanEvent[]>(() => {
    return DataStorage.getData<CropPlanEvent[]>('cropPlanEvents', []);
  });

  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    return !DataStorage.isWalkthroughCompleted();
  });

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    DataStorage.setData('walkthroughCompleted', true); // Corrected DataStorage call
  };

  const handleStartWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const [isAddingRotation, setIsAddingRotation] = useState(false);
  const [newRotation, setNewRotation] = useState({
    farmId: '',
    crop: '',
    startDate: '',
    endDate: ''
  });
  // Add state for editing rotation if HistoryPage needs specific edit props for rotation
  // However, based on the error "Did you mean 'isAddingRotation'?", we'll pass the "add" props for rotation to HistoryPage.
  // If HistoryPage were to use distinct edit props for rotation, they would be:
  // const [editingRotation, setEditingRotation] = useState<Farm['rotationHistory'][number] & { farmId: number, originalStartDate: string } | null>(null);
  // const [isEditingRotation, setIsEditingRotation] = useState(false);

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

  const [livestockList, setLivestockList] = useState<ILivestock[]>(() => { 
    return DataStorage.getData<ILivestock[]>('livestockList', []);
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
      { i: 'planningRecommendations', title: 'Planning Recommendations', isVisible: true, x: 0, y: 11, w: 12, h: 3, minH: 2, minW: 6 },
      { i: 'livestockSummary', title: 'Livestock Summary', isVisible: true, x: 0, y: 14, w: 6, h: 4, minH: 3, minW: 3 } // Adjusted width
    ]);
  });

  // Add edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Add state for expanded sidebar items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'group-reports': true, // Default expanded states
    'group-trackers': false,
    'group-planners': true,
  });

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

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
    farmId: string; // Keep as string for form, parse to int when saving if needed
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

  // Add plan item handling functions
  const handleAddPlanItem = (
    planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater',
    newPlanData: Omit<PlanItem, 'id' | 'status'>
  ) => {
    const newPlan: PlanItem = {
      ...newPlanData,
      id: Date.now(),
      status: 'planned',
      farmId: newPlanData.farmId,
      title: (newPlanData as any).title ?? '',
      description: (newPlanData as any).description ?? '',
      startDate: (newPlanData as any).startDate ?? '',
      endDate: (newPlanData as any).endDate ?? '',
      notes: (newPlanData as any).notes ?? ''
    };

    switch (planType) {
      case 'planting':
        setPlantingPlans(prev => [...prev, newPlan]);
        setIsAddingPlantingPlan(false);
        setNewPlantingPlan({ farmId: '', title: '', description: '', startDate: '', endDate: '', notes: '' });
        break;
      case 'fertilizer':
        setFertilizerPlans(prev => [...prev, newPlan]);
        setIsAddingFertilizerPlan(false);
        setNewFertilizerPlan({ 
          farmId: '', title: '', description: '', fertilizerType: '', 
          applicationRate: '', startDate: '', endDate: '', notes: '' 
        });
        break;
      case 'pest':
        setPestManagementPlans(prev => [...prev, newPlan]);
        setIsAddingPestPlan(false);
        setNewPestPlan({ 
          farmId: '', title: '', description: '', pestType: '', 
          controlMethod: '', startDate: '', endDate: '', notes: '' 
        });
        break;
      case 'irrigation':
        setIrrigationPlans(prev => [...prev, newPlan]);
        setIsAddingIrrigationPlan(false);
        setNewIrrigationPlan({
          farmId: '', title: '', description: '', irrigationMethod: '', waterSource: '',
          frequency: '', soilMoistureThreshold: '', weatherConditions: '',
          startDate: '', endDate: '', notes: ''
        });
        break;
      case 'weatherTask':
        setWeatherTaskPlans(prev => [...prev, newPlan]);
        setIsAddingWeatherTaskPlan(false);
        setNewWeatherTaskPlan({
          farmId: '', title: '', description: '', taskType: '', weatherCondition: '',
          taskActions: '', priority: 'medium', startDate: '', endDate: '', notes: ''
        });
        break;
      case 'rotation':
        setRotationPlans(prev => [...prev, newPlan]);
        setIsAddingRotationPlan(false);
        setNewRotationPlan({
          farmId: '', title: '', description: '', rotationCrops: [], rotationInterval: '',
          soilPreparation: '', expectedBenefits: '', startDate: '', endDate: '', notes: ''
        });
        break;
      case 'rainwater':
        setRainwaterPlans(prev => [...prev, newPlan]);
        setIsAddingRainwaterPlan(false);
        setNewRainwaterPlan({
          farmId: '', title: '', description: '', harvestingMethod: '', storageType: '',
          harvestingCapacity: '', collectionArea: '', filteringMethod: '',
          usageIntent: '', startDate: '', endDate: '', notes: ''
        });
        break;
    }
  };

  // Functions for plan handling - called from plan form components
  const handleAddPlantingPlan = () => handleAddPlanItem('planting', newPlantingPlan);
  const handleAddFertilizerPlan = () => handleAddPlanItem('fertilizer', newFertilizerPlan);
  const handleAddPestPlan = () => handleAddPlanItem('pest', newPestPlan);
  const handleAddIrrigationPlan = () => handleAddPlanItem('irrigation', newIrrigationPlan);
  const handleAddWeatherTaskPlan = () => handleAddPlanItem('weatherTask', newWeatherTaskPlan);
  const handleAddRotationPlan = () => handleAddPlanItem('rotation', newRotationPlan);
  const handleAddRainwaterPlan = () => handleAddPlanItem('rainwater', newRainwaterPlan);

  // Update plan status function - required by PlannerDashboard
  const updatePlanStatus = (
    planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater',
    id: number,
    status: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  ) => {
    const update = (setter: React.Dispatch<React.SetStateAction<PlanItem[]>>) => {
      setter(prevPlans => prevPlans.map(plan => plan.id === id ? { ...plan, status } : plan));
    };
    
    switch (planType) {
      case 'planting': update(setPlantingPlans); break;
      case 'fertilizer': update(setFertilizerPlans); break;
      case 'pest': update(setPestManagementPlans); break;
      case 'irrigation': update(setIrrigationPlans); break;
      case 'weatherTask': update(setWeatherTaskPlans); break;
      case 'rotation': update(setRotationPlans); break;
      case 'rainwater': update(setRainwaterPlans); break;
    }
  };

  // Handler for deleting plans - required by PlannerDashboard
  const handleDeletePlan = (
    planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater',
    id: number
  ) => {
    setConfirmDelete({ id, type: planType });
  };

  // Update user auth state with proper typing
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return DataStorage.getData<boolean>('isLoggedIn', false);
  });
  
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    return DataStorage.getData<UserData | null>('currentUser', null);
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showGeminiChat, setShowGeminiChat] = useState(false); // New state for Gemini chat

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

  useEffect(() => {
    DataStorage.setData('livestockList', livestockList);
  }, [livestockList]);

  const fetchUserLocation = async () => {
    try {
      // Using geojs.io instead of ipapi.co to avoid CORS issues
      const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const data = await response.json();
      const { latitude, longitude } = data;
      
      // Fallback to default coordinates if the API fails
      fetchWeatherData(
        latitude ? parseFloat(latitude) : 40.7128, 
        longitude ? parseFloat(longitude) : -74.0060
      );
    } catch (error) {
      console.error('Error fetching user location:', error);
      // Fallback to default coordinates (New York City) if API fails
      fetchWeatherData(40.7128, -74.0060);
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=10`
      );
      const data = await response.json();

      const formattedData = data.daily.time.map((date: string, index: number) => {
        const weatherInfo = getWeatherInfo(data.daily.weathercode[index]);
        return {
          date: new Date(date).toLocaleDateString(),
          temp: data.daily.temperature_2m_max[index],
          weather: weatherInfo.desc,
          icon: weatherInfo.icon
        };
      });

      setWeatherData(formattedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData([]);
    }
  };

  const handleAddFarm = () => {
    setFarms([...farms, {
      id: farms.length + 1,
      name: newFarm.name,
      size: newFarm.size,
      crop: newFarm.crop,
      rotationHistory: newFarm.rotationHistory,
      waterHistory: [],
      fertilizerHistory: [],
      harvestHistory: []
    }]);
    setIsAddingFarm(false);
    setNewFarm({ 
      name: '', 
      size: '', 
      crop: '', 
      rotationHistory: [] 
    });
  };

  // Update handleEditFarm to include rotationHistory
  const handleEditFarm = () => {
    if (editingFarm) {
      const updatedFarms = farms.map(farm => 
        farm.id === editingFarm.id ? { ...editingFarm, ...newFarm } : farm
      );
      setFarms(updatedFarms);
      setIsEditingFarm(false);
      setEditingFarm(null);
      setNewFarm({ 
        name: '', 
        size: '', 
        crop: '', 
        rotationHistory: [] 
      });
    }
  };

  const handleDeleteFarm = (id: number) => {
    setConfirmDelete({ id, type: 'farm' });
  };

  const handleAddWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newWaterUsage.farmId)) {
        return {
          ...farm,
          waterHistory: [...farm.waterHistory, {
            amount: parseFloat(newWaterUsage.amount),
            date: newWaterUsage.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewWaterUsage({ farmId: '', amount: '', date: '' });
  };

  const handleEditWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWaterUsage) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newWaterUsage.farmId)) {
          return {
            ...farm,
            waterHistory: farm.waterHistory.map(usage =>
              usage.date === editingWaterUsage.date ? { ...usage, amount: parseFloat(newWaterUsage.amount), date: newWaterUsage.date } : usage
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingWaterUsage(false);
      setEditingWaterUsage(null);
      setNewWaterUsage({ farmId: '', amount: '', date: '' });
    }
  };

  const handleAddFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newFertilizer.farmId)) {
        return {
          ...farm,
          fertilizerHistory: [...farm.fertilizerHistory, {
            type: newFertilizer.type,
            amount: parseFloat(newFertilizer.amount),
            date: newFertilizer.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
  };

  const handleEditFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFertilizer) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newFertilizer.farmId)) {
          return {
            ...farm,
            fertilizerHistory: farm.fertilizerHistory.map(fertilizer =>
              fertilizer.date === editingFertilizer.date ? { ...fertilizer, type: newFertilizer.type, amount: parseFloat(newFertilizer.amount), date: newFertilizer.date } : fertilizer
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingFertilizer(false);
      setEditingFertilizer(null);
      setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
    }
  };

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newHarvest.farmId)) {
        return {
          ...farm,
          harvestHistory: [...farm.harvestHistory, {
            amount: parseFloat(newHarvest.amount),
            date: newHarvest.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewHarvest({ farmId: '', amount: '', date: '' });
  };

  const handleEditHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHarvest) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newHarvest.farmId)) {
          return {
            ...farm,
            harvestHistory: farm.harvestHistory.map(harvest =>
              harvest.date === editingHarvest.date ? { ...harvest, amount: parseFloat(newHarvest.amount), date: newHarvest.date } : harvest
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingHarvest(false);
      setEditingHarvest(null);
      setNewHarvest({ farmId: '', amount: '', date: '' });
    }
  };

  const handleResolveIssue = (id: number) => {
    setIssues(issues.filter(issue => issue.id !== id));
  };

  const handleDeleteTask = (id: number) => {
    setConfirmDelete({ id, type: 'task' });
  };

  const handleAddRotation = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newRotation.farmId)) {
        // Check if this is an edit operation (e.g., if an originalStartDate is present in newRotation)
        // For simplicity, this handleAddRotation will just add. HistoryPage might need a dedicated edit handler.
        return {
          ...farm,
          rotationHistory: [
            ...(farm.rotationHistory || []),
            {
              crop: newRotation.crop,
              startDate: newRotation.startDate,
              endDate: newRotation.endDate
            }
          ]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setIsAddingRotation(false); // Close modal after adding
    setNewRotation({ farmId: '', crop: '', startDate: '', endDate: '' }); // Reset form
  };

  // Placeholder for handleEditRotation if HistoryPage were to call it
  // const handleEditRotation = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Logic to edit rotation history entry
  //   // This would be similar to handleEditWaterUsage, etc.
  //   // Requires editingRotation state to be set with the item to edit.
  //   setIsEditingRotation(false);
  //   setEditingRotation(null);
  //   setNewRotation({ farmId: '', crop: '', startDate: '', endDate: '' });
  // };

  // REMOVED: const [showLivestockPage, setShowLivestockPage] = useState(false);
  // REMOVED: const [livestockPageFarmId, setLivestockPageFarmId] = useState<number | null>(null);
  // REMOVED: const handleViewLivestock, handleCloseLivestockPage, livestockSummaryData, and related useEffect

  // REMOVED: const [livestockData, setLivestockData] = useState<ILivestock[]>(() => {
  //   return DataStorage.getData<ILivestock[]>('livestockData', []);
  // });

  const handleAddLivestock = (livestockToAdd: Omit<ILivestock, 'id' | 'addedDate'>) => {
    const newEntry: ILivestock = {
      ...livestockToAdd,
      id: Date.now().toString(), // Ensure ID is string if LivestockPage expects string
      addedDate: new Date().toISOString().split('T')[0],
      farmId: Number(livestockToAdd.farmId) // Ensure farmId is number
    };
    setLivestockList(prev => [...prev, newEntry]);
  };
  
  const handleEditLivestock = (updatedLivestock: ILivestock) => {
    setLivestockList(prevList =>
      prevList.map(item => (item.id === updatedLivestock.id ? updatedLivestock : item))
    );
  };

  const handleDeleteLivestock = (livestockId: string | number) => { // Allow number if IDs can be numbers
    setConfirmDelete({ id: livestockId, type: 'livestock' });
  };

  // Update export data to use livestockList
  const handleExportData = () => {
    const exportData: ExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      farms,
      tasks,
      issues,
      cropPlanEvents,
      plantingPlans,
      fertilizerPlans,
      pestManagementPlans,
      irrigationPlans,
      weatherTaskPlans,
      rotationPlans,
      rainwaterPlans,
      // Tracker data
      fuelRecords,
      soilRecords,
      emissionSources,
      sequestrationActivities,
      energyRecords,
      livestock: livestockList // Use livestockList
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as ExportData;
        
        // Validate the imported data structure
        if (!importedData.version || !importedData.exportDate) {
          throw new Error('Invalid file format');
        }

        // Convert date strings back to Date objects in cropPlanEvents if they exist
        let processedEvents: CropPlanEvent[] = [];
        if (importedData.cropPlanEvents && Array.isArray(importedData.cropPlanEvents)) {
          processedEvents = importedData.cropPlanEvents.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
        }

        // Update all state with proper safety checks
        if (importedData.farms && Array.isArray(importedData.farms)) {
          setFarms(importedData.farms);
        }
        
        if (importedData.tasks && Array.isArray(importedData.tasks)) {
          setTasks(importedData.tasks);
        }
        
        if (importedData.issues && Array.isArray(importedData.issues)) {
          setIssues(importedData.issues);
        }
        
        if (processedEvents.length > 0) {
          setCropPlanEvents(processedEvents);
        }

        // Update planner data if available
        if (importedData.plantingPlans && Array.isArray(importedData.plantingPlans)) {
          setPlantingPlans(importedData.plantingPlans);
        }
        
        if (importedData.fertilizerPlans && Array.isArray(importedData.fertilizerPlans)) {
          setFertilizerPlans(importedData.fertilizerPlans);
        }
        
        if (importedData.pestManagementPlans && Array.isArray(importedData.pestManagementPlans)) {
          setPestManagementPlans(importedData.pestManagementPlans);
        }
        
        if (importedData.irrigationPlans && Array.isArray(importedData.irrigationPlans)) {
          setIrrigationPlans(importedData.irrigationPlans);
        }
        
        if (importedData.weatherTaskPlans && Array.isArray(importedData.weatherTaskPlans)) {
          setWeatherTaskPlans(importedData.weatherTaskPlans);
        }
        
        if (importedData.rotationPlans && Array.isArray(importedData.rotationPlans)) {
          setRotationPlans(importedData.rotationPlans);
        }
        
        if (importedData.rainwaterPlans && Array.isArray(importedData.rainwaterPlans)) {
          setRainwaterPlans(importedData.rainwaterPlans);
        }

        // Import tracker data if available
        if (importedData.fuelRecords && Array.isArray(importedData.fuelRecords)) {
          setFuelRecords(importedData.fuelRecords);
        }
        
        if (importedData.soilRecords && Array.isArray(importedData.soilRecords)) {
          setSoilRecords(importedData.soilRecords);
        }
        
        if (importedData.emissionSources && Array.isArray(importedData.emissionSources)) {
          setEmissionSources(importedData.emissionSources);
        }
        
        if (importedData.sequestrationActivities && Array.isArray(importedData.sequestrationActivities)) {
          setSequestrationActivities(importedData.sequestrationActivities);
        }
        
        if (importedData.energyRecords && Array.isArray(importedData.energyRecords)) {
          setEnergyRecords(importedData.energyRecords);
        }

        if (importedData.livestock && Array.isArray(importedData.livestock)) {
          setLivestockList(importedData.livestock);
        }

        setImportNotification({
          success: true,
          message: 'Data imported successfully'
        });
        
        console.log('Import successful:', importedData);
      } catch (error) {
        console.error('Import error:', error);
        setImportNotification({
          success: false,
          message: `Error importing file: ${error instanceof Error ? error.message : 'Invalid format'}`
        });
      }
    };
    reader.readAsText(file);
  };

  const sustainabilityMetrics = useMemo<ISustainabilityMetrics>(
    () => calculateSustainabilityMetricsWithTrackers(
      getFilteredFarms(), 
      weatherData, 
      soilRecords, 
      emissionSources, 
      sequestrationActivities, 
      energyRecords, 
      fuelRecords
    ), 
    [farms, weatherData, cropFilter, soilRecords, emissionSources, sequestrationActivities, energyRecords, fuelRecords, livestockList] // Added livestockList dependency
  );

  const handleDeleteEvent = (eventId: number) => {
    setConfirmDelete({ id: 0, type: 'cropEvent', eventId });
  };

  const PlannerView = () => {
    const subView = activeTab.startsWith('planners/') ? activeTab.split('/')[1] : 'calendar';
    return (
      <PlannerDashboard
        currentView={subView}
        farms={farms}
        plantingPlans={plantingPlans}
        fertilizerPlans={fertilizerPlans}
        pestManagementPlans={pestManagementPlans}
        irrigationPlans={irrigationPlans}
        weatherTaskPlans={weatherTaskPlans}
        rotationPlans={rotationPlans}
        rainwaterPlans={rainwaterPlans}
        setIsAddingPlantingPlan={setIsAddingPlantingPlan}
        setIsAddingFertilizerPlan={setIsAddingFertilizerPlan}
        setIsAddingPestPlan={setIsAddingPestPlan}
        setIsAddingIrrigationPlan={setIsAddingIrrigationPlan}
        setIsAddingWeatherTaskPlan={setIsAddingWeatherTaskPlan}
        setIsAddingRotationPlan={setIsAddingRotationPlan}
        setIsAddingRainwaterPlan={setIsAddingRainwaterPlan}
        updatePlanStatus={updatePlanStatus} // Now properly defined
        handleDeletePlan={handleDeletePlan} // Now properly defined
        cropPlanEvents={cropPlanEvents}
        setCropPlanEvents={setCropPlanEvents}
        handleDeleteEvent={handleDeleteEvent}
        weatherData={weatherData}
      />
    );
  };

  const UpcomingCropPlan = () => {
    const nextTwoWeeks = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);
  
      return cropPlanEvents
        .filter(event => {
          const eventDate = new Date(event.start);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today && eventDate <= twoWeeksFromNow;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5); // Show only next 5 events for cleaner UI
    }, [cropPlanEvents]);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Events</span>
            <span className="text-sm font-normal text-gray-500">Next 14 days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {nextTwoWeeks.length > 0 ? (
              nextTwoWeeks.map(event => (
                <div 
                  key={event.id} 
                  className={`p-2 rounded ${
                    event.type === 'planting' ? 'bg-blue-50 border-l-4 border-blue-500' :
                    event.type === 'fertilizing' ? 'bg-green-50 border-l-4 border-green-500' :
                    event.type === 'harvesting' ? 'bg-purple-50 border-l-4 border-purple-500' : 
                    'bg-gray-50 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Farm: {farms.find(f => f.id === event.farmId)?.name}</span>
                        <span>•</span>
                        <span>{event.type}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(event.start).toLocaleDateString()}
                    </p>
                  </div>
                  {event.notes && (
                    <p className="mt-1 text-sm text-gray-500 italic">
                      {event.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No upcoming events in the next two weeks
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const FarmIssues = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Farm Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length > 0 ? (
              issues.map(issue => (
                <div key={issue.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{issue.type}</h3>
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    </div>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Reported: {new Date(issue.dateReported).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No active issues</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const Reports = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Farm Performance Report</CardTitle>
        </CardHeader>          <CardContent>
          <CropFilter 
            farms={farms}
            cropFilter={cropFilter}
            setCropFilter={setCropFilter}
          />
          {getFilteredFarms().length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Droplet className="h-6 w-6 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Water Usage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {getFilteredFarms()
                      .reduce(
                        (total, farm) =>
                          total +
                          farm.waterHistory.reduce(
                            (sum, record) => sum + record.amount,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}{" "}
                    gal
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Fertilizer Used</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getFilteredFarms()
                      .reduce(
                        (total, farm) =>
                          total +
                          farm.fertilizerHistory.reduce(
                            (sum, record) => sum + record.amount,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}{" "}
                    lbs
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <LayoutDashboard className="h-6 w-6 text-purple-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Harvest</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {getFilteredFarms()
                      .reduce(
                        (total, farm) =>
                          total +
                          farm.harvestHistory.reduce(
                            (sum, record) => sum + record.amount,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}{" "}
                    bu
                  </p>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredFarms().flatMap((farm) =>
                      farm.harvestHistory.map((harvest) => ({
                        farm: farm.name,
                        amount: harvest.amount,
                        date: new Date(harvest.date).toLocaleDateString(),
                      }))
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#8884d8"
                      name="Harvest Amount (bu)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">
                {farms.length === 0
                  ? "No data available. Add farms and record activities to see reports."
                  : "No farms found for the selected crop."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Fix the weather-based recommendations logic with better accuracy
  const getPlanningRecommendations = useMemo(() => {
    // Check if there's weather data available
    if (!weatherData || weatherData.length === 0) {
      return {
        shouldRecommendIrrigation: false,
        shouldDelayFertilizer: false,
        shouldHarvestSoon: false,
        shouldPrepareRainwater: false
      };
    }
    
    const nextWeekWeather = weatherData.slice(0, 7);
    
    // Check for precipitation in the forecast
    const rainyDays = nextWeekWeather.filter(day => 
      day.weather.toLowerCase().includes('rain') || 
      day.weather.toLowerCase().includes('shower') || 
      day.weather.toLowerCase().includes('drizzle') ||
      day.weather.toLowerCase().includes('thunderstorm')
    );
    
    // If there's rain in the forecast, don't recommend irrigation
    const hasRainInForecast = rainyDays.length > 0;
    
    // Check if there's a hot, dry period coming up - only if no rain is forecasted
    const shouldRecommendIrrigation = !hasRainInForecast && nextWeekWeather.some(day => 
      day.temp > 85 && 
      !day.weather.toLowerCase().includes('rain') && 
      !day.weather.toLowerCase().includes('shower') && 
      !day.weather.toLowerCase().includes('drizzle')
    );
    
    // Check if there's rain forecast in the next 3 days
    const shouldDelayFertilizer = nextWeekWeather.slice(0, 3).some(day => 
      day.weather.toLowerCase().includes('rain') || 
      day.weather.toLowerCase().includes('shower') || 
      day.weather.toLowerCase().includes('drizzle')
    );
    
    // Check if there's a severe weather event coming that might damage crops
    const shouldHarvestSoon = nextWeekWeather.slice(0, 5).some(day => 
      day.weather.toLowerCase().includes('storm') || 
      day.weather.toLowerCase().includes('heavy rain') || 
      day.weather.toLowerCase().includes('thunderstorm')
    );

    // Check for rain forecasts for rainwater harvesting - only recommend if there's actual rain coming
    const shouldPrepareRainwater = hasRainInForecast;
    
    return {
      shouldRecommendIrrigation,
      shouldDelayFertilizer,
      shouldHarvestSoon,
      shouldPrepareRainwater
    };
  }, [weatherData]);

  const handleWidgetVisibilityChange = (widgetId: string, isVisible: boolean) => {
    setWidgetLayout((prevLayout: Widget[]) => 
      prevLayout.map((widget: Widget) => 
        widget.i === widgetId ? { ...widget, isVisible } : widget
      )
    );
  };

  // Fix the type errors in the layout change function
  const handleLayoutChange = (layout: any) => {
    setWidgetLayout((prevLayout: Widget[]) => {
      return prevLayout.map((widget: Widget) => {
        const updatedPosition = layout.find((item: any) => item.i === widget.i);
        if (updatedPosition && widget.isVisible) {
          return {
            ...widget,
            x: updatedPosition.x,
            y: updatedPosition.y,
            w: updatedPosition.w,
            h: updatedPosition.h
          };
        }
        return widget;
      });
    });
  };

  // Determine the main tab for the Tabs component and sub-view for dashboards
  const mainTabForTabsComponent = activeTab.split('/')[0];
  const plannerOrTrackerSubView = activeTab.split('/')[1];


  const Sidebar = ({ items, currentActiveTab, onNavItemClick, expanded, onToggle }: {
    items: NavItem[];
    currentActiveTab: string;
    onNavItemClick: (id: string) => void;
    expanded: Record<string, boolean>;
    onToggle: (id: string) => void;
  }) => {
    const renderNavItem = (item: NavItem, level = 0) => {
      const isActive = currentActiveTab === item.id || (item.children && currentActiveTab.startsWith(item.id + "/"));
      
      if (item.isGroup && !item.children) { // A group label without children, should not happen with current navItems
        return (
          <div key={item.id} className={`pl-${level * 4} py-2 px-3 text-sm font-semibold text-gray-500 uppercase`}>
            {item.label}
          </div>
        );
      }

      if (item.children) {
        return (
          <div key={item.id}>
            <Button
              variant="ghost"
              data-walkthrough={item.dataWalkthrough}
              className={`w-full justify-start items-center pl-${level * 4 + 3} pr-3 py-2 text-left ${isActive ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}
              onClick={() => {
                onToggle(item.id);
                // If group itself is clickable (e.g. planners-tab walkthrough), navigate to first child
                if (item.dataWalkthrough && item.children && item.children.length > 0) {
                   // Ensure the first child's ID is used for navigation if the group itself is targeted by walkthrough
                  const firstChildId = item.children.find(child => child.dataWalkthrough === item.dataWalkthrough)?.id || item.children[0].id;
                  onNavItemClick(firstChildId);
                } else if (item.children && item.children.length > 0 && !item.isGroup) {
                  // If a parent item (not just a group label) is clicked, navigate to its first child
                  onNavItemClick(item.children[0].id);
                }
              }}
            >
              <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="flex-grow">{item.label}</span>
              {expanded[item.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {expanded[item.id] && (
              <div className="pl-4 border-l border-gray-200 ml-5">
                {item.children.map(child => renderNavItem(child, level + 1))}
              </div>
            )}
          </div>
        );
      }

      return (
        <Button
          key={item.id}
          variant="ghost"
          data-walkthrough={item.dataWalkthrough}
          className={`w-full justify-start items-center pl-${level * 4 + 3} pr-3 py-2 text-left ${isActive ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}
          onClick={() => onNavItemClick(item.id)}
        >
          <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{item.label}</span>
        </Button>
      );
    };

    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto py-4">
        <nav className="space-y-1">
          {items.map(item => renderNavItem(item))}
        </nav>
      </div>
    );
  };


  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center"><p>Loading application...</p></div>}>
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
        <div className="flex flex-col h-screen">
          <div className="mb-0"> {/* Reduced mb, header is fixed height */}
            <div className="flex justify-between items-center p-4 border-b bg-white">
              <div className="flex items-center gap-4">
                <img 
                  src="./logo.svg" 
                  alt="AgriMind AI" 
                  className="h-12 w-12"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Avoid infinite loop
                    target.src = "/logo.svg"; // Try alternative path
                    console.log("Failed to load logo, trying alternative path");
                  }} 
                />
                <div>
                  <h1 className="text-3xl font-bold">AgriMind AI</h1>
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
          </div>

          <div className="flex flex-1 overflow-hidden"> {/* Main content area */}
            <Sidebar 
              items={navItems} 
              currentActiveTab={activeTab} 
              onNavItemClick={setActiveTab}
              expanded={expandedItems}
              onToggle={handleToggleExpand}
            />
            
            <main className="flex-1 p-6 overflow-y-auto bg-white"> {/* Content area */}
              <Tabs value={mainTabForTabsComponent} className="space-y-4 h-full">
                {/* No TabsList here, navigation is via Sidebar */}

                <TabsContent value="overview" className="h-full">
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
                                  <DialogTitle>{isEditingWaterUsage ? 'Edit' : 'Record'} Water Usage</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={isEditingWaterUsage ? handleEditWaterUsage : handleAddWaterUsage} className="space-y-4">
                                  <div>
                                    <Label>Farm</Label>
                                    <select 
                                      className="w-full p-2 border rounded"
                                      value={newWaterUsage.farmId} // This should be pre-filled if editingWaterUsage is set
                                      onChange={(e) => setNewWaterUsage({...newWaterUsage, farmId: e.target.value})}
                                      required
                                    >
                                      {/* Populate with farms, ensure editingWaterUsage.farmId is selected if editing */}
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
                                  <DialogTitle>{isEditingFertilizer ? 'Edit' : 'Record'} Fertilizer Application</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={isEditingFertilizer ? handleEditFertilizer : handleAddFertilizer} className="space-y-4">
                                  <div>
                                    {/* Farm Selector similar to Water Usage */}
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
                                  <DialogTitle>{isEditingHarvest ? 'Edit' : 'Record'} Harvest</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={isEditingHarvest ? handleEditHarvest : handleAddHarvest} className="space-y-4">
                                  {/* Form fields for harvest: Farm, Amount, Date */}
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
                                    <Label>Amount (bu)</Label>
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
                          x: 0, y: 11, w: 12, h: 3, minH: 2, minW: 6 
                        },
                        content: (
                          <div className="space-y-3">
                            {/* Show weather summary first */}
                            {weatherData.length > 0 && (
                              <div className="flex items-center p-2 bg-gray-50 rounded-md mb-2">
                                <div className="flex-grow">
                                  <p className="font-medium">Weather Summary</p>
                                  <p className="text-xs text-gray-600">
                                    {getPlanningRecommendations.shouldPrepareRainwater 
                                      ? "Rain is expected in the coming days." 
                                      : "Mostly dry conditions expected."}
                                    {" "}Average high: {weatherData.slice(0, 5).reduce((sum, day) => sum + day.temp, 0) / 5}°F
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {/* Only show fertilizer alert if it's actually going to rain */}
                            {weatherData.length > 0 && getPlanningRecommendations.shouldDelayFertilizer && (
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
                            {weatherData.length > 0 && getPlanningRecommendations.shouldRecommendIrrigation && (
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
                            {getPlanningRecommendations.shouldPrepareRainwater && (
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
                            
                            {!getPlanningRecommendations.shouldRecommendIrrigation && 
                             !getPlanningRecommendations.shouldDelayFertilizer &&
                             !getPlanningRecommendations.shouldHarvestSoon &&
                             !getPlanningRecommendations.shouldPrepareRainwater &&
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

                <TabsContent value="issues" className="h-full">
                  {/* Use the imported IssueTracker component with props */}
                  <IssueTracker 
                    issues={issues} 
                    setIssues={setIssues} 
                    handleResolveIssue={handleResolveIssue}
                  />
                </TabsContent>

                <TabsContent value="water" className="h-full">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Water Usage Tracker</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          {/* Content for Water Management, can reuse parts of HistoryPage or specific components */}
                          <p>Detailed water usage charts and history will be shown here.</p>
                           {/* Example: Re-use parts of HistoryPage or create a dedicated WaterManagement component */}
                           <HistoryPage
                    farms={farms}
                    // Water Usage Props
                    newWaterUsage={newWaterUsage}
                    setNewWaterUsage={setNewWaterUsage}
                    setIsAddingWaterUsage={setIsAddingWaterUsage} // Corrected: Pass setter
                    isEditingWaterUsage={isEditingWaterUsage}
                    setIsEditingWaterUsage={setIsEditingWaterUsage}
                    editingWaterUsage={editingWaterUsage}
                    setEditingWaterUsage={setEditingWaterUsage}
                    handleEditWaterUsage={handleEditWaterUsage}
                    // Fertilizer Props
                    newFertilizer={newFertilizer}
                    setNewFertilizer={setNewFertilizer}
                    setIsAddingFertilizer={setIsAddingFertilizer} // Corrected: Pass setter
                    isEditingFertilizer={isEditingFertilizer}
                    setIsEditingFertilizer={setIsEditingFertilizer}
                    editingFertilizer={editingFertilizer}
                    setEditingFertilizer={setEditingFertilizer}
                    handleEditFertilizer={handleEditFertilizer}
                    // Harvest Props
                    newHarvest={newHarvest}
                    setNewHarvest={setNewHarvest}
                    setIsAddingHarvest={setIsAddingHarvest} // Corrected: Pass setter
                    isEditingHarvest={isEditingHarvest}
                    setIsEditingHarvest={setIsEditingHarvest}
                    editingHarvest={editingHarvest}
                    setEditingHarvest={setEditingHarvest}
                    handleEditHarvest={handleEditHarvest}
                    // Rotation Props
                    isAddingRotation={isAddingRotation}
                    setIsAddingRotation={setIsAddingRotation}
                    newRotation={newRotation}
                    setNewRotation={setNewRotation}
                    handleAddRotation={handleAddRotation}
                    // General
                    setConfirmDelete={setConfirmDelete}
                  />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="farms" className="h-full">
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
                </TabsContent>

                <TabsContent value="reports" className="h-full">
                  <Reports />
                </TabsContent>

                <TabsContent value="instructions" className="h-full">
                  {/* Use our imported Instructions component */}
                  <Instructions onStartWalkthrough={handleStartWalkthrough} />
                </TabsContent>

                <TabsContent value="history" className="h-full">
                  <HistoryPage
                    farms={farms}
                    setConfirmDelete={setConfirmDelete}
                    isEditingWaterUsage={isEditingWaterUsage}
                    setIsEditingWaterUsage={setIsEditingWaterUsage}
                    editingWaterUsage={editingWaterUsage}
                    setEditingWaterUsage={setEditingWaterUsage}
                    newWaterUsage={newWaterUsage}
                    setNewWaterUsage={setNewWaterUsage}
                    handleEditWaterUsage={handleEditWaterUsage}
                    isEditingFertilizer={isEditingFertilizer}
                    setIsEditingFertilizer={setIsEditingFertilizer}
                    editingFertilizer={editingFertilizer}
                    setEditingFertilizer={setEditingFertilizer}
                    newFertilizer={newFertilizer}
                    setNewFertilizer={setNewFertilizer}
                    handleEditFertilizer={handleEditFertilizer}
                    isEditingHarvest={isEditingHarvest}
                    setIsEditingHarvest={setIsEditingHarvest}
                    editingHarvest={editingHarvest}
                    setEditingHarvest={setEditingHarvest}
                    newHarvest={newHarvest}
                    setNewHarvest={setNewHarvest}
                    handleEditHarvest={handleEditHarvest}
                    isAddingRotation={isAddingRotation}
                    setIsAddingRotation={setIsAddingRotation}
                    newRotation={newRotation}
                    setNewRotation={setNewRotation}
                    handleAddRotation={handleAddRotation}
                    setIsAddingWaterUsage={setIsAddingWaterUsage}
                    setIsAddingFertilizer={setIsAddingFertilizer}
                    setIsAddingHarvest={setIsAddingHarvest}
                  />
                </TabsContent>

                <TabsContent value="trackers" className="h-full">
                  <TrackerDashboard 
                    currentView={plannerOrTrackerSubView || 'carbon'} // Default to 'carbon' if no subview
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

                <TabsContent value="planners" className="h-full">
                  <PlannerView />
                </TabsContent>

                <TabsContent value="livestock" className="h-full">
                  <LivestockPage
                    livestockList={livestockList}
                    farms={farms}
                    onAddLivestock={handleAddLivestock}
                    onEditLivestock={handleEditLivestock}
                    onDeleteLivestock={handleDeleteLivestock}
                  />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <img 
                src="./logo.svg" 
                alt="AgriMind AI" 
                className="h-16 w-16 mx-auto mb-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/logo.svg";
                }}
              />
              <CardTitle className="text-2xl font-bold">Welcome to AgriMind AI</CardTitle>
              <p className="text-gray-500">Login or register to manage your farm operations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => {
                  setShowLoginModal(true); // Correctly open the login modal
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
            <Button onClick={() => {
              if (confirmDelete) {
                confirmDeleteAction(confirmDelete.id, confirmDelete.type, confirmDelete.eventId);
              }
            }} className="w-full">Confirm</Button>
            <Button variant="outline" onClick={() => setConfirmDelete(null)} className="w-full">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <PlantingPlanForm
        isOpen={isAddingPlantingPlan}
        onOpenChange={setIsAddingPlantingPlan}
        farms={farms}
        newPlantingPlan={newPlantingPlan}
        setNewPlantingPlan={setNewPlantingPlan}
        handleAddPlantingPlan={handleAddPlantingPlan} // Now properly defined
      />

      <FertilizerPlanForm
        isOpen={isAddingFertilizerPlan}
        onOpenChange={setIsAddingFertilizerPlan}
        farms={farms}
        newFertilizerPlan={newFertilizerPlan}
        setNewFertilizerPlan={setNewFertilizerPlan}
        handleAddFertilizerPlan={handleAddFertilizerPlan} // Now properly defined
      />

      <PestManagementPlanForm
        isOpen={isAddingPestPlan}
        onOpenChange={setIsAddingPestPlan}
        farms={farms}
        newPestPlan={newPestPlan}
        setNewPestPlan={setNewPestPlan}
        handleAddPestPlan={handleAddPestPlan} // Now properly defined
      />
      
      <IrrigationPlanForm
        isOpen={isAddingIrrigationPlan}
        onOpenChange={setIsAddingIrrigationPlan}
        farms={farms}
        newIrrigationPlan={newIrrigationPlan}
        setNewIrrigationPlan={setNewIrrigationPlan}
        handleAddIrrigationPlan={handleAddIrrigationPlan} // Now properly defined
      />
      
      <WeatherTaskPlanForm
        isOpen={isAddingWeatherTaskPlan}
        onOpenChange={setIsAddingWeatherTaskPlan}
        farms={farms}
        newWeatherTaskPlan={newWeatherTaskPlan}
        setNewWeatherTaskPlan={setNewWeatherTaskPlan}
        handleAddWeatherTaskPlan={handleAddWeatherTaskPlan} // Now properly defined
      />
      
      <RotationPlanForm
        isOpen={isAddingRotationPlan}
        onOpenChange={setIsAddingRotationPlan}
        farms={farms}
        newRotationPlan={newRotationPlan}
        setNewRotationPlan={setNewRotationPlan}
        handleAddRotationPlan={handleAddRotationPlan} // Now properly defined
      />
      
      <RainwaterPlanForm
        isOpen={isAddingRainwaterPlan}
        onOpenChange={setIsAddingRainwaterPlan}
        farms={farms}
        newRainwaterPlan={newRainwaterPlan}
        setNewRainwaterPlan={setNewRainwaterPlan}
        handleAddRainwaterPlan={handleAddRainwaterPlan} // Now properly defined
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

      {/* Hovering Gemini Button */}
      {isLoggedIn && (
        <button
          className="hovering-help-button" // Re-using the same class for styling
          title="Ask Gemini"
          onClick={() => {
            setShowGeminiChat(true); // Open Gemini chat
            console.log("Gemini button clicked. GOOGLE_GEMINI_API_KEY is set in backend/settings.py.");
          }}
        >
          <MessageSquare size={24} /> {/* Changed icon to MessageSquare */}
        </button>
      )}

      {/* Gemini Chat Box */}
      {isLoggedIn && showGeminiChat && (
        <div style={{
          position: 'fixed',
          bottom: '80px', // Position above the Gemini button
          right: '20px',
          width: '350px',
          height: '450px',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1001, // Ensure it's above the button but potentially below modals
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            padding: '12px 15px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f7f7f7',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Ask Gemini</span>
            <button 
              onClick={() => setShowGeminiChat(false)} 
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px' }}
              title="Close chat"
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ flexGrow: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#fff' }}>
            {/* Placeholder for chat messages */}
            <p style={{ color: '#555', fontSize: '14px' }}>Gemini chat interface coming soon...</p>
            {/* Example messages:
            <div style={{ marginBottom: '10px', textAlign: 'right' }}><span style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 12px', borderRadius: '15px 15px 0 15px', display: 'inline-block', maxWidth: '70%' }}>Hello Gemini!</span></div>
            <div style={{ marginBottom: '10px', textAlign: 'left' }}><span style={{ backgroundColor: '#e9e9eb', color: 'black', padding: '8px 12px', borderRadius: '15px 15px 15px 0', display: 'inline-block', maxWidth: '70%' }}>Hello! How can I help you today?</span></div>
            */}
          </div>
          <div style={{ padding: '10px 15px', borderTop: '1px solid #eee', backgroundColor: '#f7f7f7', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '20px', 
                border: '1px solid #ddd',
                boxSizing: 'border-box',
                fontSize: '14px'
              }} 
            />
          </div>
        </div>
      )}
    </>
    </Suspense>
  );

  // Define confirmDeleteAction inside the component to access setters
  const confirmDeleteAction = (
    id: number | string,
    type: string,
    eventId?: number
  ) => {
    console.log(`Attempting to delete ${type} with id ${id}` + (eventId ? ` and eventId ${eventId}` : ''));
    switch (type) {
      case 'farm':
        setFarms(prevFarms => prevFarms.filter(farm => farm.id !== id));
        break;
      case 'task':
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        break;
      case 'cropEvent':
        setCropPlanEvents(prevEvents => prevEvents.filter(event => event.id !== eventId)); // Assuming eventId is the correct identifier
        break;
      case 'livestock':
        setLivestockList(prevList => prevList.filter(item => item.id !== id));
        break;
      case 'planting':
        setPlantingPlans(prev => prev.filter(p => p.id !== id));
        break;
      case 'fertilizer':
        setFertilizerPlans(prev => prev.filter(p => p.id !== id));
        break;
      case 'pest':
        setPestManagementPlans(prev => prev.filter(p => p.id !== id));
        break;
      case 'irrigation':
        setIrrigationPlans(prev => prev.filter(p => p.id !== id));
        break;
      case 'weatherTask':
        setWeatherTaskPlans(prev => prev.filter(p => p.id !== id));
        break;
      case 'rotation':
        setRotationPlans(prev => prev.filter(p => p.id !== id));
        break;
      case 'rainwater':
        setRainwaterPlans(prev => prev.filter(p => p.id !== id));
        break;
      // Add other types as needed
    }
    setConfirmDelete(null); // Close dialog after action
  };
};


export default DefaultComponent;
