# Cross-Print-Server API Documentation

This document provides detailed information about the Cross-Print-Server API endpoints.

## Authentication

All API endpoints require authentication using an API key. The API key should be provided in the `X-API-Key` header.

```typescript
// Example header
{
  "X-API-Key": "your-api-key" // string, min length 8 characters
}
```

## Request and Response Types

All API responses follow a consistent format:

```typescript
// Success response type
interface ApiResponse<T> {
  success: true;
  data: T;
}

// Error response type
interface ApiResponse {
  success: false;
  error: string;
}
```

HTTP status codes are used appropriately:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized (invalid API key)
- `403`: Forbidden (access from non-local network)
- `404`: Not found
- `500`: Internal server error

## Type Definitions

The API uses strict type checking. Here are the primary types used in the API:

```typescript
// Print Job Status
type PrintJobStatus = "pending" | "printing" | "paused" | "completed" | "failed";

// Printer Group Balancing Strategy
type BalancingStrategy = "round-robin" | "least-busy" | "failover";

// Routing Rule Match Type
type RoutingMatchType = "exact" | "contains" | "regex";

// Print Orientation
type PrinterOrientation = "portrait" | "landscape";

// API Request/Response Types
interface PrintJob {
  id: string;
  status: PrintJobStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  fileName: string;
  printer?: string;
  priority: number; // 1-10
  retries: number;
  error?: string;
  options: PrintOptions;
}

interface PrintOptions {
  copies?: number;
  duplex?: boolean;
  orientation?: PrinterOrientation;
  paperSize?: string;
  bluetooth?: boolean;
  [key: string]: unknown; // Additional options
}
```

## Management API Endpoints

Management API endpoints are only accessible from the local network for security reasons.

### Print Queue Management

#### Get all print jobs

```
GET /management/queue
```

Returns a list of all print jobs in the queue.

#### Get a specific print job

```
GET /management/queue/:id
```

Returns details of a specific print job.

#### Pause a print job

```
POST /management/queue/:id/pause
```

Pauses a specific print job.

#### Resume a print job

```
POST /management/queue/:id/resume
```

Resumes a paused print job.

#### Cancel a print job

```
DELETE /management/queue/:id
```

Cancels and removes a print job from the queue.

#### Update print job priority

```
PUT /management/queue/:id/priority
```

Updates the priority of a print job.

Request body:
```json
{
  "priority": 5  // 1-10, higher is more important
}
```

#### Pause all print jobs

```
POST /management/queue/pause-all
```

Pauses all print jobs in the queue.

#### Resume all print jobs

```
POST /management/queue/resume-all
```

Resumes all paused print jobs.

### Printer Categories

#### Get all printer categories

```
GET /management/categories
```

Returns a list of all printer categories.

#### Create a new printer category

```
POST /management/categories
```

Creates a new printer category.

Request body:
```json
{
  "name": "Kitchen",
  "description": "Kitchen printers",
  "printers": ["Printer1", "Printer2"],
  "defaultOptions": {
    "copies": 2
  },
  "routingRules": [
    {
      "field": "order.type",
      "pattern": "food",
      "matchType": "exact"
    }
  ]
}
```

#### Get a specific printer category

```
GET /management/categories/:id
```

Returns details of a specific printer category.

#### Update a printer category

```
PUT /management/categories/:id
```

Updates a printer category.

Request body:
```json
{
  "name": "Updated Kitchen",
  "description": "Updated description",
  "printers": ["Printer1", "Printer3"],
  "defaultOptions": {
    "copies": 1
  },
  "routingRules": [
    {
      "field": "order.type",
      "pattern": "food|drink",
      "matchType": "regex"
    }
  ]
}
```

#### Delete a printer category

```
DELETE /management/categories/:id
```

Deletes a printer category.

#### Assign printers to a category

```
POST /management/categories/:id/printers
```

Assigns printers to a category.

Request body:
```json
{
  "printers": ["Printer1", "Printer2", "Printer3"]
}
```

### Printer Groups

#### Get all printer groups

```
GET /management/groups
```

Returns a list of all printer groups.

#### Create a new printer group

```
POST /management/groups
```

Creates a new printer group.

Request body:
```json
{
  "name": "Receipts",
  "description": "Receipt printers",
  "printers": ["Printer1", "Printer2"],
  "balancingStrategy": "round-robin",
  "active": true
}
```

#### Get a specific printer group

```
GET /management/groups/:id
```

Returns details of a specific printer group.

#### Update a printer group

```
PUT /management/groups/:id
```

Updates a printer group.

