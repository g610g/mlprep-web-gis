import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { Label } from '@radix-ui/react-label';
import { ArrowLeft, Eye, Lock, Mail } from 'lucide-react';
import Logo from '../../../src/images/mlprep.png';
type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 p-4">
            <div className="w-full max-w-md">
                {/* Back to Home */}
                <div className="absolute top-6 left-6 z-50">
                    <Link href={route('landing')} className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-emerald-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>

                <Head title="Login"></Head>
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white via-white to-emerald-50/30 shadow-2xl backdrop-blur-sm">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-50/20" />
                    <CardHeader className="relative z-10 space-y-4 text-center">
                        <div className="flex justify-center">
                            <Avatar>
                                <AvatarImage src={Logo} alt="ML_PREP LOGO" className="size-30"></AvatarImage>
                            </Avatar>
                        </div>
                        <div>
                            <CardTitle className="font-heading text-2xl text-slate-900">Welcome Back</CardTitle>
                            <p className="mt-2 text-slate-600">Sign in to your ML-Prep account</p>
                        </div>
                    </CardHeader>

                    <CardContent className="relative z-10 space-y-6">
                        <form method="POST" className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className="focus:ring-gradient-to-r h-12 border-slate-200 pl-10 focus:border-transparent focus:from-emerald-500 focus:to-teal-500 focus:ring-2"
                                            autoFocus
                                            tabIndex={1}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            className="focus:ring-gradient-to-r h-12 border-slate-200 pr-10 pl-10 focus:border-transparent focus:from-emerald-500 focus:to-teal-500 focus:ring-2"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            autoFocus
                                            tabIndex={2}
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 hover:text-slate-600"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 text-sm">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            onClick={() => setData('remember', !data.remember)}
                                            tabIndex={3}
                                        />
                                        <Label htmlFor="remember">Remember me</Label>
                                    </label>
                                    <Link
                                        href="#"
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-sm text-transparent transition-all duration-300 hover:from-amber-600 hover:to-orange-600"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full transform bg-gradient-to-r from-emerald-600 to-teal-600 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl"
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* <div className="text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="#"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:from-amber-600 hover:to-orange-600 font-medium transition-all duration-300"
                >
                  Sign up for free
                </Link>
              </p>
            </div> */}
                    </CardContent>
                </Card>
            </div>
        </div>
        // <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 flex items-center justify-center p-4">
        //     <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-white to-emerald-50/30 backdrop-blur-sm relative overflow-hidden">
        //         <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-50/20 pointer-events-none" />
        //         <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
        //         <Head title="Log in" />

        //         <form method="POST" className="flex flex-col gap-6" onSubmit={submit}>
        //             <div className="grid gap-6">
        //                 <div className="grid gap-2">
        //                     <Label htmlFor="email">Email address</Label>
        //                     <Input
        //                         id="email"
        //                         type="email"
        //                         required
        //                         autoFocus
        //                         tabIndex={1}
        //                         autoComplete="email"
        //                         value={data.email}
        //                         onChange={(e) => setData('email', e.target.value)}
        //                         placeholder="email@example.com"
        //                     />
        //                     <InputError message={errors.email} />
        //                 </div>

        //                 <div className="grid gap-2">
        //                     <div className="flex items-center">
        //                         <Label htmlFor="password">Password</Label>
        //                         {canResetPassword && (
        //                             <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
        //                                 Forgot password?
        //                             </TextLink>
        //                         )}
        //                     </div>
        //                     <Input
        //                         id="password"
        //                         type="password"
        //                         required
        //                         tabIndex={2}
        //                         autoComplete="current-password"
        //                         value={data.password}
        //                         onChange={(e) => setData('password', e.target.value)}
        //                         placeholder="Password"
        //                     />
        //                     <InputError message={errors.password} />
        //                 </div>

        //                 <div className="flex items-center space-x-3">
        //                     <Checkbox
        //                         id="remember"
        //                         name="remember"
        //                         checked={data.remember}
        //                         onClick={() => setData('remember', !data.remember)}
        //                         tabIndex={3}
        //                     />
        //                     <Label htmlFor="remember">Remember me</Label>
        //                 </div>

        //                 <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
        //                     {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
        //                     Log in
        //                 </Button>
        //             </div>

        //             <div className="text-muted-foreground text-center text-sm">
        //                 Don't have an account?{' '}
        //                 <TextLink href={route('register')} tabIndex={5}>
        //                     Sign up
        //                 </TextLink>
        //             </div>
        //         </form>

        //         {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        //     </AuthLayout>
        //     </Card>

        // </div>
    );
}
