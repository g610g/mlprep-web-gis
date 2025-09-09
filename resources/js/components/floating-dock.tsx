import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import {
    AlignJustify,
    BarChart3,
    Database,
    Eye,
    EyeOff,
    Globe,
    Home,
    Layers,
    LayersIcon,
    Map,
    Plus,
    Search,
    Settings,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdFileDownload } from 'react-icons/md';
import { Badge } from './ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface FloatingDockProps {
    setPropsLayers: React.Dispatch<React.SetStateAction<LayerData[]>>;
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
    { icon: Database, label: 'Data', href: '/data', color: 'hover:text-purple-600', type: 'data' as const },
    { icon: Layers, label: 'Layers', color: 'hover:text-teal-600', type: 'layer' as const },
    { icon: Globe, label: 'Global', href: '/global', color: 'hover:text-indigo-600', type: 'link' as const },
    { icon: User, label: 'Profile', href: '/profile', color: 'hover:text-rose-600', type: 'link' as const },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'hover:text-slate-600', type: 'link' as const },
];
const invoices = [
    {
        invoice: 'INV001',
        paymentStatus: 'Paid',
        totalAmount: '$250.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoice: 'INV002',
        paymentStatus: 'Pending',
        totalAmount: '$150.00',
        paymentMethod: 'PayPal',
    },
    {
        invoice: 'INV003',
        paymentStatus: 'Unpaid',
        totalAmount: '$350.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoice: 'INV004',
        paymentStatus: 'Paid',
        totalAmount: '$450.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoice: 'INV005',
        paymentStatus: 'Paid',
        totalAmount: '$550.00',
        paymentMethod: 'PayPal',
    },
    {
        invoice: 'INV006',
        paymentStatus: 'Pending',
        totalAmount: '$200.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoice: 'INV007',
        paymentStatus: 'Unpaid',
        totalAmount: '$300.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoice: 'INV007',
        paymentStatus: 'Unpaid',
        totalAmount: '$300.00',
        paymentMethod: 'Credit Card',
    },
];
export function FloatingDock({ setPropsLayers }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [geoLayers, setGeoLayers] = useState<any[]>([]);
    const [fetchedLayers, setFetchedLayers] = useState<any[]>([]);
    const [uploadShape, setUploadShape] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    const form = useForm();
    const [filename, setFilename] = useState('');
    const [description, setDescription] = useState('');
    const [fileExtension, setFileExtension] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false); // outer Data Table
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // inner Add Data ✅

    // New state to track active layers (layers currently in Layer Controls)
    const [activeLayers, setActiveLayers] = useState<Layer[]>([]);

    const toggleLayerVisibility = (layerId: string) => {
        const updated = activeLayers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer));
        setActiveLayers(updated);
        setPropsLayers(updated);
    };

    const updateLayerOpacity = (layerId: string, value: number[]) => {
        setActiveLayers(activeLayers.map((layer) => (layer.id === layerId ? { ...layer, opacity: value[0] } : layer)));
    };

    // Function to add a layer from available layers to active layers
    const addLayerToActive = (layerToAdd: Layer) => {
        const newActiveLayer = { ...layerToAdd, visible: true };
        const updatedActiveLayers = [...activeLayers, newActiveLayer];
        setActiveLayers(updatedActiveLayers);
        setPropsLayers(updatedActiveLayers);
    };

    // Function to remove a layer from active layers
    const removeLayerFromActive = (layerId: string) => {
        const updatedActiveLayers = activeLayers.filter((layer) => layer.id !== layerId);
        setActiveLayers(updatedActiveLayers);
        setPropsLayers(updatedActiveLayers);
    };

    // Function to permanently delete a layer from GeoServer
    const deleteLayerFromGeoServer = async (layerName: string) => {
        if (!confirm(`Are you sure you want to permanently delete the layer "${layerName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await axios.delete(`http://127.0.0.1:8000/geoserver/layers/${layerName}`);

            if (response.data.success && response.status === 200) {
                alert('Layer deleted successfully!');

                // Refresh the layers after successful deletion (same as upload)
                fetchGeoserverLayers();
            } else {
                alert(`Failed to delete layer: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting layer:', error);

            if (error.response?.data?.message) {
                alert(`Delete failed: ${error.response.data.message}`);
            } else if (error.response?.status === 404) {
                alert('Layer not found on GeoServer');
            } else if (error.response?.status === 403) {
                alert('Permission denied. You may not have rights to delete this layer.');
            } else if (error.response?.status === 405) {
                alert('Delete method not allowed. Please check your server configuration.');
            } else {
                alert('Failed to delete layer. Please try again.');
            }
        }
    };

    // Filter layers to show only those not already in active layers
    const availableLayers = layers.filter((layer) => !activeLayers.some((activeLayer) => activeLayer.id === layer.id));

    useEffect(() => {
        fetchGeoserverLayers();
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            const detailResults = await Promise.all(
                geoLayers.map(async (layer: any) => {
                    const res = await axios.get(`http://127.0.0.1:8000/geoserver/layers/${layer.name}`);
                    return res.data;
                }),
            );

            const normalizedLayers: Layer[] = detailResults.map((item: any) => {
                const l = item.layer;
                return {
                    id: l.name,
                    name: l.name,
                    type: l.type as Layer['type'],
                    visible: false,
                };
            });
            setFetchedLayers(detailResults);
            setLayers(normalizedLayers);
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

    const fetchGeoserverLayers = async () => {
        console.log('Layers Rendered!');
        try {
            const response = await axios.get('http://127.0.0.1:8000/geoserver/layers');
            const allLayers = response.data.layers.layer;
            const mlprepLayers = allLayers.filter((item: any) => item.name.startsWith('mlprep:'));
            console.log('Filtered:', mlprepLayers);
            setGeoLayers(mlprepLayers);
            console.log(fetchedLayers);
            setPropsLayers(mlprepLayers);
            return mlprepLayers;
        } catch (error) {
            console.error('Error fetching Geoserver Layers:', error);
            throw error;
        }
    };

    const uploadShapeFile = async (e: any) => {
        e.preventDefault();
        const file = uploadShape;
        if (!file) {
            alert('Please Select a Zip File');
            return;
        }

        setUploadLoading(true);
        console.log(file);

        const formData = new FormData();
        formData.append('zipfile', file);

        try {
            const response = await axios.post('/geoserver/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });

            console.log('Upload successful:', response.data);

            if (response.data.success) {
                alert('Shapefile uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload failed:', error);

            if (error.response?.data?.message) {
                alert(`Upload failed: ${error.response.data.message}`);
            } else {
                alert('Upload failed. Please try again.');
            }
        } finally {
            setUploadLoading(false);
            fetchGeoserverLayers();
        }
    };

    const handleSubmitForm = async (e: any) => {
        const formData = new FormData();
        formData.append('name', e.name || '');
        formData.append('description', e.description || '');

        if (selectedFile) {
            formData.append('file', selectedFile); // ✅ real File object
        } else {
            console.error('No file selected!');
            return;
        }

        try {
            const response = await axios.post('/map/add-data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });
            console.log('Add Data Successfully!', response.data);
        } catch (error) {
            console.error(error);
        }
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
                                        <Dialog modal={false} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger
                                                className="mx-4 size-8 w-90 rounded-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                                                onClick={() => setIsDialogOpen(true)}
                                            >
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
                                                        {availableLayers.length === 0 ? (
                                                            <div className="py-4 text-center text-gray-500">
                                                                {layers.length === 0 ? 'No layers available' : 'All layers are already added'}
                                                            </div>
                                                        ) : (
                                                            availableLayers.map((layer) => (
                                                                <div
                                                                    key={layer.id}
                                                                    className="mb-2 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50"
                                                                >
                                                                    <div className="mb-2 flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="max-w-[150px] truncate whitespace-nowrap"
                                                                                title={layer.name}
                                                                            >
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
                                                                                onClick={() => addLayerToActive(layer)}
                                                                                title="Add layer to controls"
                                                                            >
                                                                                <Plus className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-auto p-1 text-red-500 hover:bg-red-500 hover:text-white"
                                                                                onClick={() => deleteLayerFromGeoServer(layer.name)}
                                                                                title="Delete layer permanently from GeoServer"
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
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

                                        {activeLayers.length === 0 ? (
                                            <div className="py-4 text-center text-gray-500">No active layers</div>
                                        ) : (
                                            activeLayers.map((layer) => (
                                                <div
                                                    key={layer.id}
                                                    className={`mb-2 rounded-lg border p-3 transition-all ${
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
                                                                onClick={() => removeLayerFromActive(layer.id)}
                                                                title="Remove layer from controls"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-auto p-1">
                                                                <AlignJustify className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        );
                    }

                    if (item.type === 'data') {
                        return (
                            <>
                                <Dialog key={item.label} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <button
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
                                                    className={`text-slate-600 transition-all duration-300 ${item.color} ${
                                                        isHovered ? 'h-8 w-8' : isAdjacent ? 'h-6 w-6' : 'h-5 w-5'
                                                    }`}
                                                />
                                            </div>

                                            {/* Tooltip */}
                                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                {item.label}
                                                <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-2 border-r-2 border-l-2 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </button>
                                    </DialogTrigger>

                                    <DialogContent className="h-[80vh] w-[150vh] !max-w-none rounded-lg bg-white">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2 text-lg text-emerald-700">
                                                <Database className="h-5 w-5" /> Data Table
                                            </DialogTitle>
                                        </DialogHeader>

                                        {/* Search + Add Row */}
                                        <div className="flex items-center justify-between" style={{ marginTop: '-20vh' }}>
                                            {/* Search bar */}
                                            <div className="relative w-1/3">
                                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-8 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>

                                            {/* Button that triggers Add Data dialog */}
                                            <Button
                                                className="cursor-pointer bg-emerald-600 text-white"
                                                onClick={() => setIsAddDialogOpen(true)} // ✅ trigger outside dialog
                                            >
                                                <Plus className="h-4 w-4" /> Add Data
                                            </Button>
                                        </div>

                                        {/* Scrollable table wrapper */}
                                        <div className="-mt-25 max-h-[65vh] overflow-auto rounded-sm border">
                                            <Table className="border-b-1">
                                                <TableHeader className="sticky top-0 bg-white shadow-sm">
                                                    <TableRow>
                                                        <TableHead className='w-[200px]'>Name</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead className="w-[150px]">Filename</TableHead>
                                                        <TableHead className="w-[100px]">File extension</TableHead>
                                                        <TableHead className="w-[100px]">Size</TableHead>
                                                        <TableHead className="w-[100px] text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {invoices.map((invoice) => (
                                                        <TableRow key={invoice.invoice}>
                                                            <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                                            <TableCell>{invoice.paymentStatus}</TableCell>
                                                            <TableCell>{invoice.paymentMethod}</TableCell>
                                                            <TableCell>{invoice.paymentMethod}</TableCell>
                                                            <TableCell>{invoice.paymentMethod}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" className='cursor-pointer'>
                                                                    <MdFileDownload />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                {/* INNER ADD DATA DIALOG (moved OUTSIDE) ✅ */}
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogContent className="bg-white shadow-lg sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle className="my-2">Add New Data</DialogTitle>
                                        </DialogHeader>

                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(handleSubmitForm)}>
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem className="my-2">
                                                            <FormLabel>Filename</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Filename" type="text" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem className="my-2">
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Description" type="text" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="file"
                                                    render={({ field: { onChange, ...rest } }) => (
                                                        <FormItem className="my-2">
                                                            <FormLabel>Upload File</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="file"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0] || null;
                                                                        setSelectedFile(file);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button variant="secondary" className="bg-black text-white" type="submit">
                                                    Submit
                                                </Button>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </>
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
