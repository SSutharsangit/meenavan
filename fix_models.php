<?php

$modelsDir = __DIR__ . '/backend/app/Models';
$models = scandir($modelsDir);

foreach ($models as $model) {
    if (str_ends_with($model, '.php') && $model !== 'User.php') {
        $path = $modelsDir . '/' . $model;
        $content = file_get_contents($path);
        
        if (!str_contains($content, 'protected $guarded')) {
            // Replace the empty class body or just before the closing brace
            if (str_contains($content, "{\n    //\n}")) {
                $content = str_replace("{\n    //\n}", "{\n    protected \$guarded = [];\n}", $content);
            } else {
                $content = preg_replace('/\{/', "{\n    protected \$guarded = [];\n", $content, 1);
            }
            file_put_contents($path, $content);
        }
    }
}
echo "Models fixed.\n";
