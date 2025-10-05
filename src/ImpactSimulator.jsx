// src/ImpactSimulator.jsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet';
import { calculateImpactRadius } from './ImpactCalculator'; // Import the calculation logic

// --- Fix for default Leaflet icon issue in React (Crucial for the marker to show) ---
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// ---------------------------------------------------------------------------------

// Component to handle map clicks and set the impact location
function LocationMarker({ onLocationSelect, position }) {
    useMapEvents({
        click(e) {
            console.log('Map clicked at:', e.latlng);
            onLocationSelect(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

function ImpactSimulator() {
    // --- State for Inputs and Results ---
    const [density, setDensity] = useState(7800); // Default: Iron (kg/m³)
    const [speed, setSpeed] = useState(17000); // Default: m/s
    const [diameter, setDiameter] = useState(500); // Default: meters (larger for visibility)
    const [impactLocation, setImpactLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to New York City
    const [impactResults, setImpactResults] = useState(null);
    const [error, setError] = useState(null);

    // Helper to format large numbers
    const formatNumber = (num, decimals = 2) => num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    // Helper to detect if impact location is over water (simplified detection)
    const isOverWater = (lat, lng) => {
        // Simple heuristic: if latitude is between -60 and 60 and longitude is in ocean regions
        // This is a simplified approach - in a real app you'd use proper ocean/land detection
        const oceanRegions = [
            { lat: [0, 60], lng: [-180, -120] }, // Pacific
            { lat: [0, 60], lng: [120, 180] },   // Pacific
            { lat: [-60, 0], lng: [-180, -120] }, // Pacific
            { lat: [-60, 0], lng: [120, 180] },   // Pacific
            { lat: [-60, 60], lng: [-60, 20] },   // Atlantic
            { lat: [-60, 60], lng: [20, 60] },    // Indian Ocean
        ];
        
        return oceanRegions.some(region => 
            lat >= region.lat[0] && lat <= region.lat[1] &&
            lng >= region.lng[0] && lng <= region.lng[1]
        );
    };

    // Function to run the calculation
    const runCalculation = useCallback(() => {
        try {
            setError(null);
            console.log('Running calculation with:', { density, speed, diameter });
            const result = calculateImpactRadius(
                density,
                speed,
                diameter
            );
            
            // Apply water impact reduction if over water
            const overWater = isOverWater(impactLocation.lat, impactLocation.lng);
            if (overWater) {
                // Apply 50% radius reduction for water impacts (middle of 20-70% range)
                const waterReductionFactor = 0.5;
                result.severe_radius_km *= waterReductionFactor;
                result.moderate_radius_km *= waterReductionFactor;
                result.light_radius_km *= waterReductionFactor;
                result.impact_type = 'water';
                result.water_reduction = '50%';
            } else {
                result.impact_type = 'land';
                result.water_reduction = '0%';
            }
            
            console.log('Calculation result:', result);
            setImpactResults(result);
        } catch (err) {
            console.error('Calculation error:', err);
            setError(err.message);
            setImpactResults(null);
        }
    }, [density, speed, diameter, impactLocation]);


    // Handles map click event
    const handleLocationSelect = useCallback((latlng) => {
        setImpactLocation(latlng);
        // Automatically re-run calculation when location changes
        runCalculation(); 
    }, [runCalculation]);


    // Run calculation once on mount and when inputs change
    useEffect(() => {
        runCalculation();
    }, [runCalculation]);


    // --- Map Configuration: Define the circles to draw based on results ---
    const circles = useMemo(() => {
        if (!impactResults) return [];
        // Leaflet Circle radius is in meters, so convert km to m (1km = 1000m)
        // Add minimum radius to ensure visibility
        const minRadius = 1000; // 1km minimum radius
        const circleData = [
            { 
                radius: Math.max(impactResults.light_radius_km * 1000, minRadius), 
                color: '#FFD700', 
                fillColor: '#FFD700', 
                fillOpacity: 0.4, 
                weight: 5, 
                name: "Light Damage" 
            },
            { 
                radius: Math.max(impactResults.moderate_radius_km * 1000, minRadius * 0.7), 
                color: '#FF8C00', 
                fillColor: '#FF8C00', 
                fillOpacity: 0.4, 
                weight: 5, 
                name: "Moderate Damage" 
            },
            { 
                radius: Math.max(impactResults.severe_radius_km * 1000, minRadius * 0.4), 
                color: '#FF0000', 
                fillColor: '#FF0000', 
                fillOpacity: 0.4, 
                weight: 5, 
                name: "Severe Damage" 
            },
        ].sort((a, b) => b.radius - a.radius); // Draw largest first
        
        console.log('Circle data:', circleData);
        return circleData;
    }, [impactResults]);

    // Calculate map zoom level based on the size of the impact area
    const mapZoom = impactResults 
        ? (impactResults.light_radius_km > 100 ? 6 : (impactResults.light_radius_km > 10 ? 8 : 10))
        : 10; // Better default zoom for New York City

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '0', margin: '0', fontFamily: 'Arial, sans-serif', backgroundColor: '#000000', minHeight: '100vh', width: '100%' }}>
            {/* Left Section: Controls */}
            <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
                <h2 style={{ color: '#ffffff', marginBottom: '10px' }}>Asteroid Parameters</h2>
                <p style={{ color: '#cccccc', marginBottom: '20px' }}>Modify the values and click "Analyze Simulation" or click the map to set location.</p>

                {/* Input Fields */}
                {[
                    { 
                        label: "Density (kg/m³)", 
                        value: density, 
                        setter: setDensity, 
                        min: 1000, 
                        max: 300000, 
                        step: 1500,
                        format: (val) => `${val.toLocaleString()} kg/m³`
                    },
                    { 
                        label: "Speed (m/s)", 
                        value: speed, 
                        setter: setSpeed, 
                        min: 1000, 
                        max: 1250000, 
                        step: 12500,
                        format: (val) => `${val.toLocaleString()} m/s`
                    },
                    { 
                        label: "Diameter (meters)", 
                        value: diameter, 
                        setter: setDiameter, 
                        min: 10, 
                        max: 50000, 
                        step: 250,
                        format: (val) => `${val.toLocaleString()} m`
                    },
                ].map(({ label, value, setter, min, max, step, format }) => (
                    <div key={label} style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ffffff' }}>
                            {label}: {format(value)}
                        </label>
                        <input
                            type="range"
                            value={value}
                            onChange={(e) => setter(Number(e.target.value))}
                            min={min}
                            max={max}
                            step={step}
                            style={{ 
                                width: '100%', 
                                height: '8px',
                                background: '#333333',
                                outline: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                accentColor: '#007bff'
                            }}
                        />
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '12px', 
                            color: '#999999',
                            marginTop: '4px'
                        }}>
                            <span>{format(min)}</span>
                            <span>{format(max)}</span>
                        </div>
                    </div>
                ))}
                
                <button 
                    onClick={runCalculation} 
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Analyze Impact Simulation
                </button>

                {/* Results Display */}
                <h3 style={{ marginTop: '30px', borderTop: '1px solid #444444', paddingTop: '20px', color: '#ffffff' }}>Impact Analysis</h3>
                
                <p style={{ color: '#cccccc' }}>Location: ({formatNumber(impactLocation.lat, 4)}°, {formatNumber(impactLocation.lng, 4)}°)</p>
                <p style={{ color: '#cccccc' }}>Status: {impactResults ? `Circles should be visible on map` : `No impact data - click "Analyze Impact Simulation"`}</p>
                {impactResults && (
                    <p style={{ 
                        fontWeight: 'bold', 
                        color: impactResults.impact_type === 'water' ? '#66b3ff' : '#d4af37',
                        backgroundColor: impactResults.impact_type === 'water' ? '#001a33' : '#332d00',
                        padding: '8px',
                        borderRadius: '4px',
                        margin: '10px 0'
                    }}>
                        {impactResults.impact_type === 'water' ? '🌊 Water Impact' : '🏔️ Land Impact'} 
                        {impactResults.water_reduction !== '0%' && ` (${impactResults.water_reduction} radius reduction)`}
                    </p>
                )}

                {error && <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Calculation Error: {error}</p>}

                {impactResults && (
                    <div>
                        <p style={{ color: '#cccccc' }}>Kinetic Energy: <b style={{ color: '#ffffff' }}>{impactResults.kinetic_energy_joules.toExponential(2)}</b> J</p>
                        <p style={{ color: '#cccccc' }}>Overall Classification: 
                            <b style={{ color: impactResults.damage_classification === 'Severe' ? '#ff6b6b' : impactResults.damage_classification === 'Moderate' ? '#ffa500' : '#90ee90', marginLeft: '5px' }}>
                                {impactResults.damage_classification}
                            </b>
                        </p>
                        
                        <h4 style={{ marginTop: '15px', color: '#ffffff' }}>Damage Radii (km)</h4>
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ marginBottom: '15px', padding: '10px', border: '2px solid #ff6b6b', borderRadius: '5px', backgroundColor: '#2d1a1a' }}>
                                <div style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                    🟥 Severe Damage: {formatNumber(impactResults.severe_radius_km)} km
                                </div>
                                <div style={{ fontSize: '14px', color: '#cccccc', lineHeight: '1.4' }}>
                                    Everything near ground zero is destroyed by the blast, heat, and shockwave — survival is nearly impossible. This zone represents the highest casualty area, where buildings, terrain, and infrastructure are completely obliterated.
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '15px', padding: '10px', border: '2px solid #ffa500', borderRadius: '5px', backgroundColor: '#2d241a' }}>
                                <div style={{ color: '#ffa500', fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                    🟧 Moderate Damage: {formatNumber(impactResults.moderate_radius_km)} km
                                </div>
                                <div style={{ fontSize: '14px', color: '#cccccc', lineHeight: '1.4' }}>
                                    Severe structural damage extends outward, with many buildings collapsing and fires starting. People outside or in weak structures are at high risk, but survival is possible in reinforced shelters.
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '15px', padding: '10px', border: '2px solid #ffd700', borderRadius: '5px', backgroundColor: '#2d2a1a' }}>
                                <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                    🟨 Light Damage: {formatNumber(impactResults.light_radius_km)} km
                                </div>
                                <div style={{ fontSize: '14px', color: '#cccccc', lineHeight: '1.4' }}>
                                    Further from the impact, most buildings stay intact, but windows shatter and weaker structures are damaged. Injuries occur mainly from debris and shockwaves, though fatalities are limited and emergency response is feasible.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Section: Map */}
            <div style={{ flex: 2, backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
                <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Earth Impact Map</h2>
                
                {/* Atmospheric Entry Process - Only show when impact results exist */}
                {impactResults && (
                    <div style={{ 
                        marginBottom: '20px', 
                        padding: '15px', 
                        backgroundColor: '#2a2a2a', 
                        borderRadius: '8px',
                        border: '1px solid #444444'
                    }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#ffffff' }}>Asteroid Impact Process</h4>
                        
                        <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#333333', borderRadius: '6px', border: '1px solid #555555' }}>
                            <div style={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '5px' }}>
                                🌠 Step 1: Atmospheric Entry
                            </div>
                            <div style={{ fontSize: '14px', color: '#cccccc', lineHeight: '1.4' }}>
                                The asteroid enters Earth's atmosphere at hypersonic speed, generating extreme heat and a glowing plasma trail as air resistance intensifies.
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#333333', borderRadius: '6px', border: '1px solid #555555' }}>
                            <div style={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '5px' }}>
                                ☄️ Step 2: Fragmentation or Survival
                            </div>
                            <div style={{ fontSize: '14px', color: '#cccccc', lineHeight: '1.4' }}>
                                Smaller bodies disintegrate midair in a powerful airburst, while larger, denser asteroids remain intact and continue toward the surface.
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '0', padding: '10px', backgroundColor: '#333333', borderRadius: '6px', border: '1px solid #555555' }}>
                            <div style={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '5px' }}>
                                💥 Step 3: Surface Impact
                            </div>
                            <div style={{ fontSize: '14px', color: '#cccccc', lineHeight: '1.4' }}>
                                Upon collision, massive kinetic energy is released as shock waves, heat, and blast effects—forming the impact radius and determining damage severity.
                            </div>
                        </div>
                    </div>
                )}
                
                <MapContainer
                    center={[impactLocation.lat, impactLocation.lng]}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    style={{ height: '80vh', width: '100%', border: '2px solid #007bff' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Component to detect map clicks */}
                    <LocationMarker onLocationSelect={handleLocationSelect} position={impactLocation} />
                    
                    {/* Draw the impact circles */}
                    {impactResults && circles.length > 0 && circles.map((circle, index) => {
                        console.log(`Rendering circle ${index}:`, {
                            center: [impactLocation.lat, impactLocation.lng],
                            radius: circle.radius,
                            color: circle.color
                        });
                        return (
                            <Circle
                                key={`circle-${index}`}
                                center={[impactLocation.lat, impactLocation.lng]}
                                radius={circle.radius}
                                pathOptions={{ 
                                    color: circle.color, 
                                    fillColor: circle.fillColor, 
                                    fillOpacity: circle.fillOpacity, 
                                    weight: circle.weight 
                                }}
                            />
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}

export default ImpactSimulator;
