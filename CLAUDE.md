# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arena Mobile is a React Native mobile application built with Expo for offline data collection on Android and iOS. It's a companion app to Open Foris Arena, enabling field data collection for forest inventories, surveys, and interviews with support for diverse data types (numbers, coordinates, images, videos, text) and customizable validation rules.

**Key Technologies:**
- React Native 0.81.4 with Expo 54
- Redux Toolkit for state management
- React Navigation for routing
- React Native Paper for UI components
- SQLite (expo-sqlite) for local data persistence
- Socket.io for real-time server communication
- @openforis/arena-core for shared business logic

## Development Commands

### Starting the App
```bash
# Start development server
yarn start

# Start with tunnel (for testing on external devices)
yarn start-tunnel

# Platform-specific starts
yarn android
yarn ios
yarn web
```

### Code Quality
```bash
# Run linter with auto-fix
yarn lint
```

**Note:** This project does not have automated tests. Testing is done manually on devices.

### Building & Deployment
```bash
# Build for development (internal distribution)
eas build --profile development --platform [android|ios]

# Build preview (internal distribution)
eas build --profile preview --platform [android|ios]

# Build for production
eas build --profile production --platform [android|ios]

# Submit to App Store (iOS only, requires AuthKey_4TQM7KV3QK.p8)
eas submit --platform ios --profile production
```

## Code Architecture

### Module Resolution
The project uses Babel module resolver with `src/` as the root. Import from top-level directories without relative paths:
```javascript
import { SurveyService } from "service"
import { useEffectiveTheme } from "hooks"
import { SurveySelectors } from "state"
```

### State Management (Redux)
Located in `src/state/`, organized by domain:
- **dataEntry**: Current record editing state, selected nodes, validation
- **survey**: Survey definitions, loaded surveys, current survey
- **settings**: App settings (GPS locking, screen orientation, language, etc.)
- **remoteConnection**: Server connection state, authentication
- **deviceInfo**: Battery state, disk storage, device information
- **screenOptions**: UI state for different screens
- **message/confirm/toast**: UI dialog state
- **jobMonitor**: Background job status (imports, exports, sync)

Each domain exports: `Actions`, `Reducer`, `Selectors`, and sometimes `State` utilities.

### Data Layer

**Database (src/db/):**
- `SQLiteClient.js`: Custom wrapper around expo-sqlite with migration support
- `migrations/`: Sequential database schema migrations (version-controlled via PRAGMA user_version)
- Database is initialized in `AppInitializer` before app renders

**Repositories (src/service/repository/):**
- `recordRepository.js`: CRUD operations for survey records (17k+ lines, complex)
- `surveyRepository.js`: Survey metadata storage/retrieval
- `surveyFSRepository.js`: Survey file system operations
- `recordFileRepository.js`: Record file attachments
- Repositories interact directly with SQLite, not abstracted ORMs

**Services (src/service/):**
- Business logic layer between components and repositories
- `surveyService.js`: Survey import, export, demo survey loading
- `recordService.js`: Record lifecycle, validation, updates
- `recordRemoteService.js`: Server sync for records
- `authService.js`: Authentication tokens, secure storage
- `preferencesService.js`: User preferences persistence
- Job services (`*Job.js`): Background operations (imports, exports, backups)

### Navigation (src/navigation/)
Single `AppStack` component using React Navigation Native Stack. Screen definitions in `src/screens/screens.js` with keys in `src/screens/screenKeys.js`.

### Screens (src/screens/)
Major screens:
- **HomeScreen**: Survey selection, remote connection
- **SurveysList**: Local and remote survey management
- **RecordsList**: Record browsing, filtering, sync status
- **RecordEditor**: Complex multi-page form editor (see below)
- **RecordValidationReport**: Validation errors display
- **SettingsScreen**: App configuration
- **AboutScreen**: Version info, licenses

### Record Editor Architecture
`src/screens/RecordEditor/` is the most complex screen:

- **RecordEditor.js**: Main container coordinating all subcomponents
- **RecordPageForm**: Renders a single page of form fields
- **NodeComponentSwitch**: Maps node types to specific input components
  - `nodeTypes/`: Individual input components (NodeTextComponent, NodeCodeComponent, NodeCoordinateComponent, NodeImageOrVideoComponent, NodeTaxonComponent, NodeDateComponent, NodeFileComponent, etc.)
- **NodeMultipleEntityComponent**: Table view for repeating entities
- **RecordNodesCarousel**: Horizontal swipe navigation between nodes
- **PagesNavigationTree**: Hierarchical page navigation drawer
- **PageNodesList**: List view of nodes in current page
- **BottomNavigationBar**: Quick navigation between entity pages
- **Breadcrumbs**: Hierarchical location indicator
- **RecordEditorDrawer**: Side drawer with validation and navigation

**Key State Hook:** `useNodeComponentLocalState.js` - manages local editing state for node components

### Components (src/components/)
Reusable UI components wrapping React Native Paper and custom implementations:
- Basic: `View`, `VView`, `HView`, `Text`, `TextInput`, `Button`
- Forms: `FormItem`, `DatePicker`, `TimePicker`, `Dropdown`, `Checkbox`, `Switch`, `RadioButton`, `Slider`
- Complex: `DataVisualizer`, `SelectableList`, `Modal`, `ImagePreviewDialog`
- All components support theming (light/dark mode)

