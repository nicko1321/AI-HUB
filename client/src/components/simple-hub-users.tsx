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
import { Users, Plus, Trash2, Shield, Eye, Edit, Mail } from "lucide-react";

const inviteUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "operator", "viewer"]).default("viewer"),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

interface SimpleHubUsersProps {
  hubId: number;
  hubName: string;
}

export default function SimpleHubUsers({ hubId, hubName }: SimpleHubUsersProps) {
  const [showInvite, setShowInvite] = useState(false);
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
        description: "Email invitation sent. They'll receive a link to join this hub.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/hubs/${hubId}/users`] });
      setShowInvite(false);
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

  const removeUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/hubs/${hubId}/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Removed",
        description: "User access to this hub has been revoked",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hub Access - {hubName}
            </CardTitle>
            <CardDescription>
              Send email invitations to give people access to this hub
            </CardDescription>
          </div>
          <Dialog open={showInvite} onOpenChange={setShowInvite}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Someone to {hubName}</DialogTitle>
                <DialogDescription>
                  Enter their email address and we'll send them a link to join this hub. 
                  They'll create their own password when they accept.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="john.doe@company.com" 
                            {...field} 
                            className="text-base"
                          />
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
                                    <div className="text-sm text-muted-foreground">Full hub control</div>
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
                      onClick={() => setShowInvite(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={inviteUserMutation.isPending}>
                      {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {usersLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : !hubUsers || hubUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No users yet</p>
            <p className="text-sm">Send an email invitation to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hubUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email.split('@')[0]
                          }
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'admin' ? 'destructive' : 
                      user.role === 'operator' ? 'default' : 'secondary'
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => removeUserMutation.mutate(user.id)}
                      disabled={removeUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}