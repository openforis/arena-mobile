# Open Foris Arena Mobile

Arena Mobile is a user-friendly, free, and open-source application designed to streamline offline data collection on Android and iOS devices.  
Serving as a companion to "Open Foris Arena", it offers seamless data handling with an intuitive interface, capable of capturing diverse data types such as numbers, coordinates, images, videos, and text.  
Arena Mobile enables efficient collection of field data in various sectors, including forest inventories and interviews, by implementing customisable validation rules to ensure high-quality data.  
Supported by a robust community, it integrates with the Arena platform for analytics and reporting, making it an ideal choice for various data assessment needs.

## Google Maps API key

The app reads the Google Maps API key from the `GOOGLE_MAPS_API_KEY` environment variable in `app.config.ts`.

Set it before running Expo commands, for example:

```bash
export GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
yarn start
```

For EAS builds, set the same variable as an EAS secret or environment variable for the build profile.
