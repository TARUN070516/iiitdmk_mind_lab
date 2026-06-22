<?php
// Simple PHP backend to save JSON data
// This file receives POST requests from the admin panel and saves to content.json

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get the JSON data from request
        $jsonData = file_get_contents('php://input');
        
        // Validate JSON
        $data = json_decode($jsonData, true);
        if ($data === null) {
            throw new Exception('Invalid JSON data');
        }
        
        // Define file path
        $filePath = 'data/content.json';
        
        // Check if directory exists
        if (!is_dir('data')) {
            mkdir('data', 0755, true);
        }
        
        // Write to file with pretty print
        $jsonString = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        
        if (file_put_contents($filePath, $jsonString) === false) {
            throw new Exception('Failed to write to file');
        }
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Data saved successfully',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Handle GET requests to retrieve current data
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $filePath = 'data/content.json';
        
        if (!file_exists($filePath)) {
            throw new Exception('Content file not found');
        }
        
        $jsonData = file_get_contents($filePath);
        $data = json_decode($jsonData, true);
        
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        
    } catch (Exception $e) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
