import { FloatingDock } from '@/components/floating-dock';
import { Head } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { WMSTileLayer } from 'react-leaflet/WMSTileLayer';
import Compass from '../../src/images/compass.png';
import Logo from '../../src/images/mlprep.png';

const MapComponent = () => {
    const position = [8.9492, 125.5436]; // Butuan City
    return (
        <div style={{ position: 'relative' }}>
            <Head title="Map" />

            <MapContainer center={position} zoom={6} scrollWheelZoom={true} style={{ height: '100vh', width: '100%', zIndex:0}}>
                {/* Base OSM layer */}
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Your GeoServer WMS layer */}
                <WMSTileLayer
                    url="http://localhost:8080/geoserver/ne/wms"
                    layers="ne:North_Cotabato_Municipal_Boundary_WGS84"
                    format="image/png"
                    transparent={true}
                />

                <Marker position={position}>
                    <Popup>Butuan City, Philippines</Popup>
                </Marker>
                {/* <FloatingDock /> */}
                
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
            
            <FloatingDock></FloatingDock>
            
        </div>
    );
};

export default MapComponent;
