# Food Bridge API Documentation

## 1. Base URL

The base URL for all API endpoints is `/api`.

## 2. Authentication

Authentication is token-based using JSON Web Tokens (JWT).

-   The JWT token must be included in the `Authorization` header of your HTTP requests using the Bearer scheme.
    -   Example: `Authorization: Bearer <YOUR_JWT_TOKEN>`
-   Tokens are obtained upon successful user registration (`POST /api/auth/register`) or login (`POST /api/auth/login`).
-   Tokens are short-lived (e.g., 1 hour) and need to be refreshed or re-obtained upon expiry.

## 3. User Types

There are two types of users in the system:

-   `restaurant`: Users who can list surplus food items. They have access to endpoints for creating, managing, and viewing their own listings.
-   `organization`: Users (e.g., charities, food banks) who can view available food listings and claim them.

## 4. API Endpoints

---

### Auth Endpoints

Base Path: `/api/auth`

#### 1. User Registration

-   **Method:** `POST`
-   **Path:** `/register`
-   **Description:** Registers a new user (restaurant or organization).
-   **Authentication:** No
-   **Request Body:**
    -   `name (string, required)`: Full name or name of the entity.
    -   `email (string, required)`: Unique email address for the user.
    -   `password (string, required)`: User's chosen password (will be hashed).
    -   `userType (string, required)`: Must be either `"restaurant"` or `"organization"`.
-   **Success Response (201 Created):**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "1678886400000",
        "email": "user@example.com",
        "name": "Test User",
        "userType": "restaurant"
      }
    }
    ```
-   **Error Responses:**
    -   `400 Bad Request`: If required fields are missing or `userType` is invalid.
        ```json
        { "message": "All fields are required: email, password, name, userType" }
        ```
        ```json
        { "message": "userType must be either \"restaurant\" or \"organization\"" }
        ```
    -   `400 Bad Request`: If email already exists.
        ```json
        { "message": "User with this email already exists" }
        ```
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error during registration" }
        ```

#### 2. User Login

-   **Method:** `POST`
-   **Path:** `/login`
-   **Description:** Logs in an existing user and returns a JWT token.
-   **Authentication:** No
-   **Request Body:**
    -   `email (string, required)`: User's email address.
    -   `password (string, required)`: User's password.
-   **Success Response (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "1678886400000",
        "email": "user@example.com",
        "name": "Test User",
        "userType": "restaurant"
      }
    }
    ```
-   **Error Responses:**
    -   `400 Bad Request`: If email or password is not provided.
        ```json
        { "message": "Email and password are required" }
        ```
    -   `401 Unauthorized`: If credentials are invalid (user not found or password incorrect).
        ```json
        { "message": "Invalid credentials" }
        ```
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error during login" }
        ```
        ```json
        { "message": "Error generating token. Is JWT_SECRET set?" }
        ```

---

### Listing Endpoints

Base Path: `/api/listings`

#### 1. Create Listing (Restaurant Only)

-   **Method:** `POST`
-   **Path:** `/`
-   **Description:** Allows a restaurant to create a new food listing.
-   **Authentication:** Yes, `restaurant` role required.
-   **Request Body:**
    -   `foodName (string, required)`: Name of the food item.
    -   `description (string, required)`: Detailed description of the food.
    -   `quantity (integer, required)`: Amount or number of items available.
    -   `pickupLocation (string, required)`: Address or location for pickup.
    -   `expiryDate (string, required)`: ISO 8601 date string (e.g., "2024-12-31T23:59:59.000Z").
    -   `status (string, optional)`: Status of the listing (e.g., "available", "reserved"). Defaults to "available".
-   **Success Response (201 Created):**
    ```json
    {
      "id": "1678886500000",
      "restaurantId": "1678886400000",
      "foodName": "Surplus Bread",
      "description": "Whole wheat bread loaves.",
      "quantity": 20,
      "pickupLocation": "123 Main St, Anytown",
      "expiryDate": "2024-03-15T23:59:00.000Z",
      "status": "available",
      "createdAt": "2024-03-14T10:00:00.000Z",
      "updatedAt": "2024-03-14T10:00:00.000Z"
    }
    ```
-   **Error Responses:**
    -   `400 Bad Request`: If required fields are missing.
        ```json
        { "message": "Missing required fields: foodName, description, quantity, pickupLocation, expiryDate" }
        ```
    -   `401 Unauthorized`: If token is missing.
        ```json
        { "message": "Access token is missing" }
        ```
    -   `403 Forbidden`: If token is invalid/expired or user is not a restaurant.
        ```json
        { "message": "Access token is invalid" }
        ```
        ```json
        { "message": "Access denied. Restaurant role required." }
        ```
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error while creating listing" }
        ```

#### 2. Get Restaurant's Listings (Restaurant Only)

-   **Method:** `GET`
-   **Path:** `/my-listings`
-   **Description:** Retrieves all listings created by the authenticated restaurant.
-   **Authentication:** Yes, `restaurant` role required.
-   **Request Body:** None
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": "1678886500000",
        "restaurantId": "1678886400000",
        "foodName": "Surplus Bread",
        // ... other fields
        "status": "available",
        "createdAt": "2024-03-14T10:00:00.000Z",
        "updatedAt": "2024-03-14T10:00:00.000Z"
      },
      {
        "id": "1678886600000",
        "restaurantId": "1678886400000",
        "foodName": "Leftover Catering Trays",
        // ... other fields
        "status": "claimed",
        "organizationId": "org123",
        "claimedAt": "2024-03-14T12:00:00.000Z",
        "createdAt": "2024-03-13T15:00:00.000Z",
        "updatedAt": "2024-03-14T12:00:00.000Z"
      }
    ]
    ```
