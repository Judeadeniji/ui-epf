import { useState, useEffect, ChangeEventHandler, FormEventHandler } from 'react';
import { signOut, authClient, useListPasskeys } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/contexts/session';

export function SettingsPage() {
    const { user } = useSession();
    const { data: passkeys, isPending: passkeyPending, error: passkeyError, refetch: refetchPassKey } = useListPasskeys();
    const [loading, setLoading] = useState(false);
    const [profileForm, setProfileForm] = useState<{
        name: string;
        email: string;
        newImage: File | null;
    }>({
        name: '',
        email: '',
        newImage: null,
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Initialize form data when session data is loaded
    useEffect(() => {
            setProfileForm(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
            }));
        
    }, []);

    const handleProfileUpdate: FormEventHandler = async (e) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            // Prepare image data if needed
            const updateData = {
                name: profileForm.name,
                // TODO: Upload image to server and get URL
                image: ""
            };

            // Update user profile
            await authClient.updateUser(updateData);

            // Only attempt email change if it's different from current
            if (profileForm.email && profileForm.email !== user.email) {
                await authClient.changeEmail({
                    newEmail: profileForm.email,
                });
            }

            toast.success('Profile updated successfully');
            
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate: FormEventHandler = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        // Validate password is not empty
        if (!passwordForm.newPassword || !passwordForm.currentPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        setLoading(true);
        try {
            await authClient.revokeOtherSessions();
            // Implement password update logic here
            await authClient.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            toast.success('Password updated successfully');
            // Reset form after successful update
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // Sign out after password change for security
            await signOut();
            toast.success('You have been signed out. Please log in again.');
        } catch (error) {
            toast.error('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange: ChangeEventHandler = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            setProfileForm(prev => ({ ...prev, newImage: file }));
        }
    };


    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>
                <Separator />

                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your profile information and email address.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage
                                                    src={profileForm.newImage
                                                        ? URL.createObjectURL(profileForm.newImage)
                                                        : user.image || undefined}
                                                    alt={user.name || "User"}
                                                />
                                                <AvatarFallback>
                                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                                >
                                                    Change avatar
                                                </Button>
                                                <input
                                                    id="avatar-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm(prev => ({
                                                    ...prev,
                                                    name: e.target.value
                                                }))}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm(prev => ({
                                                    ...prev,
                                                    email: e.target.value
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                'Save changes'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>
                                    Change your password here. After saving, you'll be logged out.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current">Current password</Label>
                                        <Input
                                            id="current"
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm(prev => ({
                                                ...prev,
                                                currentPassword: e.target.value
                                            }))}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="new">New password</Label>
                                        <Input
                                            id="new"
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm(prev => ({
                                                ...prev,
                                                newPassword: e.target.value
                                            }))}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm">Confirm password</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm(prev => ({
                                                ...prev,
                                                confirmPassword: e.target.value
                                            }))}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                'Change password'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Security Keys</CardTitle>
                                <CardDescription>
                                    Add or remove passkeys and security devices.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {
                                        passkeyPending ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                                <span className="ml-2">Loading security keys...</span>
                                            </div>
                                        ) : passkeyError ? (
                                            <p className="text-red-500">Error loading security keys: {passkeyError.message}</p>
                                        ) : passkeys?.length ? (
                                            passkeys.map((key) => (
                                                <div key={key.id} className="flex items-center justify-between">
                                                    <p className='font-medium'>{key.name}</p>

                                                    <Button variant="destructive" onClick={() => {
                                                        toast.promise(authClient.passkey.deletePasskey({
                                                            id: key.id,
                                                        }), {
                                                            description: 'Removing security key...',
                                                            success: () => {
                                                                refetchPassKey();
                                                                return 'Security key removed successfully';
                                                            },
                                                            error: (err) => {
                                                                return err.message;
                                                            },
                                                        })
                                                    }}>
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground">No security keys added.</p>
                                        )}
                                    <Separator className="my-4" />
                                    <Button variant="outline" onClick={() => {
                                        toast.promise(authClient.passkey.addPasskey({
                                            name: navigator.userAgent,
                                            authenticatorAttachment: "platform",
                                        }), {
                                            description: 'Adding security key...',
                                            success: () => {
                                                refetchPassKey();
                                                return 'Security key added successfully';
                                            },
                                            error: (err) => {
                                                return err.message;
                                            },
                                        })
                                    }}>
                                        Add security key
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sign out everywhere</CardTitle>
                                <CardDescription>
                                    Sign out from all other devices.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    onClick={async () => {
                                        await authClient.revokeOtherSessions();
                                        toast.success('Signed out from all devices');
                                    }}
                                >
                                    Sign out other sessions
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}