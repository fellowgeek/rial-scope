<?php

declare(strict_types=1);

/**
 * JSON API endpoint dispatcher.
 *
 * Supported actions (via ?action=):
 *   - latest  : most recent recorded observation
 *   - series  : chronological series for charts/date sliders (optional from/to)
 *   - lookup  : resolves a single date (?date=YYYY-MM-DD) to the nearest preceding
 *               trading observation
 *   - compare : resolves two dates (?date_a=&date_b=) and optionally applies the
 *               Calculator's revalue or item-comparison modes
 *
 * The routing logic lives in the side-effect-free dispatchRatesAction() function so
 * it can be exercised directly by the integration test suite (see
 * tests/Integration/ApiEndpointTest.php) without spinning up a real HTTP request.
 * Define RATES_API_NO_DISPATCH before including this file to load the function
 * definitions only, skipping the live HTTP request handling below.
 */

require_once __DIR__ . '/../../src/Database.php';
require_once __DIR__ . '/../../src/RateRepository.php';
require_once __DIR__ . '/../../src/Calculator.php';

use App\Calculator;
use App\Database;
use App\RateRepository;

const RATES_MIN_DATE = '1950-01-01';

function isValidDateParam(string $date): bool
{
    return (bool) preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)
        && checkdate((int) substr($date, 5, 2), (int) substr($date, 8, 2), (int) substr($date, 0, 4));
}

/**
 * Validates a date is a well-formed YYYY-MM-DD string within [RATES_MIN_DATE, maxDate].
 */
function validateDateBounds(string $date, string $maxDate): ?string
{
    if (!isValidDateParam($date)) {
        return 'Invalid date format, expected YYYY-MM-DD.';
    }

    if ($date < RATES_MIN_DATE || $date > $maxDate) {
        return 'Date must be between ' . RATES_MIN_DATE . " and {$maxDate}.";
    }

    return null;
}

function resolutionPayload(array $resolved): array
{
    $rate = $resolved['rate'];

    return [
        'requested_date' => $resolved['requested_date'],
        'applied_date' => $resolved['applied_date'],
        'exact_match' => $resolved['exact_match'],
        'rate_irr_per_usd' => $rate['rate_irr_per_usd'] ?? null,
        'granularity' => $rate['granularity'] ?? null,
        'source' => $rate['source'] ?? null,
    ];
}

/**
 * Pure request dispatcher: given a repository, calculator, requested action and its
 * query parameters, returns [httpStatus, jsonSerializablePayload]. Contains no
 * superglobal access, header calls, or exit()s, making it directly unit-testable.
 *
 * @param array<string, mixed> $params Query parameters relevant to the action
 *                                     (e.g. $_GET), keyed by name.
 * @return array{0: int, 1: array}
 */
function dispatchRatesAction(RateRepository $repository, Calculator $calculator, ?string $action, array $params): array
{
    if ($action === null || $action === '') {
        return [400, ['error' => 'Missing required "action" parameter.']];
    }

    $latestRow = $repository->latest();
    $maxDate = $latestRow['date'] ?? date('Y-m-d');

    switch ($action) {
        case 'latest':
            if ($latestRow === null) {
                return [404, ['error' => 'No rate data available.']];
            }

            return [200, [
                'date' => $latestRow['date'],
                'rate_irr_per_usd' => $latestRow['rate_irr_per_usd'],
                'granularity' => $latestRow['granularity'],
                'source' => $latestRow['source'],
            ]];

        case 'series':
            $from = $params['from'] ?? null;
            $to = $params['to'] ?? null;

            if ($from !== null && !isValidDateParam($from)) {
                return [400, ['error' => 'Invalid "from" date format, expected YYYY-MM-DD.']];
            }

            if ($to !== null && !isValidDateParam($to)) {
                return [400, ['error' => 'Invalid "to" date format, expected YYYY-MM-DD.']];
            }

            $rows = $repository->series($from, $to);

            return [200, [
                'count' => count($rows),
                'series' => array_map(static function (array $row): array {
                    return [
                        'date' => $row['date'],
                        'rate_irr_per_usd' => $row['rate_irr_per_usd'],
                        'granularity' => $row['granularity'],
                        'source' => $row['source'],
                    ];
                }, $rows),
            ]];

        case 'lookup':
            $date = $params['date'] ?? null;

            if ($date === null) {
                return [400, ['error' => 'Missing required "date" parameter.']];
            }

            $error = validateDateBounds($date, $maxDate);
            if ($error !== null) {
                return [400, ['error' => $error]];
            }

            $resolved = $repository->lookup($date);

            if ($resolved['applied_date'] === null) {
                return [404, ['error' => "No observation found on or before {$date}."]];
            }

            return [200, resolutionPayload($resolved)];

        case 'compare':
            $dateA = $params['date_a'] ?? null;
            $dateB = $params['date_b'] ?? null;

            if ($dateA === null || $dateB === null) {
                return [400, ['error' => 'Missing required "date_a" and/or "date_b" parameters.']];
            }

            foreach (['date_a' => $dateA, 'date_b' => $dateB] as $label => $value) {
                $error = validateDateBounds($value, $maxDate);
                if ($error !== null) {
                    return [400, ['error' => "{$label}: {$error}"]];
                }
            }

            $resolved = $repository->compare($dateA, $dateB);

            if ($resolved['date_a']['applied_date'] === null || $resolved['date_b']['applied_date'] === null) {
                return [404, ['error' => 'No observation found on or before one of the requested dates.']];
            }

            $payload = [
                'date_a' => resolutionPayload($resolved['date_a']),
                'date_b' => resolutionPayload($resolved['date_b']),
            ];

            $rateA = $resolved['date_a']['rate']['rate_irr_per_usd'];
            $rateB = $resolved['date_b']['rate']['rate_irr_per_usd'];

            // Optional Revaluation mode: a single IRR amount evaluated at both rates.
            if (isset($params['irr_amount']) && is_numeric($params['irr_amount'])) {
                $irrAmount = (float) $params['irr_amount'];

                if ($irrAmount <= 0) {
                    return [400, ['error' => 'irr_amount must be a positive number.']];
                }

                $payload['revalue'] = $calculator->revalue($irrAmount, $rateA, $rateB);
            }

            // Optional Two-Price Comparison mode: independent item prices at each date.
            if (isset($params['price_a']) && isset($params['price_b'])
                && is_numeric($params['price_a']) && is_numeric($params['price_b'])
            ) {
                $priceA = (float) $params['price_a'];
                $priceB = (float) $params['price_b'];

                if ($priceA <= 0 || $priceB <= 0) {
                    return [400, ['error' => 'price_a and price_b must be positive numbers.']];
                }

                $payload['compare_items'] = $calculator->comparePrices($priceA, $rateA, $priceB, $rateB);
            }

            return [200, $payload];

        default:
            return [404, ['error' => "Unknown action \"{$action}\"."]];
    }
}

if (!defined('RATES_API_NO_DISPATCH')) {
    header('Content-Type: application/json; charset=utf-8');

    $db = new Database(getenv('RATES_DB_PATH') ?: (__DIR__ . '/../../data/rates.db'));
    $repository = new RateRepository($db);
    $calculator = new Calculator();

    [$status, $payload] = dispatchRatesAction($repository, $calculator, $_GET['action'] ?? null, $_GET);

    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
}
