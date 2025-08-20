import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { AlignJustify, BarChart3, Database, Eye, EyeOff, Globe, Home, Layers, LayersIcon, Map, Plus, Settings, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface FloatingDockProps {
    onLayersClick: () => void;
}

interface Layer {
    id: string;
    name: string;
    type: 'VECTOR' | 'RASTER' | 'TILE';
    visible: boolean;
}

const dockItems = [
    { icon: Home, label: 'Home', href: '/', color: 'hover:text-emerald-600', type: 'link' as const },
    { icon: Map, label: 'Map', href: '/map', color: 'hover:text-blue-600', type: 'link' as const },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'hover:text-amber-600', type: 'link' as const },
    { icon: Database, label: 'Data', href: '/data', color: 'hover:text-purple-600', type: 'link' as const },
    { icon: Layers, label: 'Layers', color: 'hover:text-teal-600', type: 'layer' as const },
    { icon: Globe, label: 'Global', href: '/global', color: 'hover:text-indigo-600', type: 'link' as const },
    { icon: User, label: 'Profile', href: '/profile', color: 'hover:text-rose-600', type: 'link' as const },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'hover:text-slate-600', type: 'link' as const },
];

export function FloatingDock() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [geoLayers, setGeoLayers] = useState<any[]>([]);
    const [fetchedLayers, setFetchedLayers] = useState<any[]>([]);
    const [uploadShape, setUploadShape] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    const toggleLayerVisibility = (layerId: string) => {
        setLayers(layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)));
    };

    const updateLayerOpacity = (layerId: string, value: number[]) => {
        setLayers(layers.map((layer) => (layer.id === layerId ? { ...layer, opacity: value[0] } : layer)));
    };
    useEffect(() => {
        fetchGeoserverLayers();
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            const detailResults = await Promise.all(
                geoLayers.map(async (layer: any) => {
                    const res = await axios.get(`http://127.0.0.1:8000/geoserver/layers/${layer.name}`);
                    return res.data; // {layer: {...}}
                }),
            );
            // Normalize each layer entry to your interface
            const normalizedLayers: Layer[] = detailResults.map((item: any) => {
                const l = item.layer;
                return {
                    id: l.name,
                    name: l.name,
                    type: l.type as Layer['type'],
                    visible: false,
                };
            });
            setFetchedLayers(detailResults); // optional: raw data
            setLayers(normalizedLayers); // usable by UI
        };

        if (geoLayers.length > 0) {
            fetchDetails();
        }
    }, [geoLayers]);

    const getLayerTypeColor = (type: Layer['type']) => {
        switch (type) {
            case 'VECTOR':
                return 'bg-emerald-100 text-emerald-800';
            case 'RASTER':
                return 'bg-amber-100 text-amber-800';
            case 'TILE':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const addLayer = async (e: any) => {
        e.preventDefault();
        console.log('Add Layer Button Clicked!');
    };

    const fetchGeoserverLayers = async () => {
        console.log('Layers Rendered!');
        try {
            const response = await axios.get('http://127.0.0.1:8000/geoserver/layers');
            const allLayers = response.data.layers.layer; // or wherever your array is
            // Filter by workspace prefix
            const mlprepLayers = allLayers.filter((item: any) => item.name.startsWith('mlprep:'));
            console.log('Filtered:', mlprepLayers);
            setGeoLayers(mlprepLayers);
            return mlprepLayers;
        } catch (error) {
            console.error('Error fetching Geoserver Layers:', error);
            throw error; // optional: rethrow if you want caller to handle it
        }
    };

    const uploadShapeFile = async (e: any) => {
        e.preventDefault();
        const file = uploadShape;
        if (!file) {
            alert('Please Select a Zip File');
        }
        setUploadLoading(true);
        console.log(file);
        const formData = new FormData();
        formData.append('zipfile', file);

        try {
            const response = await axios.post('http://127.0.0.1:8000/geoserver/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleFileChange = (e: any) => {
        setUploadShape(e.target.files[0]);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 transform" style={{ zIndex: 1001 }}>
            <div className="flex items-end gap-2 px-4 py-3">
                {dockItems.map((item, index) => {
                    const Icon = item.icon;
                    const isHovered = hoveredIndex === index;
                    const isAdjacent = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

                    if (item.type === 'layer') {
                        return (
                            <Sheet key={item.label} open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                    <button
                                        className="group relative"
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={() => {
                                            console.log('Layer button clicked');
                                            setIsSheetOpen(true);
                                        }}
                                    >
                                        <div
                                            className={`flex items-center justify-center rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm transition-all duration-300 ease-out ${
                                                isHovered
                                                    ? 'h-16 w-16 -translate-y-4 border-emerald-200 shadow-xl'
                                                    : isAdjacent
                                                      ? 'h-12 w-12 -translate-y-1'
                                                      : 'h-10 w-10'
                                            } hover:bg-gradient-to-br hover:from-emerald-50 hover:to-amber-50`}
                                        >
                                            <Icon
                                                className={`text-slate-600 transition-all duration-300 ${item.color} ${isHovered ? 'h-8 w-8' : isAdjacent ? 'h-6 w-6' : 'h-5 w-5'} `}
                                            />
                                        </div>

                                        {/* Tooltip */}
                                        <div
                                            className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                                        >
                                            {item.label}
                                            <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-2 border-r-2 border-l-2 border-transparent border-t-slate-900"></div>
                                        </div>
                                    </button>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className={
                                        'my-auto h-150 w-80 overflow-hidden rounded-l-lg bg-white bg-gradient-to-br from-slate-50 to-emerald-50 sm:w-96'
                                    }
                                    style={{ zIndex: 1002 }}
                                >
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2 text-emerald-700">
                                            <LayersIcon className="h-5 w-5" /> Layer Controls
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="">
                                        <Dialog>
                                            <DialogTrigger className="mx-4 size-8 w-90 rounded-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700">
                                                Add Layer
                                            </DialogTrigger>
                                            <DialogContent className="z-[2000] w-[450px] rounded-lg bg-white p-6">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2 text-emerald-700">
                                                        <LayersIcon className="h-5 w-5" /> Add Layer
                                                    </DialogTitle>
                                                </DialogHeader>

                                                <Tabs defaultValue="available" className="h-100">
                                                    <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger value="available">Available Layers</TabsTrigger>
                                                        <TabsTrigger value="upload">Upload</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="available">
                                                        {layers.map((layer) => (
                                                            <div
                                                                key={layer.id}
                                                                className={`rounded-lg border p-3 transition-all ${
                                                                    layer.visible ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                                                                }`}
                                                            >
                                                                <div className="mb-2 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="max-w-[150px] truncate whitespace-nowrap" title={layer.name}>
                                                                            {layer.name}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-1">
                                                                        <Badge className={`text-xs ${getLayerTypeColor(layer.type)}`}>
                                                                            {layer.type}
                                                                        </Badge>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-auto p-1 text-green-400 hover:bg-green-600 hover:text-white"
                                                                        >
                                                                            <Plus className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </TabsContent>
                                                    <TabsContent value="upload">
                                                        <form className="mt-2 flex items-center gap-2" onSubmit={uploadShapeFile}>
                                                            <input
                                                                type="file"
                                                                className="block text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-emerald-700 hover:file:bg-emerald-100"
                                                                onChange={(e) => setUploadShape(e.target.files[0])}
                                                                accept=".zip"
                                                                required
                                                            />
                                                            <Button type="submit" className="text-sm" disabled={uploadLoading}>
                                                                {uploadLoading ? 'Uploading...' : 'Upload'}
                                                            </Button>
                                                        </form>
                                                    </TabsContent>
                                                </Tabs>
                                            </DialogContent>
                                        </Dialog>

                                        <hr className="my-5"></hr>

                                        {layers.map((layer) => (
                                            <div
                                                key={layer.id}
                                                className={`rounded-lg border p-3 transition-all ${
                                                    layer.visible ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                                                }`}
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-1"
                                                            onClick={() => toggleLayerVisibility(layer.id)}
                                                        >
                                                            {layer.visible ? (
                                                                <Eye className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </Button>
                                                        <div className="max-w-[150px] truncate whitespace-nowrap" title={layer.name}>
                                                            {layer.name}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Badge className={`text-xs ${getLayerTypeColor(layer.type)}`}>{layer.type}</Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-1 text-red-500 hover:bg-red-500 hover:text-white"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-auto p-1">
                                                            <AlignJustify className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="group relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div
                                className={`flex items-center justify-center rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm transition-all duration-300 ease-out ${
                                    isHovered
                                        ? 'h-16 w-16 -translate-y-4 border-emerald-200 shadow-xl'
                                        : isAdjacent
                                          ? 'h-12 w-12 -translate-y-1'
                                          : 'h-10 w-10'
                                } hover:bg-gradient-to-br hover:from-emerald-50 hover:to-amber-50`}
                            >
                                <Icon
                                    className={`text-slate-600 transition-all duration-300 ${item.color} ${isHovered ? 'h-8 w-8' : isAdjacent ? 'h-6 w-6' : 'h-5 w-5'} `}
                                />
                            </div>

                            {/* Tooltip */}
                            <div
                                className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                            >
                                {item.label}
                                <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-2 border-r-2 border-l-2 border-transparent border-t-slate-900"></div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
