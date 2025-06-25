import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Brain, Camera, Plus, Trash2, Eye, Shield, Zap, Target, Clock, AlertCircle, Users, Car, Package } from "lucide-react";

interface CustomAnalytic {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  hubIds: number[];
  cameraIds: number[];
  confidence: number;
  timeframe: string;
  actions: string[];
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
}

const analyticCategories = [
  { id: "security", name: "Security & Safety", icon: Shield, color: "text-red-400" },
  { id: "behavior", name: "Behavior Analysis", icon: Eye, color: "text-blue-400" },
  { id: "traffic", name: "Traffic & Movement", icon: Car, color: "text-green-400" },
  { id: "crowd", name: "Crowd Management", icon: Users, color: "text-purple-400" },
  { id: "object", name: "Object Detection", icon: Package, color: "text-amber-400" },
  { id: "custom", name: "Custom Analysis", icon: Brain, color: "text-sky-400" }
];

const promptTemplates = {
  security: [
    "Detect weapons including guns, knives, or other dangerous objects",
    "Identify unauthorized access attempts or people in restricted areas",
    "Monitor for suspicious packages or unattended items",
    "Alert for potential theft or vandalism activities"
  ],
  behavior: [
    "Detect aggressive behavior or fighting between individuals",
    "Identify loitering or unusual gathering patterns",
    "Monitor for people running in non-emergency situations",
    "Detect falls or medical emergencies"
  ],
  traffic: [
    "Monitor unauthorized vehicles in restricted areas",
    "Detect traffic violations or accidents",
    "Identify blocked emergency exits or pathways",
    "Track vehicle license plates against blacklists"
  ],
  crowd: [
    "Monitor crowd density and potential overcrowding",
    "Detect large gatherings or protests",
    "Identify queue jumping or crowd control issues",
    "Alert for emergency evacuation scenarios"
  ],
  object: [
    "Detect specific objects like bags, tools, or equipment",
    "Monitor for missing or misplaced items",
    "Identify hazardous materials or spills",
    "Track inventory or asset movements"
  ],
  custom: [
    "Create your own custom detection prompt...",
    "Analyze specific scenarios unique to your environment",
    "Monitor for industry-specific requirements",
    "Custom behavioral or environmental analysis"
  ]
};

const conditionFields = [
  { value: "time", label: "Time of Day" },
  { value: "day", label: "Day of Week" },
  { value: "camera", label: "Camera Location" },
  { value: "hub", label: "Hub Status" },
  { value: "confidence", label: "Confidence Level" },
  { value: "duration", label: "Event Duration" }
];

const operators = [
  { value: "equals", label: "Equals" },
  { value: "greater", label: "Greater Than" },
  { value: "less", label: "Less Than" },
  { value: "contains", label: "Contains" },
  { value: "between", label: "Between" }
];

interface CustomAnalyticsBuilderProps {
  onAnalyticCreate: (analytic: Omit<CustomAnalytic, 'id'>) => void;
  onAnalyticUpdate: (id: string, analytic: Partial<CustomAnalytic>) => void;
  onAnalyticDelete: (id: string) => void;
  analytics: CustomAnalytic[];
  hubs: Array<{ id: number; name: string; location: string }>;
  cameras: Array<{ id: number; name: string; hubId: number; location: string }>;
}

