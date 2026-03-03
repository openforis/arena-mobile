# Open Foris Arena Mobile

Arena Mobile is a user-friendly, free, and open-source application designed to streamline offline data collection on Android and iOS devices.  
Serving as a companion to "Open Foris Arena", it offers seamless data handling with an intuitive interface, capable of capturing diverse data types such as numbers, coordinates, images, videos, and text.  
Arena Mobile enables efficient collection of field data in various sectors, including forest inventories and interviews, by implementing customisable validation rules to ensure high-quality data.  
Supported by a robust community, it integrates with the Arena platform for analytics and reporting, making it an ideal choice for various data assessment needs.

## End-to-end tests

E2E tests are set up with Maestro.

- Test flows: [e2e/maestro](e2e/maestro)
- Setup and usage: [e2e/README.md](e2e/README.md)

Quick run commands:

```bash
# Android
yarn e2e:maestro:android

# iOS
yarn e2e:maestro:ios
```