### Localization (src/localization/)
- i18next with react-i18next
- Supported languages: en, es, fr, pt, ru, am, fa, de, fi, id, sv
- Translation files in `src/localization/{lang}/`
- RTL support via `useTextDirection` hook

### Theme (src/theme/)
- `OFLightTheme.js` and `OFDarkTheme.js` extend React Native Paper themes
- `useEffectiveTheme` hook in `src/hooks/` selects theme based on settings
- User can choose system, light, or dark mode in settings

### Utilities (src/utils/)
Common utilities including:
- `SystemUtils`: Platform-specific operations (full screen, keep awake, file cleanup)
- `Environment`: Platform detection (isAndroid, isIOS, isWeb)
- `BaseStyles`: Shared style constants
- `Permissions.js`: Permission handling for camera, location, media library

## App Initialization Flow

1. **App.js**: Redux store setup, theme provider, error boundary
2. **AppInitializer**: Sequential initialization (see `src/AppInitializer/AppInitializer.js`):
   - Fetch device info (battery, storage)
   - Load settings from secure storage
   - Apply settings (full screen, GPS lock, keep awake)
   - Initialize SQLite database
   - Run database migrations if needed
   - Migrate data (if DB schema changed)
   - Load surveys (import demo if none exist)
   - Set current survey from preferences
   - Attempt auto-login to remote server
3. **AppStack**: Navigation stack renders once initialization completes

## Database Migrations

- Migrations are in `src/db/migrations/`
- Each migration is a function: `async (client) => { ... }`
- Migrations are run sequentially, version tracked via `PRAGMA user_version`
- **IMPORTANT**: Never modify existing migrations. Always add new ones at the end.
- After DB migrations, `DataMigrationService.migrateData()` runs to transform data

## Working with Records

Records are hierarchical:
- **Survey**: Top-level definition with node definitions
- **Record**: Instance of a survey (e.g., a single plot measurement)
- **Node**: Individual data point within a record (entity or attribute)
- **Entities**: Containers for other nodes (single or multiple)
- **Attributes**: Leaf nodes holding actual data (text, number, code, coordinate, file, taxon, date, time, etc.)

Node definitions come from `@openforis/arena-core` package. The mobile app interprets these definitions to render forms and validate data.

## Remote Sync

- Server connection managed in `src/state/remoteConnection/`
- Socket.io for real-time updates
- REST API calls via axios in `src/service/api/`
- Authentication tokens stored in expo-secure-store
- Records can be downloaded from server, edited offline, and uploaded
- Conflict resolution strategies: overwrite local, overwrite remote, create new

## Permissions

Key permissions (configured in `app.json`):
- **Camera**: For image/video file attributes
- **Location**: For coordinate attributes with GPS
- **Media Library**: For selecting images from gallery
- **ACCESS_MEDIA_LOCATION** (Android): To preserve GPS location data in images

All permission checks are in `src/utils/Permissions.js`.

## File Handling

- Files (images, videos, audio, documents) stored in device file system
- File metadata stored in SQLite with references to file paths
- Large files compressed/resized before storage
- Image EXIF data (including GPS location) extracted with `@lodev09/react-native-exify`
- File exports compressed as ZIP archives

## Linting & Code Style

- ESLint configured in `eslint.config.mjs`
- Uses `@react-native/eslint-config` as base
- Prettier for formatting (`.prettierrc` not present, using defaults)
- Always run `yarn lint` before committing

## Common Patterns

### Accessing Redux State
```javascript
import { useSelector } from "react-redux"
import { SurveySelectors } from "state"

const currentSurvey = useSelector(SurveySelectors.selectCurrentSurvey)
```

### Dispatching Actions
```javascript
import { useDispatch } from "react-redux"
import { SurveyActions } from "state"

const dispatch = useDispatch()
dispatch(SurveyActions.fetchAndSetCurrentSurvey({ surveyId }))
```

### Using Services
```javascript
import { RecordService } from "service"

const records = await RecordService.fetchRecords({ surveyId })
```

### Translations
```javascript
import { Text } from "components"

// Using textKey prop (preferred)
<Text textKey="app:welcomeMessage" />

// Using i18next directly
import { useTranslation } from "react-i18next"
const { t } = useTranslation()
const message = t("app:welcomeMessage")
```

## Important Notes

- **No TypeScript**: This is a JavaScript project. Do not add TypeScript files.
- **Expo Managed Workflow**: Uses Expo's managed workflow. Config plugins in `app.json` and custom plugins in `plugins/` directory.
- **Yarn Berry**: Uses Yarn 4.10.3 (configured in `packageManager` field)
- **Development Mode**: `__DEV__` global checks for development-only code
- **Platform-Specific Code**: Use `Environment.isAndroid`, `Environment.isIOS`, or `Platform.select()`
- **Large Codebase**: `recordRepository.js` is 17k+ lines. Be careful when modifying.
- **Offline-First**: App must work completely offline. Server sync is optional.
