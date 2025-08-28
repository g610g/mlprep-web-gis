import { FloatingDock } from '@/components/floating-dock';
import { Head } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import Compass from '../../src/images/compass.png';
import Logo from '../../src/images/mlprep.png';

interface LayerData {
    name: string;
    type: 'VECTOR' | 'RASTER' | 'TILE';
    visible?: boolean;
    geojson?: any; // For WFS point layers
}

const MapComponent = () => {
    const position: [number, number] = [8.9492, 125.5436]; // Butuan City
    const [propsLayers, setPropsLayers] = useState<LayerData[]>([]);
    const [geoData, setGeoData] = useState<any>(null);

    useEffect(() => {
        console.log('Props layers updated:', propsLayers);
    }, [propsLayers]);

    useEffect(() => {
        propsLayers.forEach(async (layer, index) => {
            if (layer.visible && layer.type === 'VECTOR' && !layer.geojson) {
                try {
                    const res = await fetch(`http://127.0.0.1:8000/geoserver/features/${layer.name}`);
                    const data = await res.json();
                    setPropsLayers((prev) => {
                        const updated = [...prev];
                        updated[index] = { ...updated[index], geojson: data };
                        return updated;
                    });
                } catch (err) {
                    console.error(`Failed to fetch GeoJSON for ${layer.name}:`, err);
                }
            }
        });
    }, [propsLayers]);

    return (
        <div style={{ position: 'relative' }}>
            <Head title="Map" />

            <MapContainer center={position} zoom={6} scrollWheelZoom={true} style={{ height: '100vh', width: '100%', zIndex: 0 }}>
                {/* Base OSM layer */}
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Dynamic GeoServer WMS layers (polygons, rasterized) */}
                {propsLayers
                    .filter((layer) => layer.visible && layer.type === 'VECTOR' && layer.geojson)
                    .map((layer) => (
                        <GeoJSON
                            key={layer.name}
                            data={layer.geojson}
                            pointToLayer={(feature, latlng) =>
                                L.circleMarker(latlng, {
                                    radius: 6,
                                    fillColor: 'blue',
                                    color: '#000',
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8,
                                })
                            }
                            onEachFeature={(feature, l) => {
                                if (feature.properties) {
                                    const props = feature.properties;
                                    l.bindPopup(
                                        `<b>${props.Name || 'Unnamed Point'}</b><br/>
          Municipality: ${props.Mun_Name || 'N/A'}<br/>
          Barangay: ${props.Bgy_Name || 'N/A'}<br/>
          Priority: ${props.Prio || 'N/A'}<br/>
          Geomorphology: ${props.Geom_desc || 'N/A'}<br/>
          Site Code: ${props.Site_code || 'N/A'}`,
                                    );
                                }
                            }}
                        />
                    ))}

                {/* Example static marker */}
                <Marker position={position}>
                    <Popup>Butuan City, Philippines</Popup>
                </Marker>

                {/* GeoJSON layer for POINTS (from WFS) */}
                {geoData && (
                    <GeoJSON
                        data={geoData}
                        pointToLayer={(feature, latlng) =>
                            L.circleMarker(latlng, {
                                radius: 6,
                                fillColor: 'blue',
                                color: '#000',
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8,
                            })
                        }
                        onEachFeature={(feature, layer) => {
                            if (feature.properties) {
                                const props = feature.properties;
                                layer.bindPopup(
                                    `<b>${props.Name || 'Unnamed Point'}</b><br/>
          Municipality: ${props.Mun_Name || 'N/A'}<br/>
          Barangay: ${props.Bgy_Name || 'N/A'}<br/>
          Priority: ${props.Prio || 'N/A'}<br/>
          Geomorphology: ${props.Geom_desc || 'N/A'}<br/>
          Site Code: ${props.Site_code || 'N/A'}`,
                                );
                            }
                        }}
                    />
                )}
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

            <FloatingDock setPropsLayers={setPropsLayers} />
        </div>
    );
};

export default MapComponent;
