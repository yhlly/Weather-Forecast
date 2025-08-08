# ScenePath

ScenePath is an innovative iOS application that combines augmented reality (AR) with navigation to provide an immersive route planning and exploration experience. The app allows users to discover interesting locations along their journey through specialized routes, collect virtual items, and experience navigation in both AR and simulation modes.

## Features

- **Advanced Route Planning**: Find optimal routes with support for multiple transportation types (walking, driving, public transport)
- **Specialized Routes**: Discover scenic paths, food spots, or attractions along your journey
- **Augmented Reality Navigation**: Experience turn-by-turn directions in AR
- **Route Simulation**: Preview and simulate your route before actually traveling
- **Collection System**: Collect virtual items along special routes to build your collection
- **Real-time Location Tracking**: Track your position and receive guidance as you navigate
- **Multi-language Support**: Available in multiple languages

## Screenshots

*[Add screenshots of your application here]*

## Technologies Used

- Swift
- SwiftUI
- ARKit
- SceneKit
- MapKit
- CoreLocation
- SwiftData

## Requirements

- iOS 15.0+
- Xcode 14.0+
- iPhone with A12 Bionic chip or later (for AR features)

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ScenePath.git
   ```

2. Open the project in Xcode:
   ```bash
   cd ScenePath
   open ScenePath.xcodeproj
   ```

3. Select your development team in the project settings.

4. Build and run the application on your iOS device.

## Usage Guide

### Getting Started

1. **Launch the App**: Open ScenePath on your iOS device.
2. **Enter Locations**: Input your starting point and destination. You can use "My Location" for your current position.
3. **Choose a Route Preference**: Select between standard routes, scenic routes, food routes, or attraction routes.
4. **Select Transportation Type**: Choose between walking, driving, or public transport.
5. **View Routes**: Review the suggested routes and select one to preview.

### Route Preview

- View the complete route on the map
- Check distance, duration, and other route details
- Choose between "Simulate Route" or "AR Navigation"

### Route Simulation

- Watch a simulation of your journey before actually traveling
- Control the simulation speed and progress
- Learn about turns and important navigation points

### AR Navigation

- Experience real-time AR navigation with directional arrows and instructions
- Collect virtual items along special routes
- View your progress and estimated arrival time

### Collections

- Access your collection through the bag icon
- View all collected items organized by category
- See collection details including when and where items were collected

## Project Structure

```
ScenePath/
├── ContentView.swift                 # Main application view
├── ScenePathApp.swift                # App entry point with SwiftData integration
├── Managers/                         # Core service managers
│   ├── RouteSimulationPlayer.swift   # Route simulation control
│   ├── CollectionManager.swift       # Collectible items management
│   ├── LocationSearchManager.swift   # Location search services
│   └── LocationManager.swift         # Device location services
├── Models/                           # Data models
│   ├── AppState.swift                # Application state definitions
│   ├── NavigationModels.swift        # Navigation-related data models
│   ├── CollectibleItem.swift         # Collectible item data model
│   └── [Other model files]
├── Views/                            # UI components
│   ├── CollectionView.swift          # Collection display view
│   ├── ARNavigationView.swift        # AR navigation interface
│   ├── RoutePreviewView.swift        # Route preview interface
│   ├── SearchRouteView.swift         # Route search interface
│   ├── Components/                   # Reusable UI components
│   └── MapViews/                     # Map and AR scene views
└── Services/
    └── RouteService.swift            # Route planning service
```

## Planned Features

- Offline map support
- Social sharing of collections
- Custom route creation
- Integration with popular navigation services
- Achievements and challenges

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [MapKit Documentation](https://developer.apple.com/documentation/mapkit)
- [ARKit Documentation](https://developer.apple.com/documentation/arkit)
- [SwiftData Documentation](https://developer.apple.com/documentation/swiftdata)
- [Icons by SF Symbols](https://developer.apple.com/sf-symbols/)

---

*Note: ScenePath requires camera and location permissions to function properly. AR features work best in well-lit environments.*