export default function CustomAnalyticsBuilder({ 
  onAnalyticCreate, 
  onAnalyticUpdate, 
  onAnalyticDelete, 
  analytics, 
  hubs, 
  cameras 
}: CustomAnalyticsBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState("security");
  const [customAnalytic, setCustomAnalytic] = useState<Omit<CustomAnalytic, 'id'>>({
    name: "",
    description: "",
    category: "security",
    prompt: "",
    severity: "medium",
    enabled: true,
    hubIds: [],
    cameraIds: [],
    confidence: 75,
    timeframe: "realtime",
    actions: ["notification"],
    conditions: []
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCustomAnalytic(prev => ({ ...prev, category }));
  };

  const handleTemplateSelect = (template: string) => {
    setCustomAnalytic(prev => ({ 
      ...prev, 
      prompt: template,
      name: template.split(' ').slice(0, 3).join(' '),
      description: `Automated detection: ${template.toLowerCase()}`
    }));
  };

  const addCondition = () => {
    setCustomAnalytic(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: "", operator: "", value: "" }]
    }));
  };

  const updateCondition = (index: number, field: string, value: string) => {
    setCustomAnalytic(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const removeCondition = (index: number) => {
    setCustomAnalytic(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleCreateAnalytic = () => {
    if (!customAnalytic.name || !customAnalytic.prompt) return;
    
    onAnalyticCreate(customAnalytic);

    // Reset form
    setCustomAnalytic({
      name: "",
      description: "",
      category: "security",
      prompt: "",
      severity: "medium",
      enabled: true,
      hubIds: [],
      cameraIds: [],
      confidence: 75,
      timeframe: "realtime",
      actions: ["notification"],
      conditions: []
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "low": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = analyticCategories.find(c => c.id === category);
    return cat ? cat.icon : Brain;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Brain className="w-5 h-5 text-sky-400" />
            <span>Custom Analytics Builder</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Create any type of AI-powered analytics for your security cameras. From weapon detection to custom behavior analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="create" className="data-[state=active]:bg-slate-700">Create Analytics</TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-slate-700">Manage Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-4">
                <Label className="text-white">Analytics Category</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {analyticCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className={`h-auto p-4 flex flex-col space-y-2 ${
                          selectedCategory === category.id 
                            ? "bg-sky-500 hover:bg-sky-600 text-white" 
                            : "border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <Icon className={`w-6 h-6 ${selectedCategory === category.id ? "text-white" : category.color}`} />
                        <span className="text-xs">{category.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-4">
                <Label className="text-white">Quick Templates</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {promptTemplates[selectedCategory as keyof typeof promptTemplates]?.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 text-left justify-start border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{template}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Custom Analytics Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Analytics Name</Label>
                    <Input
                      value={customAnalytic.name}
                      onChange={(e) => setCustomAnalytic(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Weapon Detection in Lobby"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Description</Label>
                    <Input
                      value={customAnalytic.description}
                      onChange={(e) => setCustomAnalytic(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this detects"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Severity Level</Label>
                      <Select 
                        value={customAnalytic.severity} 
                        onValueChange={(value: any) => setCustomAnalytic(prev => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="low" className="text-white hover:bg-slate-700">Low</SelectItem>
                          <SelectItem value="medium" className="text-white hover:bg-slate-700">Medium</SelectItem>
                          <SelectItem value="high" className="text-white hover:bg-slate-700">High</SelectItem>
                          <SelectItem value="critical" className="text-white hover:bg-slate-700">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Timeframe</Label>
                      <Select 
                        value={customAnalytic.timeframe} 
                        onValueChange={(value) => setCustomAnalytic(prev => ({ ...prev, timeframe: value }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="realtime" className="text-white hover:bg-slate-700">Real-time</SelectItem>
                          <SelectItem value="5min" className="text-white hover:bg-slate-700">Every 5 minutes</SelectItem>
                          <SelectItem value="15min" className="text-white hover:bg-slate-700">Every 15 minutes</SelectItem>
                          <SelectItem value="hourly" className="text-white hover:bg-slate-700">Hourly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Confidence Threshold: {customAnalytic.confidence}%</Label>
                    <Slider
                      value={[customAnalytic.confidence]}
                      onValueChange={([value]) => setCustomAnalytic(prev => ({ ...prev, confidence: value }))}
                      min={1}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-400">Minimum confidence level to trigger alert</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">AI Analysis Prompt</Label>
                    <Textarea
                      value={customAnalytic.prompt}
                      onChange={(e) => setCustomAnalytic(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Describe exactly what the AI should detect in camera images..."
                      className="bg-slate-800 border-slate-600 text-white h-32"
                    />
                    <p className="text-xs text-slate-400">
                      Be very specific. Example: "Alert if you see any person carrying or holding a weapon such as a gun, knife, or any threatening object."
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Target Locations</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Select hubs" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {hubs.map((hub) => (
                            <SelectItem key={hub.id} value={hub.id.toString()} className="text-white hover:bg-slate-700">
                              {hub.name} - {hub.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Select cameras" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {cameras.map((camera) => (
                            <SelectItem key={camera.id} value={camera.id.toString()} className="text-white hover:bg-slate-700">
                              {camera.name} - {camera.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Advanced Conditions</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCondition}
                        className="border-slate-600 text-slate-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {customAnalytic.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(index, 'field', value)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {conditionFields.map((field) => (
                              <SelectItem key={field.value} value={field.value} className="text-white hover:bg-slate-700">
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, 'operator', value)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value} className="text-white hover:bg-slate-700">
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="bg-slate-800 border-slate-600 text-white"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(index)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateAnalytic}
                disabled={!customAnalytic.name || !customAnalytic.prompt}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Analytics
              </Button>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {analytics.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No custom analytics configured</p>
                  <p className="text-slate-500 text-sm mt-1">Create your first custom analytics to start monitoring</p>
                </div>
              ) : (
                analytics.map((analytic) => {
                  const CategoryIcon = getCategoryIcon(analytic.category);
                  return (
                    <Card key={analytic.id} className="bg-slate-900 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <CategoryIcon className="w-5 h-5 text-sky-400" />
                              <h3 className="text-white font-medium">{analytic.name}</h3>
                              <Badge className={getSeverityColor(analytic.severity)}>
                                {analytic.severity}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-slate-400">
                                {analytic.category}
                              </Badge>
                              <Switch
                                checked={analytic.enabled}
                                onCheckedChange={(checked) => onAnalyticUpdate(analytic.id, { enabled: checked })}
                              />
                            </div>
                            <p className="text-slate-400 text-sm mb-2">{analytic.description}</p>
                            <p className="text-slate-500 text-xs mb-2 italic">"{analytic.prompt}"</p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <span>Confidence: {analytic.confidence}%</span>
                              <span>Timeframe: {analytic.timeframe}</span>
                              <span>Conditions: {analytic.conditions.length}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-400"
                              onClick={() => onAnalyticDelete(analytic.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}