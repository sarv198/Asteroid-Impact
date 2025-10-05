// src/ImpactCalculator.js

/**
 * Calculate impact radius and damage classification for an asteroid impact.
 * NOTE: This is a JavaScript translation of the provided Python code.
 *
 * @param {number} density - Asteroid density in kg/m^3
 * @param {number} speed - Impact speed in m/s
 * @param {number} diameter - Asteroid diameter in meters
 * @returns {object} Dictionary containing kinetic energy, impact radii, and damage classification
 */
export function calculateImpactRadius(density, speed, diameter) {
    // --- Input Validation (Ensuring numbers are valid) ---
    const numericInputs = [density, speed, diameter].map(Number); // Convert to number
    
    if (numericInputs.some(isNaN)) {
        throw new Error("All inputs must be numeric values.");
    }
    
    const [d, s, dia] = numericInputs; // Destructure the converted values

    if (d <= 0 || s <= 0 || dia <= 0) {
        throw new Error("Density, Speed, and Diameter must be positive values.");
    }

    // --- Calculation ---
    
    // Calculate volume and kinetic energy
    // E = (π / 12) * density * diameter^3 * speed^2
    const kineticEnergy = (Math.PI / 12) * d * (dia ** 3) * (s ** 2);

    // Calculate impact radii using different damage coefficients
    // R = k * E^(1/3)
    const severe_k = 1.8e-4;
    const moderate_k = 4.0e-4;
    const light_k = 8.0e-4;

    const impactPowerThird = Math.cbrt(kineticEnergy); // Cube root of kinetic energy

    // Calculate radii in meters
    const severe_radius_m = severe_k * impactPowerThird;
    const moderate_radius_m = moderate_k * impactPowerThird;
    const light_radius_m = light_k * impactPowerThird;

    // Convert to kilometers
    const severe_radius_km = severe_radius_m / 1000;
    const moderate_radius_km = moderate_radius_m / 1000;
    const light_radius_km = light_radius_m / 1000;

    // --- Damage Classification ---
    let classification;
    if (severe_radius_km > 5) {
        classification = "Severe";
    } else if (moderate_radius_km > 2) {
        classification = "Moderate";
    } else {
        classification = "Light";
    }

    // --- Result Object ---
    const result = {
        kinetic_energy_joules: kineticEnergy,
        severe_radius_km: severe_radius_km,
        moderate_radius_km: moderate_radius_km,
        light_radius_km: light_radius_km,
        damage_classification: classification
    };

    return result;
}
