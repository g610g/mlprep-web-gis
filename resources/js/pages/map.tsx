import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { WMSTileLayer } from 'react-leaflet/WMSTileLayer';
import Compass from '../../src/images/compass.png';
import Logo from '../../src/images/mlprep.png';
import { Home, Map, BarChart3, Settings, User, Database, Globe, Layers } from "lucide-react"
import { useState } from 'react';

const MapComponent = () => {
    const position = [8.9492, 125.5436]; // Butuan City
    const dockItems = [
        { icon: Home, label: 'Home', href: '/', color: 'hover:text-emerald-600' },
        { icon: Map, label: 'Map', href: '/map', color: 'hover:text-blue-600' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'hover:text-amber-600' },
        { icon: Database, label: 'Data', href: '/data', color: 'hover:text-purple-600' },
        { icon: Layers, label: 'Layers', href: '/layers', color: 'hover:text-teal-600' },
        { icon: Globe, label: 'Global', href: '/global', color: 'hover:text-indigo-600' },
        { icon: User, label: 'Profile', href: '/profile', color: 'hover:text-rose-600' },
        { icon: Settings, label: 'Settings', href: '/settings', color: 'hover:text-slate-600' },
    ];

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    
    return (
        <div style={{ position: 'relative' }}>
            <Head title="Map" />

            <MapContainer center={position} zoom={6} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
                {/* Base OSM layer */}
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Your GeoServer WMS layer */}
                <WMSTileLayer
                    url="http://localhost:8080/geoserver/ne/wms"
                    layers="ne:SS_Points_v4_WGS84_20250717"
                    format="image/png"
                    transparent={true}
                />
                <WMSTileLayer
                    url="http://localhost:8080/geoserver/ne/wms"
                    layers="ne:North_Cotabato_Municipal_Boundary_WGS84"
                    format="image/png"
                    transparent={true}
                />

                <Marker position={position}>
                    <Popup>Butuan City, Philippines</Popup>
                </Marker>
            </MapContainer>

            {/* Logo overlay */}
            <div className="flex items-center space-x-3" style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
                <Avatar>
                    <AvatarImage src={Logo} alt="ML_PREP LOGO" className="size-10 rounded-full bg-transparent" />
                </Avatar>
            </div>

            {/* Compass overlay */}
            <div className="flex items-center space-x-3" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                <Avatar>
                    <AvatarImage src={Compass} alt="Compass" className="size-25 rounded-full bg-transparent" />
                </Avatar>
            </div>

            {/* Fixed dock with higher z-index */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2" style={{ zIndex: 1001 }}>
                <div className="flex items-end gap-2 px-4 py-3">
                    {dockItems.map((item, index) => {
                        const Icon = item.icon
                        const isHovered = hoveredIndex === index
                        const isAdjacent = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group relative"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div
                                    className={`
                                        flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100
                                        border border-slate-200/50 shadow-sm transition-all duration-300 ease-out
                                        ${
                                            isHovered
                                                ? "w-16 h-16 -translate-y-4 shadow-xl border-emerald-200"
                                                : isAdjacent
                                                    ? "w-12 h-12 -translate-y-1"
                                                    : "w-10 h-10"
                                        }
                                        hover:bg-gradient-to-br hover:from-emerald-50 hover:to-amber-50
                                    `}
                                >
                                    <Icon
                                        className={`
                                            transition-all duration-300 text-slate-600 ${item.color}
                                            ${isHovered ? "w-8 h-8" : isAdjacent ? "w-6 h-6" : "w-5 h-5"}
                                        `}
                                    />
                                </div>

                                {/* Tooltip */}
                                <div
                                    className={`
                                        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                        px-2 py-1 bg-slate-900 text-white text-xs rounded-md
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                        pointer-events-none whitespace-nowrap
                                    `}
                                >
                                    {item.label}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-900"></div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default MapComponent;