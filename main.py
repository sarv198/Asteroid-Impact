#!/usr/bin/env python3
"""
Asteroid Impact Calculator - Main Entry Point
This script provides an interactive command-line interface for the asteroid impact calculator.
"""

import sys
import os

# Add the Impact Radius directory to the path so we can import the module
sys.path.append(os.path.join(os.path.dirname(__file__), 'Impact Radius'))

from impact import calculate_impact_radius, print_impact_summary

def get_user_input():
    """Get user input for asteroid parameters with validation."""
    print("Asteroid Impact Calculator")
    print("=" * 50)
    print("Enter asteroid parameters (or press Enter for defaults):")
    print()
    
    # Get density
    while True:
        try:
            density_input = input("Density (kg/m³) [default: 7800 for iron]: ").strip()
            if not density_input:
                density = 7800
            else:
                density = float(density_input)
            if density <= 0:
                print("Density must be positive. Please try again.")
                continue
            break
        except ValueError:
            print("Please enter a valid number.")
    
    # Get speed
    while True:
        try:
            speed_input = input("Speed (m/s) [default: 17000]: ").strip()
            if not speed_input:
                speed = 17000
            else:
                speed = float(speed_input)
            if speed <= 0:
                print("Speed must be positive. Please try again.")
                continue
            break
        except ValueError:
            print("Please enter a valid number.")
    
    # Get diameter
    while True:
        try:
            diameter_input = input("Diameter (meters) [default: 50]: ").strip()
            if not diameter_input:
                diameter = 50
            else:
                diameter = float(diameter_input)
            if diameter <= 0:
                print("Diameter must be positive. Please try again.")
                continue
            break
        except ValueError:
            print("Please enter a valid number.")
    
    return density, speed, diameter

def main():
    """Main function to run the asteroid impact calculator."""
    try:
        # Get user input
        density, speed, diameter = get_user_input()
        
        # Calculate and display results
        print()
        print_impact_summary(density, speed, diameter)
        
        # Ask if user wants to run another calculation
        while True:
            another = input("\nRun another calculation? (y/n): ").strip().lower()
            if another in ['y', 'yes']:
                print()
                density, speed, diameter = get_user_input()
                print()
                print_impact_summary(density, speed, diameter)
            elif another in ['n', 'no']:
                print("Thank you for using the Asteroid Impact Calculator!")
                break
            else:
                print("Please enter 'y' for yes or 'n' for no.")
                
    except KeyboardInterrupt:
        print("\n\nCalculator interrupted by user. Goodbye!")
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
