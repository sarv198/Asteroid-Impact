import math

def calculate_impact_radius(density, speed, diameter):
    """
    Calculate impact radius and damage classification for an asteroid impact.
    
    Args:
        density (float): Asteroid density in kg/m^3
        speed (float): Impact speed in m/s
        diameter (float): Asteroid diameter in meters
    
    Returns:
        dict: Dictionary containing kinetic energy, impact radii, and damage classification
    """
    
    # Input validation
    if not all(isinstance(x, (int, float)) for x in [density, speed, diameter]):
        raise ValueError("All inputs must be numeric values")
    
    if density <= 0:
        raise ValueError("Density must be positive")
    if speed <= 0:
        raise ValueError("Speed must be positive")
    if diameter <= 0:
        raise ValueError("Diameter must be positive")
    
    # Calculate kinetic energy: E = (π / 12) * density * diameter^3 * speed^2
    kinetic_energy = (math.pi / 12) * density * (diameter ** 3) * (speed ** 2)
    
    # Calculate impact radii using different damage coefficients
    # R = k * E^(1/3)
    severe_k = 1.8e-4
    moderate_k = 4.0e-4
    light_k = 8.0e-4
    
    # Calculate radii in meters first
    severe_radius_m = severe_k * (kinetic_energy ** (1/3))
    moderate_radius_m = moderate_k * (kinetic_energy ** (1/3))
    light_radius_m = light_k * (kinetic_energy ** (1/3))
    
    # Convert to kilometers
    severe_radius_km = severe_radius_m / 1000
    moderate_radius_km = moderate_radius_m / 1000
    light_radius_km = light_radius_m / 1000
    
    # Determine damage classification
    if severe_radius_km > 5:
        classification = "Severe"
    elif moderate_radius_km > 2:
        classification = "Moderate"
    else:
        classification = "Light"
    
    # Create result dictionary
    result = {
        "kinetic_energy_joules": kinetic_energy,
        "severe_radius_km": severe_radius_km,
        "moderate_radius_km": moderate_radius_km,
        "light_radius_km": light_radius_km,
        "damage_classification": classification
    }
    
    return result

def print_impact_summary(density, speed, diameter):
    """
    Calculate and print a formatted summary of the impact analysis.
    
    Args:
        density (float): Asteroid density in kg/m^3
        speed (float): Impact speed in m/s
        diameter (float): Asteroid diameter in meters
    """
    try:
        result = calculate_impact_radius(density, speed, diameter)
        
        print("=" * 60)
        print("ASTEROID IMPACT ANALYSIS")
        print("=" * 60)
        print(f"Input Parameters:")
        print(f"  Density:    {density:,.0f} kg/m³")
        print(f"  Speed:      {speed:,.0f} m/s")
        print(f"  Diameter:   {diameter:,.0f} m")
        print()
        print(f"Calculated Results:")
        print(f"  Kinetic Energy: {result['kinetic_energy_joules']:.2e} Joules")
        print()
        print(f"Impact Radii:")
        print(f"  Severe Damage:   {result['severe_radius_km']:.2f} km")
        print(f"  Moderate Damage: {result['moderate_radius_km']:.2f} km")
        print(f"  Light Damage:    {result['light_radius_km']:.2f} km")
        print()
        print(f"Overall Classification: {result['damage_classification']}")
        print("=" * 60)
        
    except ValueError as e:
        print(f"Error: {e}")

# Example usage
if __name__ == "__main__":
    # Example: Iron asteroid with typical impact parameters
    example_density = 7800  # kg/m^3 (iron)
    example_speed = 17000   # m/s (typical impact speed)
    example_diameter = 50   # meters
    
    print_impact_summary(example_density, example_speed, example_diameter)
