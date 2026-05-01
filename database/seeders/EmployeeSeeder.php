<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\FunctionalGroup;
use App\Models\OrganisationUnit;
use App\Models\Schedule;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (FunctionalGroup::count() === 0) {
            FunctionalGroup::create(['name' => 'Программисты', 'min_presence_percent' => 40]);
            FunctionalGroup::create(['name' => 'Сварщики', 'min_presence_percent' => 40]);
        }

        $topUnits = OrganisationUnit::factory()->count(3)->create();

        $topUnits->each(function ($unit) {
            OrganisationUnit::factory()
                ->count(rand(2, 4))
                ->child($unit->id)
                ->create();
        });

        Employee::factory()->count(500)->create()->each(function ($employee) {
            if (rand(1, 3) == 1) {
                $group = FunctionalGroup::inRandomOrder()->first();
                if ($group) {
                    $employee->functionalGroups()->attach($group->id);
                }
            }
        });

        $startDate = now()->subMonths(3)->startOfMonth();
        $endDate = now()->endOfMonth();

        foreach (Employee::all() as $employee) {
            $currentDate = $startDate->copy();

            while ($currentDate <= $endDate) {
                $shiftType = 'work';

                // Логика для 5/2 (суббота и воскресенье - выходные)
                if ($employee->work_type === '5/2') {
                    if ($currentDate->isWeekend()) {
                        $shiftType = 'day_off';
                    }
                } // Логика для вахты (упрощенно для сида: первые 15 дней месяца - работа)
                else {
                    $shiftType = ($currentDate->day <= 15) ? 'shift_work' : 'rest';
                    if ($currentDate->day == 1) $shiftType = 'shift_start';
                    if ($currentDate->day == 15) $shiftType = 'shift_end';
                }

                Schedule::create([
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
}