-   **Error Responses:**
    -   `401 Unauthorized`: If token is missing.
    -   `403 Forbidden`: If token is invalid/expired or user is not a restaurant.
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error while fetching listings" }
        ```

#### 3. Update Listing (Restaurant Only)

-   **Method:** `PUT`
-   **Path:** `/:id` (e.g., `/api/listings/1678886500000`)
-   **Description:** Allows a restaurant to update their own existing food listing.
-   **Authentication:** Yes, `restaurant` role required. User must own the listing.
-   **Request Body:** Any subset of the fields allowed during creation (e.g., `foodName`, `description`, `quantity`, `pickupLocation`, `expiryDate`, `status`).
    ```json
    {
      "quantity": 15,
      "status": "reserved"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "id": "1678886500000",
      "restaurantId": "1678886400000",
      "foodName": "Surplus Bread",
      "description": "Whole wheat bread loaves.",
      "quantity": 15,
      "pickupLocation": "123 Main St, Anytown",
      "expiryDate": "2024-03-15T23:59:00.000Z",
      "status": "reserved",
      "createdAt": "2024-03-14T10:00:00.000Z",
      "updatedAt": "2024-03-14T11:00:00.000Z"
    }
    ```
-   **Error Responses:**
    -   `401 Unauthorized`: Token missing.
    -   `403 Forbidden`: Token invalid/expired, user not a restaurant, or user does not own the listing.
        ```json
        { "message": "Forbidden: You do not own this listing" }
        ```
    -   `404 Not Found`: If listing with the given ID does not exist.
        ```json
        { "message": "Listing not found" }
        ```
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error while updating listing" }
        ```

#### 4. Delete Listing (Restaurant Only)

-   **Method:** `DELETE`
-   **Path:** `/:id` (e.g., `/api/listings/1678886500000`)
-   **Description:** Allows a restaurant to delete their own existing food listing.
-   **Authentication:** Yes, `restaurant` role required. User must own the listing.
-   **Request Body:** None
-   **Success Response (204 No Content):** (Empty response body)
-   **Error Responses:**
    -   `401 Unauthorized`: Token missing.
    -   `403 Forbidden`: Token invalid/expired, user not a restaurant, or user does not own the listing.
        ```json
        { "message": "Forbidden: You do not own this listing" }
        ```
    -   `404 Not Found`: If listing with the given ID does not exist.
        ```json
        { "message": "Listing not found" }
        ```
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error while deleting listing" }
        ```

#### 5. Get All Available Listings (Organization Only)

-   **Method:** `GET`
-   **Path:** `/`
-   **Description:** Retrieves all food listings currently marked as "available". Intended for organizations.
-   **Authentication:** Yes, `organization` role required.
-   **Request Body:** None
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": "1678886500000",
        "restaurantId": "restaurantA_ID",
        "foodName": "Surplus Bread",
        "description": "Whole wheat bread loaves.",
        "quantity": 20,
        "pickupLocation": "123 Main St, Anytown",
        "expiryDate": "2024-03-15T23:59:00.000Z",
        "status": "available",
        "createdAt": "2024-03-14T10:00:00.000Z",
        "updatedAt": "2024-03-14T10:00:00.000Z"
      },
      {
        "id": "1678886700000",
        "restaurantId": "restaurantB_ID",
        "foodName": "Fresh Produce Box",
        "description": "Assorted fresh vegetables.",
        "quantity": 5,
        "pickupLocation": "456 Oak Ave, Anytown",
        "expiryDate": "2024-03-16T18:00:00.000Z",
        "status": "available",
        "createdAt": "2024-03-14T11:00:00.000Z",
        "updatedAt": "2024-03-14T11:00:00.000Z"
      }
    ]
    ```
-   **Error Responses:**
    -   `401 Unauthorized`: Token missing.
    -   `403 Forbidden`: Token invalid/expired or user is not an organization.
        ```json
        { "message": "Access denied. Organization role required." }
        ```
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error while fetching available listings" }
        ```

#### 6. Claim Listing (Organization Only)

-   **Method:** `PATCH`
-   **Path:** `/:id/claim` (e.g., `/api/listings/1678886500000/claim`)
-   **Description:** Allows an organization to claim an available food listing.
-   **Authentication:** Yes, `organization` role required.
-   **Request Body:** None
-   **Success Response (200 OK):**
    ```json
    {
      "id": "1678886500000",
      "restaurantId": "restaurantA_ID",
      "foodName": "Surplus Bread",
      "description": "Whole wheat bread loaves.",
      "quantity": 20,
      "pickupLocation": "123 Main St, Anytown",
      "expiryDate": "2024-03-15T23:59:00.000Z",
      "status": "claimed",
      "organizationId": "org_XYZ123", // ID of the claiming organization
      "claimedAt": "2024-03-14T14:30:00.000Z",
      "createdAt": "2024-03-14T10:00:00.000Z",
      "updatedAt": "2024-03-14T14:30:00.000Z"
    }
    ```
-   **Error Responses:**
    -   `401 Unauthorized`: Token missing.
    -   `403 Forbidden`: Token invalid/expired or user is not an organization.
    -   `404 Not Found`: If listing with the given ID does not exist.
        ```json
        { "message": "Listing not found" }
        ```
    -   `409 Conflict`: If the listing is not available for claiming (e.g., already claimed or status is not 'available').
        ```json
        { "message": "Listing is already claimed", "currentStatus": "claimed" }
        ```
        ```json
        { "message": "Listing is already reserved", "currentStatus": "reserved" }
        ```
    -   `500 Internal Server Error`:
        ```json
        { "message": "Server error while claiming listing" }
        ```

---
