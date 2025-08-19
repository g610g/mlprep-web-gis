import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, MapPin, MapPinned, Play } from 'lucide-react';

import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import Map from '../../src/images/gis_sample.png';
import Logo from '../../src/images/mlprep.png';
export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
            {/* Navigation */}
            <Head title='ML-Prep' ></Head>
            <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar>
                                <AvatarImage src={Logo} alt="ML_PREP LOGO" className="size-10"></AvatarImage>
                            </Avatar>

                            <span className="font-heading text-xl font-bold text-slate-900">ML-Prep</span>
                        </div>
                        <div className="hidden items-center space-x-8 md:flex">
                            <a href="#features" className="text-slate-600 transition-colors hover:text-emerald-600">
                                Features
                            </a>
                            <a href="#solutions" className="text-slate-600 transition-colors hover:text-emerald-600">
                                Solutions
                            </a>
                            <a href="#About" className="text-slate-600 transition-colors hover:text-emerald-600">
                                About
                            </a>
                            <Link
                                href={route('login')}
                                as="button"
                                className="rounded-md border-emerald-600 bg-transparent px-4 py-2 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-amber-600/10"></div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    WebGIS Platform
                                </Badge>
                                <h1 className="font-heading text-4xl leading-tight font-bold text-slate-900 lg:text-6xl">
                                    Elevate Your{' '}
                                    <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">Spatial Data</span>{' '}
                                    Analysis
                                </h1>
                                <p className="text-xl leading-relaxed text-slate-600">
                                    Harness the power of machine learning to transform geographic insights into actionable intelligence.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="transform bg-emerald-600 px-8 py-3 text-lg text-white transition-all duration-300 hover:scale-105 hover:bg-amber-600"
                                >
                                    <Play className="mr-2 h-5 w-5" />
                                    Get Started
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-emerald-600 bg-transparent px-8 py-3 text-lg text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                >
                                    Explore Features
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 rotate-3 transform rounded-3xl bg-gradient-to-r from-emerald-600/20 to-amber-600/20"></div>
                            <Card className="relative rounded-3xl border-0 bg-white shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-900">
                                        <MapPinned className="h-5 w-5 text-emerald-600" />
                                        Spatial Analytics Workspace
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-2">
                                    <Avatar>
                                        <AvatarImage src={Map} alt="ML_PREP LOGO" className="mx-auto h-80 w-140 rounded-2xl"></AvatarImage>
                                    </Avatar>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-emerald-600 to-amber-600 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center text-white">
                        <h2 className="font-heading mb-4 text-3xl font-bold lg:text-4xl">Real-Time Geographic Data Trends</h2>
                        <p className="mx-auto max-w-3xl text-xl text-emerald-100">
                            Explore live insights from spatial data analysis happening around the world.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="border-white/20 bg-white/10 text-center backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="font-heading mb-2 text-4xl font-bold text-white">2.4M+</div>
                                <Separator className="my-4 bg-white/20" />
                                <div className="text-emerald-100">Data Points Analyzed</div>
                            </CardContent>
                        </Card>
                        <Card className="border-white/20 bg-white/10 text-center backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="font-heading mb-2 text-4xl font-bold text-white">150+</div>
                                <Separator className="my-4 bg-white/20" />
                                <div className="text-emerald-100">Countries Covered</div>
                            </CardContent>
                        </Card>
                        <Card className="border-white/20 bg-white/10 text-center backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="font-heading mb-2 text-4xl font-bold text-white">99.9%</div>
                                <Separator className="my-4 bg-white/20" />
                                <div className="text-emerald-100">Accuracy Rate</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-slate-900 py-20">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="font-heading mb-6 text-3xl font-bold text-white lg:text-4xl">Ready to Transform Your Spatial Analysis?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-300">
                        Join thousands of data scientists and GIS professionals who trust ML-Prep for their spatial intelligence needs.
                    </p>
                    <Button
                        size="lg"
                        className="transform bg-amber-600 px-12 py-4 text-lg text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-600"
                    >
                        Get Started Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="mb-4 flex items-center space-x-3 md:mb-0">
                            <Avatar>
                                <AvatarImage src={Logo} alt="ML_PREP LOGO" className="size-10"></AvatarImage>
                            </Avatar>
                            <span className="font-heading text-lg font-bold text-slate-900">ML-Prep</span>
                        </div>
                        <div className="text-slate-600">© 2024 ML-Prep. Elevating spatial data analysis worldwide.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
