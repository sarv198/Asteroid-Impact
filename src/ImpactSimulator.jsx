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
            console.log('Calculation result:', result);
            setImpactResults(result);
        } catch (err) {
            console.error('Calculation error:', err);
            setError(err.message);
            setImpactResults(null);
        }
    }, [density, speed, diameter]);


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
        <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Left Section: Controls */}
            <div style={{ flex: 1, minWidth: '300px' }}>
                <h2>Asteroid Parameters</h2>
                <p>Modify the values and click "Run Simulation" or click the map to set location.</p>

                {/* Input Fields */}
                {[
                    { label: "Density (kg/m³)", value: density, setter: setDensity },
                    { label: "Speed (m/s)", value: speed, setter: setSpeed },
                    { label: "Diameter (meters)", value: diameter, setter: setDiameter },
                ].map(({ label, value, setter }) => (
                    <div key={label} style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            style={{ padding: '8px', width: '90%', border: '1px solid #ccc', borderRadius: '4px' }}
                            min="1"
                        />
                    </div>
                ))}
                
                <button 
                    onClick={runCalculation} 
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Run Impact Simulation
                </button>

                {/* Results Display */}
                <h3 style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>Impact Analysis</h3>
                
                <p>Location: ({formatNumber(impactLocation.lat, 4)}°, {formatNumber(impactLocation.lng, 4)}°)</p>
                <p>Status: {impactResults ? `Circles should be visible on map` : `No impact data - click "Run Impact Simulation"`}</p>

                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Calculation Error: {error}</p>}

                {impactResults && (
                    <div>
                        <p>Kinetic Energy: <b>{impactResults.kinetic_energy_joules.toExponential(2)}</b> J</p>
                        <p>Overall Classification: 
                            <b style={{ color: impactResults.damage_classification === 'Severe' ? 'red' : impactResults.damage_classification === 'Moderate' ? 'orange' : 'green', marginLeft: '5px' }}>
                                {impactResults.damage_classification}
                            </b>
                        </p>
                        
                        <h4 style={{ marginTop: '15px' }}>Damage Radii (km)</h4>
                        <ul>
                            <li style={{ color: 'red' }}>Severe Damage: <b>{formatNumber(impactResults.severe_radius_km)} km</b></li>
                            <li style={{ color: 'orange' }}>Moderate Damage: <b>{formatNumber(impactResults.moderate_radius_km)} km</b></li>
                            <li style={{ color: 'yellow' }}>Light Damage: <b>{formatNumber(impactResults.light_radius_km)} km</b></li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Section: Map */}
            <div style={{ flex: 2 }}>
                <h2>Earth Impact Map</h2>
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
