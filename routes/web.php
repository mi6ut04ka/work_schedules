<?php

use App\Http\Controllers\ProfileController;
use App\Models\Employee;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    $month = (int)$request->input('month', now()->month);
    $year = (int)$request->input('year', now()->year);

    $startDate = \Carbon\Carbon::createFromDate($year, $month, 1)->startOfMonth();
    $endDate = $startDate->copy()->endOfMonth();

    // ── Month meta ────────────────────────────────────────────────────────
    $monthMeta = [];
    $tempDate = $startDate->copy();
    while ($tempDate <= $endDate) {
        $monthMeta[] = [
            'num' => $tempDate->day,
            'key' => $tempDate->format('Y-m-d'),
            'dow' => $tempDate->dayOfWeek,
            'isWeekend' => $tempDate->isWeekend(),
            'dowLabel' => mb_convert_case(
                $tempDate->getTranslatedShortDayName(),
                MB_CASE_TITLE,
                'UTF-8'
            ),
        ];
        $tempDate->addDay();
    }

    // ── Employees + schedules ─────────────────────────────────────────────
    $employeesRaw = Employee::with(['organisationUnit', 'functionalGroups'])->get();

    // Загружаем все записи расписания одним запросом, группируем по employee_id
    $schedules = \App\Models\Schedule::whereIn('employee_id', $employeesRaw->pluck('id'))
        ->whereBetween('date', [$startDate, $endDate])
        ->get()
        ->groupBy('employee_id');

    $codeMap = [
        'work' => '8',
        'shift_work' => 'Я',
        'vacation' => 'ОТ',
        'day_off' => 'В',
        'rest' => 'В',
        'shift_start' => 'Я',
        'shift_end' => 'Я',
    ];

    $employees = $employeesRaw->map(function (Employee $emp) use ($schedules, $codeMap) {
        // Строим schedule как plain ассоциативный массив ["Y-m-d" => "код"].
        //
        // НЕ используем ->pluck('shift_type', 'date') потому что:
        //   1. Поле date в модели может быть cast в Carbon — тогда ключ будет
        //      "2025-10-01 00:00:00" или timestamp, не совпадёт с month_meta[].key
        //   2. Eloquent-коллекция с числовыми ключами сериализуется Inertia
        //      как JSON-массив [], а не объект {} — JS получит undefined по ключу-дате.
        //
        // Явный foreach гарантирует строку "Y-m-d" как ключ и plain array на выходе.
        $empSchedule = [];
        foreach ($schedules->get($emp->id, collect()) as $record) {
            $dateKey = \Carbon\Carbon::parse($record->date)->format('Y-m-d');
            $empSchedule[$dateKey] = $codeMap[$record->shift_type] ?? $record->shift_type;
        }

        return [
            'id' => $emp->id,
            'name' => $emp->name,
            'personnel_number' => $emp->personnel_number,
            // Оба поля обязательны: id для группировки, объект для отображения имени
            'organisation_unit_id' => $emp->organisation_unit_id,
            'organisation_unit' => $emp->organisationUnit,
            'functional_groups' => $emp->functionalGroups,
            'is_rotation' => (bool)($emp->is_rotation ?? false),
            // (object) гарантирует сериализацию как JSON-объект даже если массив пустой
            'schedule' => (object)$empSchedule,
        ];
    });

    // ── Organisation units (полное дерево) ───────────────────────────────
    $organisationUnits = \App\Models\OrganisationUnit::with([
        'children',
        'allChildren',
    ])
        ->whereNull('parent_id')
        ->orderBy('name')
        ->get();

    return Inertia::render('Dashboard', [
        'month_meta' => $monthMeta,
        'employees' => $employees,
        'organisation_units' => $organisationUnits,
        'filters' => [
            'month' => $month,
            'year' => $year,
            'unit_id' => $request->input('unit_id') ? (int)$request->input('unit_id') : null,
            'search' => $request->input('search', ''),
        ],
    ]);
})->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
