# Cross-Platform Print Server

A TypeScript-based print server that connects to a central WebSocket server and handles print jobs across different platforms (Linux/Raspberry Pi and Windows).

## Features

- **WebSocket Client**: Connects to a central server to receive print commands and send status updates
- **Cross-Platform Printing**: Supports printing on both Linux (using CUPS/lp) and Windows
- **Bluetooth Printer Support**: Connect to and print to Bluetooth printers
- **Local Management API**: REST API for configuration and management, accessible only from the local network
- **API Key Security**: All communications are authenticated using an API key
- **GPIO Integration**: On Raspberry Pi, supports resetting the API key via a GPIO button
- **Sound Notifications**: Plays sounds for new orders, successful prints, and print errors
- **Receipt Formatting**: Automatically formats text receipts to fit the configured width
- **Automatic Retry**: Configurable automatic retry for failed print jobs
- **Comprehensive Logging**: Detailed logging with rotation for troubleshooting
- **Standalone Executables**: Can be packaged as standalone executables for Windows and Linux
- **Raspberry Pi OS Image**: Scripts to build a custom Raspberry Pi OS image with the print server pre-installed

## Requirements

- Node.js 16.x or later
- TypeScript 4.x or later
- For Raspberry Pi GPIO support: Raspberry Pi hardware with GPIO pins
- For printing: CUPS on Linux, native printing support on Windows

## Installation

### From Source

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cross-print-server.git
   cd cross-print-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

### As a Systemd Service (Linux/Raspberry Pi)

1. Run the installation script as root:
   ```
   sudo ./scripts/install-service.sh
   ```

2. Check the service status:
   ```
   systemctl status cross-print-server
   ```

### Using Standalone Executables

1. Build the standalone executables:
   ```
   ./scripts/build-binaries.sh
   ```

2. The executables will be available in the `bin` directory:
   - `cross-print-server-linux` - Linux executable
   - `cross-print-server-win.exe` - Windows executable
   - `cross-print-server-raspberry` - Raspberry Pi executable

## Configuration

The server is configured using the `config/default.json` file. You can modify this file directly or use the management API to update the configuration at runtime.

### Configuration Options

- **server**: Settings for the local management API server
  - **port**: Port number (default: 3000)
  - **host**: Host to bind to (default: "0.0.0.0")

- **websocket**: Settings for the WebSocket client
  - **url**: URL of the central WebSocket server
  - **reconnectInterval**: Milliseconds to wait before reconnecting
  - **maxReconnectAttempts**: Maximum number of reconnection attempts

- **security**: Security settings
  - **apiKey**: API key for authentication
  - **defaultApiKey**: Default API key to reset to

- **printing**: Printing settings
  - **defaultPrinter**: Default printer name
  - **tempDirectory**: Directory for temporary files
  - **receiptWidth**: Width for formatting text receipts (default: 40)
  - **autoRetry**: Whether to automatically retry failed print jobs (default: true)
  - **maxRetries**: Maximum number of retry attempts (default: 3)
  - **retryDelay**: Delay between retry attempts in milliseconds (default: 2000)
  - **bluetooth**: Bluetooth printer settings
    - **enabled**: Whether Bluetooth printing is enabled (default: false)
    - **name**: Name of the Bluetooth printer (default: "Receipt Printer")
    - **address**: MAC address or device ID of the Bluetooth printer
    - **channel**: Bluetooth channel to use (default: 1)
    - **discoverable**: Whether to discover Bluetooth printers (default: true)
    - **discoveryTimeout**: Timeout for Bluetooth discovery in milliseconds (default: 30000)

- **notifications**: Sound notification settings
  - **enabled**: Whether sound notifications are enabled (default: true)
  - **sounds**: Paths to sound files
    - **newOrder**: Sound file for new orders (default: "sounds/new-order.mp3")
    - **printSuccess**: Sound file for successful prints (default: "sounds/print-success.mp3")
    - **printError**: Sound file for print errors (default: "sounds/print-error.mp3")
  - **volume**: Volume level from 0-100 (default: 80)

- **gpio**: GPIO settings (Raspberry Pi only)
  - **enabled**: Whether GPIO monitoring is enabled
  - **resetPin**: GPIO pin number for the reset button

- **logging**: Logging settings
  - **level**: Log level ("error", "warn", "info", "debug") (default: "info")
  - **file**: Path to log file (default: "logs/print-server.log")
  - **maxSize**: Maximum log file size in bytes before rotation (default: 5MB)
  - **maxFiles**: Maximum number of rotated log files to keep (default: 5)

### Updating Configuration

You can update the configuration using the management API:

```
curl -X PUT http://localhost:3000/management/config \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"websocket": {"url": "ws://new-server:8080"}}'
```

### Updating the API Key

You can update the API key using the management API:

```
curl -X PUT http://localhost:3000/management/api-key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-current-api-key" \
  -d '{"newApiKey": "your-new-api-key"}'
```

## Management API

The management API is only accessible from the local network and requires authentication using the API key.

### Endpoints

