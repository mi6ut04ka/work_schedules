<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    const codeMap = [
        'work' => '8',
        'shift_work' => 'Я',
        'vacation' => 'ОТ',
        'day_off' => 'В',
        'rest' => 'В',
        'shift_start' => 'Я',
        'shift_end' => 'Я',
    ];
    public function index (Request $request) {
        $month = (int)$request->input('month', now()->month);
        $year = (int)$request->input('year', now()->year);

        $startDate = \Carbon\Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

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

        $employeesRaw = Employee::with(['organisationUnit', 'functionalGroups'])->get();

        $schedules = \App\Models\Schedule::whereIn('employee_id', $employeesRaw->pluck('id'))
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->groupBy('employee_id');

        $employees = $employeesRaw->map(function (Employee $emp) use ($schedules) {
            $empSchedule = [];
            foreach ($schedules->get($emp->id, collect()) as $record) {
                $dateKey = \Carbon\Carbon::parse($record->date)->format('Y-m-d');
                $empSchedule[$dateKey] = self::codeMap[$record->shift_type] ?? $record->shift_type;
            }

            return [
                'id' => $emp->id,
                'name' => $emp->name,
                'personnel_number' => $emp->personnel_number,
                'organisation_unit_id' => $emp->organisation_unit_id,
                'organisation_unit' => $emp->organisationUnit,
                'functional_groups' => $emp->functionalGroups,
                'schedule' => (object)$empSchedule,
            ];
        });

        $organisationUnits = \App\Models\OrganisationUnit::with(['children','allChildren'])
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('Dashboard/Dashboard', [
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
    }
}
