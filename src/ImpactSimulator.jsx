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
            onLocationSelect(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

function ImpactSimulator() {
    // --- State for Inputs and Results ---
    const [density, setDensity] = useState(7800); // Default: Iron (kg/m³)
    const [speed, setSpeed] = useState(17000); // Default: m/s
    const [diameter, setDiameter] = useState(50); // Default: meters
    const [impactLocation, setImpactLocation] = useState({ lat: 0, lng: 0 }); // Default center
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
            const result = calculateImpactRadius(
                density,
                speed,
                diameter
            );
            setImpactResults(result);
        } catch (err) {
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
        return [
            { radius: impactResults.light_radius_km * 1000, color: 'yellow', fill: false, weight: 3, name: "Light Damage" },
            { radius: impactResults.moderate_radius_km * 1000, color: 'orange', fill: false, weight: 3, name: "Moderate Damage" },
            { radius: impactResults.severe_radius_km * 1000, color: 'red', fill: false, weight: 3, name: "Severe Damage" },
        ].sort((a, b) => b.radius - a.radius); // Draw largest first
    }, [impactResults]);

    // Calculate map zoom level based on the size of the impact area
    const mapZoom = impactResults 
        ? (impactResults.light_radius_km > 200 ? 3 : (impactResults.light_radius_km > 50 ? 5 : 8))
        : 2;

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
                    {impactResults && circles.map((circle, index) => (
                        <Circle
                            key={index}
                            center={[impactLocation.lat, impactLocation.lng]}
                            radius={circle.radius}
                            pathOptions={{ color: circle.color, fillColor: circle.color, fillOpacity: 0.1, weight: circle.weight }}
                        />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default ImpactSimulator;
