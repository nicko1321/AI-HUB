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
import { AlertTriangle, Brain, Camera, Plus, Trash2, Eye, Shield, Zap } from "lucide-react";

interface AITrigger {
  id: string;
  name: string;
  description: string;
  prompt: string;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  hubIds: number[];
  cameraIds: number[];
  confidence: number;
  actions: string[];
}

const presetTriggers = [
  {
    name: "Weapon Detection",
    description: "Alert when weapons are detected in camera feeds",
    prompt: "Analyze this image for any weapons including guns, knives, or other dangerous objects. Alert if confidence is above 80%.",
    severity: "critical",
    confidence: 80
  },
  {
    name: "Suspicious Behavior",
    description: "Detect loitering, running, or unusual movement patterns",
    prompt: "Look for suspicious behavior such as loitering near entrances, people running in non-emergency situations, or unusual movement patterns.",
    severity: "medium",
    confidence: 70
  },
  {
    name: "Unauthorized Access",
    description: "Detect people in restricted areas or after hours",
    prompt: "Identify people in areas that should be restricted or accessing the building during off-hours.",
    severity: "high",
    confidence: 75
  },
  {
    name: "Vehicle Monitoring",
    description: "Monitor for unauthorized vehicles or license plates",
    prompt: "Detect vehicles in unauthorized areas, check license plates against blacklist, or identify suspicious vehicle behavior.",
    severity: "medium",
    confidence: 65
  },
  {
    name: "Crowd Detection",
    description: "Alert for large gatherings or crowding",
    prompt: "Monitor for large groups of people gathering or crowding in areas where it might pose a security risk.",
    severity: "low",
    confidence: 60
  }
];

interface AITriggerConfigProps {
  onTriggerCreate: (trigger: Omit<AITrigger, 'id'>) => void;
  onTriggerUpdate: (id: string, trigger: Partial<AITrigger>) => void;
  onTriggerDelete: (id: string) => void;
  triggers: AITrigger[];
  hubs: Array<{ id: number; name: string; location: string }>;
  cameras: Array<{ id: number; name: string; hubId: number; location: string }>;
}

export default function AITriggerConfig({ 
  onTriggerCreate, 
  onTriggerUpdate, 
  onTriggerDelete, 
  triggers, 
  hubs, 
  cameras 
}: AITriggerConfigProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customTrigger, setCustomTrigger] = useState({
    name: "",
    description: "",
    prompt: "",
    severity: "medium" as const,
    confidence: 70,
    hubIds: [] as number[],
    cameraIds: [] as number[],
    actions: ["email", "notification"]
  });

  const handlePresetSelect = (presetName: string) => {
    const preset = presetTriggers.find(p => p.name === presetName);
    if (preset) {
      setCustomTrigger(prev => ({
        ...prev,
        name: preset.name,
        description: preset.description,
        prompt: preset.prompt,
        severity: preset.severity as any,
        confidence: preset.confidence
      }));
      setSelectedPreset(presetName);
    }
  };

  const handleCreateTrigger = () => {
    if (!customTrigger.name || !customTrigger.prompt) return;
    
    onTriggerCreate({
      ...customTrigger,
      enabled: true
    });

    // Reset form
    setCustomTrigger({
      name: "",
      description: "",
      prompt: "",
      severity: "medium",
      confidence: 70,
      hubIds: [],
      cameraIds: [],
      actions: ["email", "notification"]
    });
    setSelectedPreset("");
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

  return (
    <div className="space-y-6">
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Brain className="w-5 h-5 text-sky-400" />
            <span>AI Event Triggers</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure AI-powered image analysis to automatically detect specific scenarios and trigger alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="create" className="data-[state=active]:bg-slate-700">Create Trigger</TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-slate-700">Manage Triggers</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              {/* Preset Selection */}
              <div className="space-y-4">
                <Label className="text-white">Quick Start - Preset Triggers</Label>
                <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a preset trigger or create custom" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {presetTriggers.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name} className="text-white hover:bg-slate-700">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>{preset.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Trigger Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Trigger Name</Label>
                    <Input
                      value={customTrigger.name}
                      onChange={(e) => setCustomTrigger(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Weapon Detection"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Description</Label>
                    <Input
                      value={customTrigger.description}
                      onChange={(e) => setCustomTrigger(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this trigger detects"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Severity Level</Label>
                    <Select 
                      value={customTrigger.severity} 
                      onValueChange={(value: any) => setCustomTrigger(prev => ({ ...prev, severity: value }))}
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
                    <Label className="text-white">Confidence Threshold (%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={customTrigger.confidence}
                      onChange={(e) => setCustomTrigger(prev => ({ ...prev, confidence: parseInt(e.target.value) || 70 }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-400">Minimum confidence level to trigger alert</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">AI Analysis Prompt</Label>
                    <Textarea
                      value={customTrigger.prompt}
                      onChange={(e) => setCustomTrigger(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Describe what the AI should look for in camera images..."
                      className="bg-slate-800 border-slate-600 text-white h-32"
                    />
                    <p className="text-xs text-slate-400">
                      Be specific about what to detect. Example: "Alert if you see a person carrying a weapon like a gun or knife."
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Target Hubs</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select hubs to monitor" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {hubs.map((hub) => (
                          <SelectItem key={hub.id} value={hub.id.toString()} className="text-white hover:bg-slate-700">
                            {hub.name} - {hub.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Target Cameras</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select specific cameras (optional)" />
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
              </div>

              <Button 
                onClick={handleCreateTrigger}
                disabled={!customTrigger.name || !customTrigger.prompt}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create AI Trigger
              </Button>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {triggers.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No AI triggers configured</p>
                  <p className="text-slate-500 text-sm mt-1">Create your first trigger to start AI-powered monitoring</p>
                </div>
              ) : (
                triggers.map((trigger) => (
                  <Card key={trigger.id} className="bg-slate-900 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium">{trigger.name}</h3>
                            <Badge className={getSeverityColor(trigger.severity)}>
                              {trigger.severity}
                            </Badge>
                            <Switch
                              checked={trigger.enabled}
                              onCheckedChange={(checked) => onTriggerUpdate(trigger.id, { enabled: checked })}
                            />
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{trigger.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Confidence: {trigger.confidence}%</span>
                            <span>Hubs: {trigger.hubIds.length || "All"}</span>
                            <span>Cameras: {trigger.cameraIds.length || "All"}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                            onClick={() => onTriggerDelete(trigger.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}