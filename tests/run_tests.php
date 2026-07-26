<?php

declare(strict_types=1);

/**
 * Standalone, zero-dependency test runner.
 *
 * Discovers every *.php file under tests/Unit and tests/Integration, instantiates
 * the class matching the filename, and invokes every public method whose name
 * starts with "test". Exits with status 0 when all tests pass, 1 otherwise.
 *
 * Usage: php tests/run_tests.php
 */

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Calculator.php';
require_once __DIR__ . '/../src/Importer.php';
require_once __DIR__ . '/../src/RateRepository.php';
require_once __DIR__ . '/Assert.php';

$testDirectories = [
    __DIR__ . '/Unit',
    __DIR__ . '/Integration',
];

$testFiles = [];
foreach ($testDirectories as $directory) {
    $files = glob($directory . '/*.php');
    if ($files !== false) {
        array_push($testFiles, ...$files);
    }
}
sort($testFiles);

$totalTests = 0;
$totalFailures = 0;
$failureDetails = [];

foreach ($testFiles as $file) {
    require_once $file;

    $className = pathinfo($file, PATHINFO_FILENAME);
    if (!class_exists($className)) {
        continue;
    }

    echo $className . ":\n";

    $instance = new $className();
    $methods = array_filter(get_class_methods($instance), static fn (string $m) => str_starts_with($m, 'test'));

    foreach ($methods as $method) {
        $totalTests++;
        $label = "{$className}::{$method}";

        try {
            if (method_exists($instance, 'setUp')) {
                $instance->setUp();
            }

            $instance->$method();
            echo "  [PASS] {$method}\n";
        } catch (Throwable $e) {
            $totalFailures++;
            echo "  [FAIL] {$method} - {$e->getMessage()}\n";
            $failureDetails[] = "{$label}: {$e->getMessage()}";
        } finally {
            if (method_exists($instance, 'tearDown')) {
                $instance->tearDown();
            }
        }
    }
}

$passed = $totalTests - $totalFailures;
echo "\n{$passed} / {$totalTests} tests passed.\n";

if ($totalFailures > 0) {
    echo "\nFailures:\n";
    foreach ($failureDetails as $detail) {
        echo " - {$detail}\n";
    }
    exit(1);
}

exit(0);
