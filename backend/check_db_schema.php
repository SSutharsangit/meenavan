<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $results = DB::select('DESCRIBE orders');
    echo "ORDERS TABLE DESCRIPTION:\n";
    foreach ($results as $row) {
        printf("Column: %-25s | Type: %-20s | Null: %-3s | Key: %-3s | Default: %-10s | Extra: %s\n",
            $row->Field,
            $row->Type,
            $row->Null,
            $row->Key,
            $row->Default ?? 'NULL',
            $row->Extra
        );
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

