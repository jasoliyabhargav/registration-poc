# ClientPoc - React Native Account Setup App

A comprehensive React Native application demonstrating secure account registration, authentication, and user management with form validation, state persistence, and biometric security features.

## 🚀 Features

### Core Functionality
- **User Registration**: Complete account setup with comprehensive form validation
- **User Authentication**: Secure login system with session management
- **Profile Management**: User profile display with account information
- **Form State Persistence**: Automatic saving of partially completed registration forms
- **Security Features**: Account lockout after failed attempts, secure credential storage

### Form Validation
- Real-time email format validation
- Strong password requirements (8+ chars, uppercase, lowercase, numbers, special characters)
- Password confirmation matching
- Phone number format validation
- Required field validation with inline error messages

### Security & Privacy
- **Secure Storage**: Credentials stored using iOS Keychain/Android Keystore
- **Session Management**: Persistent login sessions across app restarts
- **Account Lockout**: Temporary lockout after 5 failed login attempts (15 minutes)
- **Biometric Authentication**: Support for Face ID/Touch ID (when available)
- **Data Privacy**: No network calls - all data stored locally

### User Experience
- **Accessibility**: Full screen reader support, proper focus management, sufficient color contrast
- **Responsive Design**: Smooth keyboard handling, no layout jumps
- **Loading States**: Clear feedback during async operations
- **Error Handling**: User-friendly error messages and validation feedback

## 📱 Screens

### 1. Registration Screen
- Replicates the account setup form from the provided design
- Fields: Email, Password, Confirm Password, First Name, Last Name, Phone Number
- Real-time validation with inline error messages
- Form state persistence across app restarts
- Submit button disabled until all fields are valid

### 2. Login Screen
- Email and password authentication
- Biometric login option (when credentials are saved)
- Failed attempt tracking with lockout warning
- Account lockout display with countdown timer

### 3. Home/Profile Screen
- Display of registered user information
- Account security status
- Login attempt history
- Secure logout functionality

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── CustomButton.tsx
│   └── CustomInput.tsx
├── contexts/           # React contexts for state management
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── useForm.ts
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # Screen components
│   ├── LoginScreen.tsx
│   ├── RegistrationScreen.tsx
│   └── HomeScreen.tsx
├── services/          # Business logic and external services
│   ├── authenticationService.ts
│   ├── formPersistenceService.ts
│   └── secureStorageService.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions
    └── validation.ts
```

### State Management
- **React Context**: Used for global authentication state
- **Custom Hooks**: Form state management with validation
- **AsyncStorage**: Form persistence and user data storage
- **Keychain/Keystore**: Secure credential storage

## 🔧 Setup & Installation

### Prerequisites
- Node.js 16+
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation
```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Scripts
- `npm start`: Start Metro bundler
- `npm run ios`: Run on iOS simulator
- `npm run android`: Run on Android emulator
- `npm test`: Run unit tests
- `npm run lint`: Run ESLint

## 🧪 Testing

### Unit Tests
- Validation logic testing
- Form state management testing
- Authentication service testing

```bash
# Run tests
npm test
```

## 🔒 Security Implementation

### Credential Storage
- **iOS**: Uses Keychain Services with biometric access control
- **Android**: Uses Keystore with biometric authentication
- **Fallback**: Device passcode when biometrics unavailable

### Authentication Flow
1. User enters credentials
2. Credentials validated against local storage
3. Successful login stores secure token
4. Failed attempts increment counter
5. Account locked after 5 failures for 15 minutes

### Data Privacy
- No external network calls
- All data stored locally on device
- Secure credential storage using platform APIs
- Form data expires after 24 hours

## 📐 Validation Rules

### Email
- Valid email format (RFC 5322 compliant)
- Required field

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Required field

### Names (First/Last)
- 2-50 characters
- Required fields

### Phone Number
- Valid phone number format
- Supports various formats: (123) 456-7890, 123-456-7890, 123.456.7890
- Required field

## 🎨 Design & Accessibility

### Design System
- Consistent color palette
- Typography hierarchy
- Component reusability
- Responsive layouts

### Accessibility Features
- Screen reader compatibility
- Proper labeling and hints
- Focus management
- Sufficient color contrast (WCAG AA compliant)
- Touch target sizes (44pt minimum)

## 🛠️ Technical Decisions & Trade-offs

### Form Library Choice
**Decision**: Custom form hook instead of Formik/React Hook Form
**Reasoning**:
- Full control over validation timing
- Custom persistence logic integration
- Simplified TypeScript integration
- Learning opportunity for custom implementation

### State Management
**Decision**: React Context instead of Redux
**Reasoning**:
- Simpler setup for small to medium app
- Built-in React feature
- Sufficient for current requirements
- Easier testing

### Navigation
**Decision**: React Navigation Stack Navigator
**Reasoning**:
- Industry standard for React Native
- Good TypeScript support
- Comprehensive documentation
- Active community support

---

## 📄 License

This project is for demonstration purposes only.