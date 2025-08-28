<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'geoserver/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], 
    // Better: ['http://localhost:3000'] for your React dev server

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
