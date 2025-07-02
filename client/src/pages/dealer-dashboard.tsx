import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Users, Shield, Settings, Plus, Eye, Edit } from "lucide-react";

const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  subscriptionTier: z.enum(["basic", "pro", "enterprise"]).default("basic"),
  maxHubs: z.number().min(1).max(100).default(5),
  maxCameras: z.number().min(1).max(500).default(50),
});

type CreateCustomerForm = z.infer<typeof createCustomerSchema>;

export default function DealerDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dealer's customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/dealer/customers"],
  });

  // Fetch dealer statistics
  const { data: dealerStats } = useQuery({
    queryKey: ["/api/dealer/stats"],
  });

  const form = useForm<CreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      subscriptionTier: "basic",
      maxHubs: 5,
      maxCameras: 50,
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: CreateCustomerForm) => {
      const response = await apiRequest("POST", "/api/dealer/customers", customerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      setShowCreateCustomer(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCustomerForm) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      {/* Dealer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerStats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dealerStats?.newCustomersThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hubs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerStats?.totalHubs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dealerStats?.onlineHubs || 0} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dealerStats?.monthlyRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dealerStats?.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Manage your customers and their security systems
              </CardDescription>
            </div>
            <Dialog open={showCreateCustomer} onOpenChange={setShowCreateCustomer}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Customer</DialogTitle>
                  <DialogDescription>
                    Add a new customer account with customized access and limits
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Security Corp" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="admin@acmesecurity.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscriptionTier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subscription Tier</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="basic">Basic - $99/month</SelectItem>
                                  <SelectItem value="pro">Professional - $199/month</SelectItem>
                                  <SelectItem value="enterprise">Enterprise - $499/month</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxHubs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Hubs</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxCameras"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Cameras per Hub</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCreateCustomer(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createCustomerMutation.isPending}>
                        {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Hubs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading customers...</TableCell>
                </TableRow>
              ) : customers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No customers found</TableCell>
                </TableRow>
              ) : (
                customers?.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.billingEmail}</TableCell>
                    <TableCell>
                      <Badge variant={customer.subscriptionTier === 'enterprise' ? 'default' : 'secondary'}>
                        {customer.subscriptionTier}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.hubCount || 0}/{customer.maxHubs}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'active' ? 'default' : 'destructive'}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}