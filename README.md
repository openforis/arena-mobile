# Open Foris Arena Mobile

Arena Mobile is a user-friendly, free, and open-source application designed to streamline offline data collection on Android and iOS devices.  
Serving as a companion to "Open Foris Arena", it offers seamless data handling with an intuitive interface, capable of capturing diverse data types such as numbers, coordinates, images, videos, and text.  
Arena Mobile enables efficient collection of field data in various sectors, including forest inventories and interviews, by implementing customisable validation rules to ensure high-quality data.  
Supported by a robust community, it integrates with the Arena platform for analytics and reporting, making it an ideal choice for various data assessment needs.

## Google Maps API keys

The app reads Google Maps API keys from environment variables in `app.config.ts`:

- `GOOGLE_MAPS_API_KEY_ANDROID` for Android
- `GOOGLE_MAPS_API_KEY_IOS` for iOS

Set them before running Expo commands, for example:

```bash
export GOOGLE_MAPS_API_KEY_ANDROID="your_android_google_maps_api_key"
export GOOGLE_MAPS_API_KEY_IOS="your_ios_google_maps_api_key"
yarn start
```

For EAS builds, set these variables as EAS secrets or environment variables for the build profile.
Alternatively, you can configure the API keys directly in `app.json` under `android.config.googleMaps.apiKey` and `ios.config.googleMapsApiKey`.