Request body:
```json
{
  "name": "Updated Receipts",
  "description": "Updated description",
  "printers": ["Printer1", "Printer3"],
  "balancingStrategy": "least-busy",
  "active": true
}
```

#### Delete a printer group

```
DELETE /management/groups/:id
```

Deletes a printer group.

#### Assign printers to a group

```
POST /management/groups/:id/printers
```

Assigns printers to a group.

Request body:
```json
{
  "printers": ["Printer1", "Printer2", "Printer3"]
}
```

#### Get group status

```
GET /management/groups/:id/status
```

Returns the status of a printer group, including the status of each printer in the group.

### Analytics and Reporting

#### Get analytics summary

```
GET /management/analytics/summary
```

Returns a summary of print job analytics.

Query parameters:
- `timeframe`: 'day', 'week', 'month', 'year', or 'custom' (default: 'month')
- `startDate`: ISO date string (required for custom timeframe)
- `endDate`: ISO date string (optional for custom timeframe)
- `printers`: comma-separated list of printer names to filter by
- `categories`: comma-separated list of categories to filter by

#### Get print job statistics

```
GET /management/analytics/jobs
```

Returns detailed statistics about print jobs.

Query parameters: Same as summary endpoint.

#### Get printer statistics

```
GET /management/analytics/printers
```

Returns detailed statistics about printers.

Query parameters: Same as summary endpoint.

#### Get error statistics

```
GET /management/analytics/errors
```

Returns detailed statistics about print errors.

Query parameters: Same as summary endpoint.

#### Export analytics data

```
GET /management/analytics/export
```

Exports analytics data as a CSV file.

Query parameters: Same as summary endpoint.

Response:
```json
{
  "success": true,
  "data": {
    "url": "/api/analytics/files/analytics-export-2023-05-01T12-00-00.csv",
    "fileName": "analytics-export-2023-05-01T12-00-00.csv"
  }
}
```

### Bluetooth Printer Management

#### Discover Bluetooth printers

```
GET /management/bluetooth/printers
```

Discovers available Bluetooth printers.

#### Configure Bluetooth printer

```
PUT /management/bluetooth/config
```

Updates Bluetooth printer configuration.

Request body:
```json
{
  "enabled": true,
  "name": "Receipt Printer",
  "address": "XX:XX:XX:XX:XX:XX",
  "channel": 1,
  "discoverable": true,
  "discoveryTimeout": 30000
}
```

## API Endpoints

These endpoints are accessible from any network, but still require API key authentication.

### Barcode Generation

#### Generate a barcode

```
POST /api/barcodes/barcode
```

Generates a barcode image.

Request body:
```json
{
  "data": "12345678",
  "type": "code128",
  "width": 300,
  "height": 100,
  "includeText": true,
  "fontSize": 20,
  "margin": 10,
  "background": "#ffffff",
  "lineColor": "#000000"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "/api/barcodes/files/barcode-12345.png",
    "base64": "base64-encoded-image"
  }
}
```

#### Generate a QR code

```
POST /api/barcodes/qrcode
```

Generates a QR code image.

Request body:
```json
{
  "data": "https://example.com",
  "size": 300,
  "errorCorrectionLevel": "M",
  "margin": 4,
  "color": "#000000",
  "backgroundColor": "#ffffff"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "/api/barcodes/files/qrcode-12345.png",
    "base64": "base64-encoded-image"
  }
}
```

### Print Preview

#### Generate a print preview

```
POST /api/preview
```

Generates a preview of a print job.

Request body:
```json
{
  "content": "content-to-preview",
  "contentType": "raw",  // "raw", "html", "markdown", or "image"
  "fileName": "receipt.txt",
  "options": {
    "width": 800,
    "height": 1200,
    "format": "png",  // "png", "jpeg", or "pdf"
    "dpi": 96
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "/api/preview/files/preview-12345.png",
    "base64": "base64-encoded-image"
  }
}
```

## WebSocket Protocol

The WebSocket protocol has been extended to support the new features. Here are the new message types:

### Print with Queue

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
      "bluetooth": false,
      "category": "Kitchen",
      "group": "Receipts",
      "priority": 5,
      "generatePreview": true
    }
  }
}
```

### WebSocket Events

The WebSocket server emits the following events:

- `queue-updated`: Emitted when the print queue changes
- `job-status-changed`: Emitted when a job status changes
- `printer-status-changed`: Emitted when printer status changes
- `printer-discovered`: Emitted when a new printer is discovered

## Error Handling

All API endpoints return a consistent error format:

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP status codes:
- 200: Success
- 400: Bad request (invalid parameters)
- 401: Unauthorized (invalid API key)
- 403: Forbidden (access from non-local network)
- 404: Not found
- 500: Internal server error
