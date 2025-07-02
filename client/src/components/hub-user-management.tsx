import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Plus, Trash2, Edit, Shield, Eye } from "lucide-react";

const inviteUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "operator", "viewer"]).default("viewer"),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

interface HubUserManagementProps {
  hubId: number;
  hubName: string;
}

export default function HubUserManagement({ hubId, hubName }: HubUserManagementProps) {
  const [showInviteUser, setShowInviteUser] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for this specific hub
  const { data: hubUsers, isLoading: usersLoading } = useQuery({
    queryKey: [`/api/hubs/${hubId}/users`],
  });

  const form = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (inviteData: InviteUserForm) => {
      const response = await apiRequest("POST", `/api/hubs/${hubId}/invite`, inviteData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Email invitation sent successfully. They can create their account using the link.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/hubs/${hubId}/users`] });
      setShowInviteUser(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/hubs/${hubId}/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User removed from hub",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/hubs/${hubId}/users`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InviteUserForm) => {
    inviteUserMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "operator":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case "viewer":
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access to all hub features and user management";
      case "operator":
        return "Can control cameras, speakers, and manage events";
      case "viewer":
        return "View-only access to live feeds and events";
      default:
        return "Basic access";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hub Users - {hubName}
            </CardTitle>
            <CardDescription>
              Manage users who can access this specific hub
            </CardDescription>
          </div>
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User to {hubName}</DialogTitle>
                <DialogDescription>
                  Create a new user account for this hub. They will only have access to this specific hub.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Minimum 6 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Level</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-red-500" />
                                  <div>
                                    <div className="font-medium">Administrator</div>
                                    <div className="text-sm text-muted-foreground">Full hub access</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="operator">
                                <div className="flex items-center gap-2">
                                  <Edit className="h-4 w-4 text-yellow-500" />
                                  <div>
                                    <div className="font-medium">Operator</div>
                                    <div className="text-sm text-muted-foreground">Control cameras & speakers</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <div className="font-medium">Viewer</div>
                                    <div className="text-sm text-muted-foreground">View-only access</div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateUser(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading users...</TableCell>
              </TableRow>
            ) : !hubUsers || hubUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No users assigned to this hub yet
                </TableCell>
              </TableRow>
            ) : (
              hubUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">
                          {getRoleDescription(user.role)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'operator' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteUserMutation.mutate(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}