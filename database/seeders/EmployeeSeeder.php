<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $groupNames = ['Программисты', 'Сварщики', 'Механики', 'Охрана', 'Инженеры'];
        foreach ($groupNames as $name) {
            \App\Models\FunctionalGroup::firstOrCreate(['name' => $name], ['min_presence_percent' => rand(30, 60)]);
        }

        $allGroups = \App\Models\FunctionalGroup::all();
        $topUnits = \App\Models\OrganisationUnit::factory()->count(3)->create();

        $topUnits->each(function ($unit) use ($allGroups) {
            $subUnits = \App\Models\OrganisationUnit::factory()
                ->count(rand(2, 4))
                ->child($unit->id)
                ->create();

            \App\Models\Employee::factory()->count(100)->create([
                'organisation_unit_id' => $unit->id
            ])->each(function ($emp) use ($allGroups) {
                $this->assignGroupAndSchedule($emp, $allGroups);
            });

            foreach ($subUnits as $sub) {
                \App\Models\Employee::factory()->count(50)->create([
                    'organisation_unit_id' => $sub->id
                ])->each(function ($emp) use ($allGroups) {
                    $this->assignGroupAndSchedule($emp, $allGroups);
                });
            }
        });
    }

    private function assignGroupAndSchedule($employee, $allGroups)
    {
        // Назначаем группу
        if (rand(1, 2) == 1) {
            $employee->functionalGroups()->attach($allGroups->random()->id);
        }

        $startDate = now()->startOfMonth(); // Для примера текущий месяц
        $endDate = $startDate->copy()->endOfMonth();

        // Логика отпуска (раз в месяц на 5 дней с шансом 10%)
        $vacationStart = rand(1, 20);
        $hasVacation = rand(1, 10) === 1;

        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $day = $currentDate->day;
            $shiftType = 'work';

            if ($hasVacation && $day >= $vacationStart && $day < $vacationStart + 5) {
                $shiftType = 'vacation';
            } elseif ($employee->work_type === '5/2') {
                $shiftType = $currentDate->isWeekend() ? 'day_off' : 'work';
            } else {
                $cycleDay = $day % 4; // 2 через 2
                if ($cycleDay === 1) $shiftType = 'shift_start';
                elseif ($cycleDay === 2) $shiftType = 'shift_end'; // допустим, короткая смена
                elseif ($cycleDay === 0) $shiftType = 'day_off';
                else $shiftType = 'work';
            }

            \App\Models\Schedule::create([
                'employee_id' => $employee->id,
                'date' => $currentDate->format('Y-m-d'),
                'shift_type' => $shiftType,
                'is_draft' => false,
                'source' => 'system'
            ]);
            $currentDate->addDay();
        }
    }
}
