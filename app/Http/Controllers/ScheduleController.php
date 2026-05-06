<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\OrganisationUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    const reverseCodeMap = [
        '8'  => 'work',
        'Я'  => 'shift_work',
        'ОТ' => 'vacation',
        'В'  => 'day_off',
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


        $employees = DB::table('employees as e')
            ->leftJoinSub(
                DB::table('schedules')
                    ->select('employee_id')
                    ->selectRaw("jsonb_object_agg(date, shift_type) as schedule_raw")
                    ->whereBetween('date', [$startDate, $endDate])
                    ->groupBy('employee_id'),
                's', 'e.id', '=', 's.employee_id'
            )
            ->leftJoin('organisation_units as ou', 'e.organisation_unit_id', '=', 'ou.id')
            ->leftJoinSub(
                DB::table('functional_groups as fg')
                    ->join('employee_functional_group as efg', 'fg.id', '=', 'efg.functional_group_id')
                    ->select('efg.employee_id')
                    ->selectRaw("jsonb_agg(fg.*) as groups_json")
                    ->groupBy('efg.employee_id'),
                'f', 'e.id', '=', 'f.employee_id'
            )
            ->select([
                'e.id', 'e.name', 'e.position', 'e.personnel_number', 'e.organisation_unit_id',
                'ou.name as ou_name',
                's.schedule_raw',
                'f.groups_json'
            ])
            ->get()
            ->map(function ($emp) {
                $rawSchedule = is_array($emp->schedule_raw)
                    ? $emp->schedule_raw
                    : json_decode($emp->schedule_raw ?? '{}', true);

                $mappedSchedule = [];
                foreach ($rawSchedule as $date => $type) {
                    $mappedSchedule[$date] = self::codeMap[$type] ?? $type;
                }

                return [
                    'id' => $emp->id,
                    'name' => $emp->name,
                    'position' => $emp->position,
                    'personnel_number' => $emp->personnel_number,
                    'organisation_unit_id' => $emp->organisation_unit_id,
                    'organisation_unit' => [
                        'name' => $emp->ou_name
                    ],
                    'functional_groups' => is_array($emp->groups_json)
                        ? $emp->groups_json
                        : json_decode($emp->groups_json ?? '[]', true),
                    'schedule' => (object)$mappedSchedule,
                ];
            });

        $organisationUnits = \App\Models\OrganisationUnit::with(['children','allChildren'])
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(function ($unit) {
                $collectIds = function ($u) use (&$collectIds) {
                    $ids = [$u->id];
                    foreach ($u->allChildren as $child) {
                        $ids = array_merge($ids, $collectIds($child));
                    }
                    return $ids;
                };

                $unit->all_children_ids = $collectIds($unit);
                return $unit;
            });

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

    public function saveSchedule (Request $request) {
        $data = $request->validate([
            '*.empId'  => ['required', 'integer', 'exists:employees,id'],
            '*.dayKey' => ['required', 'date'],
            '*.code'   => ['required', 'string'],
        ]);

        DB::beginTransaction();

        try {
            foreach ($data as $item) {
                $employeeId = $item['empId'];
                $date       = $item['dayKey'];
                $code       = $item['code'];

                $shiftType = self::reverseCodeMap[$code] ?? null;

                if (!$shiftType) {
                    continue;
                }

                \App\Models\Schedule::updateOrCreate(
                    [
                        'employee_id' => $employeeId,
                        'date' => $date,
                    ],
                    [
                        'shift_type' => $shiftType,
                        'is_manual' => true,
                        'is_draft' => false,
                        'source' => 'manual',
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
