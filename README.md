# Weather Data Visualisation

## Progress

### 28 May 25
* Added new Wind Toggle in a Layer Container.
* Added functionality to load winds as per values from Time slider, Level slider and Wind Toggle

### 29 May 25
* Wind Speed Image Overlay Completed.
* Added Temperature Data. Layer Switching and Dynamic Legend Implementation Completed.

### 30 May 25
* Added Time Slider Controls (-3Hr, -1Hr, +1Hr, +3Hr)
* Added Animation Toggle Functionality
* Added Rainfall Data
* Added Station Points with Tooltip

### 31 May 25
* Added functionality to show Weather Information of the stations which also updates every minute.
* Generated Point Data Files.

### 01 Jun 25
* Point Weather Data Implementation Completed.
* Added a Simple Meteogram.

### 03 Jun 25
* Added Route Forecast Panel
* Simple Route is Plotted Using User-Defined Path

### 11 Jun 25

#### Literature Review on Wind and Temperature Interpolation
* Wind Speed and Temperature:

Interpolation is often done using linear interpolation in the vertical (z) direction when the atmosphere is assumed to be hydrostatically stable and the layers are sufficiently thin.

Studies like Stull (1988) in "An Introduction to Boundary Layer Meteorology" mention that linear interpolation works well for wind speed and temperature when vertical gradients are smooth.

* Wind Direction:

Wind direction is a circular variable (0° = 360°), so direct linear interpolation may cause errors across the 0/360 boundary.

Recommended method: vector decomposition — convert direction + speed to u/v components, interpolate u and v linearly, then convert back to direction using atan2.