- **GET /management/status**: Get the current status of the print server
- **GET /management/config**: Get the current configuration
- **PUT /management/config**: Update the configuration
- **PUT /management/api-key**: Update the API key
- **POST /management/reset-api-key**: Reset the API key to the default value

### Bluetooth Printer Endpoints

- **GET /management/bluetooth/printers**: Discover available Bluetooth printers
- **PUT /management/bluetooth/config**: Update Bluetooth printer configuration

#### Example: Discover Bluetooth Printers

```
curl -X GET http://localhost:3000/management/bluetooth/printers \
  -H "X-API-Key: your-api-key"
```

#### Example: Configure Bluetooth Printer

```
curl -X PUT http://localhost:3000/management/bluetooth/config \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "enabled": true,
    "name": "Receipt Printer",
    "address": "XX:XX:XX:XX:XX:XX",
    "channel": 1,
    "discoverable": true
  }'
```

## Building a Raspberry Pi OS Image

You can build a custom Raspberry Pi OS image with the print server pre-installed:

1. Run the image build script as root:
   ```
   sudo ./scripts/build-pi-image.sh
   ```

2. The image will be available in the `pi-image-output` directory.

3. Write the image to an SD card using a tool like `dd` or [Etcher](https://www.balena.io/etcher/):
   ```
   sudo dd if=pi-image-output/cross-print-server-raspios.img of=/dev/sdX bs=4M status=progress
   ```

## WebSocket Protocol

The print server communicates with the central server using a WebSocket connection. Messages are JSON objects with the following structure:

```json
{
  "type": "messageType",
  "apiKey": "your-api-key",
  "data": {
    // Message-specific data
  }
}
```

### Message Types

- **print**: Print a file
  ```json
  {
    "type": "print",
    "apiKey": "your-api-key",
    "data": {
      "fileContent": "base64-encoded-file-content",
      "fileName": "document.pdf",
      "printer": "optional-printer-name",
      "options": {
        "copies": 1,
        "duplex": true,
        "orientation": "portrait",
        "bluetooth": false  // Set to true to use Bluetooth printing
      }
    }
  }
  ```

- **updateSettings**: Update configuration settings
  ```json
  {
    "type": "updateSettings",
    "apiKey": "your-api-key",
    "data": {
      "websocket": {
        "url": "ws://new-server:8080"
      }
    }
  }
  ```

- **status**: Request status information
  ```json
  {
    "type": "status",
    "apiKey": "your-api-key"
  }
  ```

- **resetApiKey**: Reset the API key
  ```json
  {
    "type": "resetApiKey",
    "apiKey": "your-api-key",
    "data": {
      "newApiKey": "new-api-key"
    }
  }
  ```

## GPIO Integration (Raspberry Pi Only)

On Raspberry Pi, the print server can monitor a GPIO pin for a button press to reset the API key. This is useful if you need to reset the API key without accessing the management API.

To enable GPIO monitoring:

1. Update the configuration:
   ```json
   {
     "gpio": {
       "enabled": true,
       "resetPin": 17
     }
   }
   ```

2. Connect a button between the specified GPIO pin and ground.

3. When the button is pressed, the API key will be reset to the default value.

## Bluetooth Printer Integration

The print server supports printing to Bluetooth printers on both Linux/Raspberry Pi and Windows.

### Prerequisites

#### Linux/Raspberry Pi

1. Install the required packages:
   ```
   sudo apt-get update
   sudo apt-get install bluetooth bluez bluez-tools libbluetooth-dev
   ```

2. Make sure the Bluetooth service is running:
   ```
   sudo systemctl enable bluetooth
   sudo systemctl start bluetooth
   ```

3. Pair your Bluetooth printer:
   ```
   sudo bluetoothctl
   [bluetooth]# power on
   [bluetooth]# agent on
   [bluetooth]# scan on
   # Wait for your printer to appear
   [bluetooth]# pair XX:XX:XX:XX:XX:XX
   [bluetooth]# trust XX:XX:XX:XX:XX:XX
   [bluetooth]# connect XX:XX:XX:XX:XX:XX
   [bluetooth]# quit
   ```

#### Windows

1. Go to Settings > Bluetooth & devices
2. Turn on Bluetooth
3. Click "Add device" and pair your Bluetooth printer
4. Install any required printer drivers

### Configuration

1. Enable Bluetooth printing in the configuration:
   ```json
   {
     "printing": {
       "bluetooth": {
         "enabled": true,
         "address": "XX:XX:XX:XX:XX:XX",  // MAC address of your printer
         "name": "Receipt Printer",
         "channel": 1
       }
     }
   }
   ```

2. You can update the configuration using the management API or by editing the config file directly.

### Printing to Bluetooth Printers

When sending a print job, you can specify to use Bluetooth printing by setting the `bluetooth` option to `true`:

```json
{
  "type": "print",
  "apiKey": "your-api-key",
  "data": {
    "fileContent": "base64-encoded-file-content",
    "fileName": "receipt.txt",
    "options": {
      "bluetooth": true
    }
  }
}
```

## License

MIT
